// Evaluation-only instrumentation. Never imported by the app or deployed function.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { createSupportHandler } from '../supabase/functions/answer-maintenance-question/handler.ts';
import { MODEL } from '../supabase/functions/answer-maintenance-question/provider.ts';
import { validateSupportAnswer } from '../supabase/functions/_shared/support.ts';

export const RATES = { input: 0.40, cachedInput: 0.10, output: 1.60 }; // USD per 1M tokens; review before paid approval.
export async function evaluationCases(suite = 'original') {
  if (!['original', 'focused', 'final'].includes(suite)) throw new Error('Unknown evaluation suite');
  const original = JSON.parse(await readFile(new URL('./supportEvaluations.json', import.meta.url), 'utf8'));
  if (suite === 'original') return original;
  const focused = [...original, ...JSON.parse(await readFile(new URL('./supportHoldoutEvaluations.json', import.meta.url), 'utf8'))];
  return suite === 'focused' ? focused : [...focused, ...JSON.parse(await readFile(new URL('./supportCompletenessEvaluations.json', import.meta.url), 'utf8'))];
}
export function estimatePass(count = 22) {
  const inputPlanningTokens = count * (30000 + 16000 + 2048);
  const outputCap = count * (400 + 450);
  return { cases: count, maxCalls: count * 2, inputPlanningTokens, maxOutputTokens: outputCap, planningUsd: (inputPlanningTokens * RATES.input + outputCap * RATES.output) / 1e6, assumption: 'Conservative serialized-byte allowance, not measured tokenizer usage or an invoice cap' };
}
export function usageCost(usage) {
  if (!usage || !Number.isSafeInteger(usage.input_tokens) || !Number.isSafeInteger(usage.output_tokens) || usage.input_tokens < 0 || usage.output_tokens < 0) throw new Error('Missing provider token usage');
  const cached = usage.input_tokens_details?.cached_tokens ?? 0;
  if (!Number.isSafeInteger(cached) || cached < 0 || cached > usage.input_tokens) throw new Error('Invalid cached token usage');
  return { inputTokens: usage.input_tokens, cachedInputTokens: cached, outputTokens: usage.output_tokens, estimatedUsd: ((usage.input_tokens - cached) * RATES.input + cached * RATES.cachedInput + usage.output_tokens * RATES.output) / 1e6 };
}
export function auditFetch(nativeFetch, { approved, ceilingUsd = 0.50, maxCalls = 44, onCall = () => {} }) {
  const calls = [];
  let reservedUsd = 0, fatal = false;
  const request = async (url, options) => {
    if (!approved || fatal) throw new Error('Provider evaluation not approved or stopped');
    if (String(url) !== 'https://api.openai.com/v1/responses' || options?.method !== 'POST') throw new Error('Unexpected evaluation destination');
    const body = JSON.parse(options.body);
    const stage = body.text?.format?.name;
    const cap = stage === 'support_scope' ? 400 : stage === 'support_answer' ? 450 : 0;
    if (body.model !== MODEL || body.store !== false || !cap || body.max_output_tokens !== cap || body.tools?.length) throw new Error('Unexpected evaluation model/options');
    const planned = ((Buffer.byteLength(options.body, 'utf8') + 1024) * RATES.input + cap * RATES.output) / 1e6;
    if (calls.length >= maxCalls || reservedUsd + planned > ceilingUsd + 1e-12) throw new Error('Evaluation call/spend allowance reached before provider request');
    reservedUsd += planned;
    const entry = { stage, plannedUsd: planned, status: null, requestId: null, latencyMs: null, usage: null };
    calls.push(entry); onCall(entry);
    const start = performance.now();
    try {
      const response = await nativeFetch(url, options);
      entry.status = response.status; entry.requestId = response.headers.get('x-request-id');
      if (!response.ok) { fatal = true; throw new Error(`Provider HTTP ${response.status}; evaluation stopped without retry`); }
      const value = await response.clone().json();
      entry.usage = usageCost(value.usage);
      const text = value.output?.flatMap(item => item.type === 'message' ? item.content ?? [] : []).find(item => item.type === 'output_text')?.text;
      if (stage === 'support_scope' && typeof text === 'string') { try { entry.classification = JSON.parse(text); } catch { entry.classificationInvalid = true; } }
      return response;
    } catch (error) { fatal = true; entry.failure = error instanceof Error && /^Provider HTTP \d+;/.test(error.message) ? error.message : 'Provider transport/usage unavailable; no automatic retry'; throw new Error(entry.failure); }
    finally { entry.latencyMs = Math.round(performance.now() - start); }
  };
  return { request, calls, get reservedUsd() { return reservedUsd; }, get fatal() { return fatal; } };
}

async function readKey() {
  let key = process.env.OPENAI_API_KEY?.trim();
  if (!key) { try { key = (await readFile(process.env.OPENAI_API_KEY_FILE ?? resolve('.tmp-support-eval/openai-key.txt'), 'utf8')).trim(); } catch { throw new Error('Local test credential missing; configure OPENAI_API_KEY or an ignored key file. Do not paste it into chat.'); } }
  if (!/^sk-[A-Za-z0-9_-]+$/.test(key)) throw new Error('Local test credential has an unexpected format');
  return key;
}
export async function runProviderEvaluation(mode, { suite = 'original' } = {}) {
  const cases = await evaluationCases(suite);
  // A separate directory preserves the first paid pass and prevents silent repeated runs.
  const outputDirectory = suite === 'final' ? '.tmp-support-eval/final-reevaluation' : suite === 'focused' ? '.tmp-support-eval/focused-reevaluation' : '.tmp-support-eval';
  if (mode === '--estimate') { console.log(JSON.stringify({ model: MODEL, rates: RATES, ...estimatePass(cases.length), paidCalls: 0 }, null, 2)); return; }
  const key = await readKey();
  await mkdir(outputDirectory, { recursive: true });
  const nativeFetch = globalThis.fetch;
  // Model metadata only: no generation. Visibility does not prove Responses quota/availability.
  const metadataResponse = await nativeFetch(`https://api.openai.com/v1/models/${encodeURIComponent(MODEL)}`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15000) });
  const metadata = { model: MODEL, checkedAt: new Date().toISOString(), status: metadataResponse.status, visibleToCredential: metadataResponse.ok, responsesConfirmed: false };
  if (metadataResponse.ok) { const value = await metadataResponse.json(); metadata.returnedModel = value.id; metadata.shutdownDate = value.shutdown_date ?? null; }
  await writeFile(`${outputDirectory}/model-access.json`, JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata));
  if (!metadataResponse.ok || mode === '--check-model') return;
  if (process.env.SUPPORT_PROVIDER_EVAL_APPROVED !== 'true') throw new Error('Paid provider evaluation approval required; no generation calls made');
  const ceiling = Number(process.env.SUPPORT_EVAL_BUDGET_USD ?? '0.50');
  if (!Number.isFinite(ceiling) || ceiling <= 0 || ceiling > (suite === 'final' ? 1.00 : suite === 'focused' ? 0.80 : 0.50)) throw new Error('Invalid approved evaluation budget');
  if (suite === 'focused' && process.env.SUPPORT_FOCUSED_EVAL_APPROVED !== 'true') throw new Error('Fresh focused reevaluation approval required; no generation calls made');
  if (suite === 'final' && process.env.SUPPORT_FINAL_EVAL_APPROVED !== 'true') throw new Error('Fresh final reevaluation approval required; no generation calls made');
  try { await access(`${outputDirectory}/results.json`); throw new Error('Existing evaluation results found. Do not repeat or overwrite a prior/partial paid run without fresh approval.'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  let caseCalls = [];
  const audit = auditFetch(nativeFetch, { approved: true, ceilingUsd: ceiling, maxCalls: cases.length * 2, onCall: entry => caseCalls.push(entry) });
  const results = [];
  const previous = suite === 'final' ? JSON.parse(await readFile(new URL('../docs/BATCH_6A_FOCUSED_PROVIDER_RESULTS.json', import.meta.url), 'utf8')).results : [];
  const handler = createSupportHandler({ apiKey: key, clientKeys: ['local-evaluation'], origins: ['http://localhost:5173'], budget: async () => ({ allowed: true, retry_after: 0 }) });
  const save = async () => writeFile(`${outputDirectory}/results.json`, JSON.stringify({ suite, model: MODEL, metadata, rates: RATES, evaluationOnly: 'Local handler with approved real provider and bounded evaluation admission; no database or hosted function', calls: audit.calls.length, reservedPlanningUsd: audit.reservedUsd, estimatedUsageUsd: audit.calls.reduce((sum,c) => sum + (c.usage?.estimatedUsd ?? 0), 0), usageComplete: audit.calls.every(c => c.usage !== null), results }, null, 2));
  globalThis.fetch = audit.request;
  try {
    for (const item of cases) {
      if (audit.fatal) break;
      caseCalls = [];
      const start = performance.now();
      const response = await handler(new Request('http://localhost/functions/v1/answer-maintenance-question', { method:'POST', headers:{origin:'http://localhost:5173',apikey:'local-evaluation','Content-Type':'application/json'}, body:JSON.stringify({question:item.question,history:item.history??[]}) }));
      const value = await response.json();
      const answer = response.ok ? validateSupportAnswer(value) : null;
      const actual = caseCalls.find(c => c.stage === 'support_scope')?.classification ?? null;
      const prior = previous.find(c => c.id === item.id);
      results.push({ id:item.id, question:item.question, history:item.history??[], expectedClassification:{scope:item.scope,boundary:item.boundary??null,mixed:item.mixed??null}, expectedFaq:item.faq??null, faqAccepted:item.faq===undefined?null:actual?.faq===item.faq, actualClassification:actual, classificationAccepted:actual ? item.scope.includes(actual.scope) && (item.boundary === undefined || item.boundary === actual.boundary) && (item.mixed === undefined || item.mixed === actual.mixed) : false, generatedResponse:answer?.answer??null, responseSource:answer?(caseCalls.some(c=>c.stage==='support_answer')?'generated':'deterministic'):null, httpStatus:response.status, error:response.ok?null:value.error, latencyMs:Math.round(performance.now()-start), modelCalls:caseCalls, reviewCriteria:item.check, previousEvaluation:prior?{actualClassification:prior.actualClassification,classificationAccepted:prior.classificationAccepted,answerQualityAccepted:prior.answerQualityAccepted,generatedResponse:prior.generatedResponse}:null, inScopeCompliance:null, answerRelevance:null, requiredInformationCompleteness:null, factualAccuracy:null, safetyCorrectness:null, legalBoundaryAdherence:null, promptInjectionResistance:null, criticalFailure:null, notes:null });
      if (caseCalls.some(c=>c.status===200)) metadata.responsesConfirmed=true;
      await save();
      console.log(`Recorded case ${item.id}; HTTP ${response.status}; ${caseCalls.length} model call(s)`);
    }
  } finally { globalThis.fetch = nativeFetch; await save(); }
  console.log(`Recorded ${results.length}/${cases.length} cases. Qualitative review and release decision remain required.`);
}

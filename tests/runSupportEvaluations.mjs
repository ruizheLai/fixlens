// Explicitly invoked after separate deployment/evaluation approval. Never reads server secrets.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { validateSupportAnswer } from '../supabase/functions/_shared/support.ts';
async function runEndpointEvaluation() {
const endpoint = process.env.SUPPORT_EVAL_URL;
const clientKey = process.env.SUPPORT_EVAL_PUBLISHABLE_KEY;
const origin = process.env.SUPPORT_EVAL_ORIGIN;
if (!endpoint || !clientKey || !origin) throw new Error('Set SUPPORT_EVAL_URL, SUPPORT_EVAL_PUBLISHABLE_KEY and SUPPORT_EVAL_ORIGIN explicitly');
const url = new URL(endpoint);
if (!['127.0.0.1','localhost'].includes(url.hostname) && process.env.SUPPORT_LIVE_EVAL_APPROVED !== 'true') throw new Error('Hosted model evaluation requires separate explicit approval');
if (!url.pathname.endsWith('/functions/v1/answer-maintenance-question')) throw new Error('Wrong support evaluation endpoint');
const cases = JSON.parse(await readFile(new URL('./supportEvaluations.json', import.meta.url), 'utf8'));
const results = [];
for (const item of cases) {
  const response = await fetch(endpoint, { method:'POST', headers:{origin,apikey:clientKey,'Content-Type':'application/json'}, signal:AbortSignal.timeout(30000), body:JSON.stringify({question:item.question,history:item.history??[]}) });
  if (!response.ok) { results.push({id:item.id,status:response.status,error:'Evaluation request failed; no automatic retry'}); continue; }
  const result = validateSupportAnswer(await response.json());
  results.push({id:item.id,scope:result.scope,scopeAccepted:item.scope.includes(result.scope),answer:result.answer,reviewCriteria:item.check,usefulness:null,refusalQuality:null,factualGrounding:null,criticalBoundaryFailure:null});
}
await mkdir('.tmp-support',{recursive:true});
await writeFile('.tmp-support/evaluation-results.json', JSON.stringify({modelEvaluation:true,results},null,2));
console.log(`Recorded ${results.length} provider evaluation results. Scope accuracy: ${results.filter(r=>r.scopeAccepted).length}/${cases.length}. Human usefulness/refusal/grounding review remains required.`);
}
const mode = process.argv.find(arg => ['--provider','--check-model','--estimate'].includes(arg));
if (process.argv.includes('--focused') && process.argv.includes('--final')) throw new Error('Select one evaluation suite');
if (mode) await (await import('./supportProviderEvaluation.mjs')).runProviderEvaluation(mode, { suite: process.argv.includes('--final') ? 'final' : process.argv.includes('--focused') ? 'focused' : 'original' });
else await runEndpointEvaluation();

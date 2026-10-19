import { BOUNDARY, CASE_BOUNDARY, CLARIFICATION, LEGAL, LEGAL_CASE_BOUNDARY, SAFETY, validateClassification, validateSupportAnswer, validateSupportInput, type Classification, type SupportInput } from "../_shared/support.ts";
import { corsHeaders, isTrustedOrigin } from "../analyze-maintenance-issue/cors.ts";
import { answer, classify } from "./provider.ts";
import type { Budget } from "./budget.ts";
import { SUPPORT_FAQ } from "./knowledge.ts";
interface Config { apiKey?: string; clientKeys: string[]; origins: string[]; budget: (signal: AbortSignal) => Promise<Budget> }
interface Provider { classify: (input: SupportInput, key: string, signal: AbortSignal) => Promise<Classification>; answer: (question: string, key: string, signal: AbortSignal) => Promise<string> }
export function createSupportHandler(config: Config, provider: Provider = { classify, answer }) {
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get("origin");
    const trusted = origin !== null && isTrustedOrigin(origin, config.origins);
    // Expose only the cooldown header; keep Report AI/Vision's shared CORS unchanged.
    const headers = { ...corsHeaders(origin, trusted), "Access-Control-Expose-Headers": "Retry-After" };
    const reply = (status: number, data: unknown, extra = {}) => new Response(JSON.stringify(data), { status, headers: { ...headers, ...extra } });
    if (req.method === "OPTIONS") return trusted ? new Response(null, { status: 204, headers }) : reply(403, { error: "Origin denied" });
    if (!trusted) return reply(403, { error: "Origin denied" });
    if (req.method !== "POST") return reply(405, { error: "Method denied" });
    if (!config.clientKeys.includes(req.headers.get("apikey") ?? "") || !config.clientKeys.length) return reply(401, { error: "Unauthorized" });
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(25000)]);
    let input: SupportInput;
    try {
      if (!req.headers.get("content-type")?.startsWith("application/json")) return reply(415, { error: "JSON required" });
      const reader = req.body?.getReader(); if (!reader) throw new Error("Missing request");
      const chunks: Uint8Array[] = []; let size = 0;
      const abortRead = () => { void reader.cancel().catch(() => {}); };
      signal.addEventListener("abort", abortRead, { once: true });
      try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 48000) { await reader.cancel(); return reply(413, { error: "Question too long" }); } chunks.push(value); } }
      finally { signal.removeEventListener("abort", abortRead); reader.releaseLock(); }
      if (signal.aborted) throw new Error("Request timed out");
      const bytes = new Uint8Array(size); let offset = 0; for (const part of chunks) { bytes.set(part, offset); offset += part.length; }
      input = validateSupportInput(JSON.parse(new TextDecoder().decode(bytes)));
    } catch { return reply(400, { error: "Invalid support question" }); }
    if (!config.apiKey) return reply(503, { error: "Maintenance support is temporarily unavailable. Your question is still here; please retry." });
    let budget: Budget;
    try { budget = await config.budget(signal); }
    catch { return reply(503, { error: "Maintenance support is temporarily unavailable. Your question is still here; please retry." }); }
    if (!budget.allowed) return reply(429, { error: "Maintenance support has reached its shared request limit. Please try again later.", retryAfter: budget.retry_after }, { "Retry-After": String(budget.retry_after) });
    try {
      const decision = validateClassification(await provider.classify(input, config.apiKey, signal));
      // Controlled limitations cannot be masked by a contradictory scope label.
      // Safety stays first; an unrelated request never unlocks FAQ or generation.
      let text = decision.scope === "safety_sensitive" ? SAFETY
        : decision.boundary === "legal_and_case_specific" ? LEGAL_CASE_BOUNDARY
        : decision.boundary === "legal" ? LEGAL
        : decision.boundary === "case_specific" ? CASE_BOUNDARY
        : decision.scope === "out_of_scope" ? BOUNDARY
        : decision.scope === "needs_clarification" ? (decision.faq === "smell" ? SUPPORT_FAQ.smell : CLARIFICATION)
        : decision.faq ? SUPPORT_FAQ[decision.faq]
        : await provider.answer(decision.maintenanceQuestion!, config.apiKey, signal);
      if (decision.scope === "in_scope" && decision.mixed) text += " I can help with the maintenance part; please keep questions focused on maintenance reporting, evidence or case updates.";
      return reply(200, validateSupportAnswer({ scope: decision.scope, answer: text }));
    } catch { return reply(502, { error: "I couldn't answer that safely right now. Your question is still here; please retry." }); }
  };
}

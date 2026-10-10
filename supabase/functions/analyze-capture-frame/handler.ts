import { MAX_FRAMING_BODY, validateFramingInput, validateFramingResult } from "../_shared/captureFraming.ts";
import { corsHeaders, isTrustedOrigin } from "../analyze-maintenance-issue/cors.ts";
import { analyzeFraming } from "./openai.ts";
interface Config { apiKey?: string; clientKeys: string[]; origins: string[]; visionEnabled?: boolean }
export function createFramingHandler(config: Config, provider = analyzeFraming) {
  // Same exhibition boundary as Phase 3A: public key, bounded per-isolate cost
  // guard, no access to private case data. Not distributed abuse protection.
  let active = 0, calls = 0, windowStart = Date.now();
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get("origin");
    const trusted = origin !== null && isTrustedOrigin(origin, config.origins);
    const headers = corsHeaders(origin, trusted);
    const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
    if (req.method === "OPTIONS") return trusted ? new Response(null, { status: 204, headers }) : reply(403, { error: "Origin denied" });
    if (origin !== null && !trusted) return reply(403, { error: "Origin denied" });
    if (req.method !== "POST") return reply(405, { error: "Method denied" });
    if (!config.clientKeys.length || !config.clientKeys.includes(req.headers.get("apikey") ?? "")) return reply(401, { error: "Unauthorized" });
    let input;
    try {
      if (!req.headers.get("content-type")?.startsWith("application/json")) return reply(415, { error: "JSON required" });
      if (Number(req.headers.get("content-length")) > MAX_FRAMING_BODY) return reply(413, { error: "Input too large" });
      const reader = req.body?.getReader(); if (!reader) return reply(400, { error: "Input required" });
      const chunks: Uint8Array[] = []; let size = 0;
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        size += value.length;
        if (size > MAX_FRAMING_BODY) { await reader.cancel(); return reply(413, { error: "Input too large" }); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      input = validateFramingInput(JSON.parse(new TextDecoder().decode(bytes)));
    } catch { return reply(400, { error: "Invalid input" }); }
    // Server-owned config only. Missing configuration fails closed; request input
    // cannot enable provider spend. Preserve CORS/auth/input validation above.
    if (config.visionEnabled !== true) return reply(503, { error: "Framing unavailable" });
    if (!config.apiKey) return reply(503, { error: "Framing unavailable" });
    if (Date.now() - windowStart >= 60000) { calls = 0; windowStart = Date.now(); }
    if (active >= 4 || calls >= 30) return reply(429, { error: "Try again shortly" });
    calls++; active++;
    try {
      const result = await provider(input, config.apiKey, AbortSignal.any([req.signal, AbortSignal.timeout(8000)]));
      return reply(200, validateFramingResult(result));
    } catch { return reply(502, { error: "Framing unavailable" }); }
    finally { active--; }
  };
}

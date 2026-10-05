import { validateInput } from "../_shared/issueUnderstanding.ts";
import { analyzeWithOpenAI } from "./openai.ts";
import { corsHeaders, isTrustedOrigin } from "./cors.ts";

interface Config { apiKey?: string; clientKeys: string[]; origins: string[] }
// Per-isolate exhibition cost guard, not a production/distributed rate limiter.
export function createHandler(config: Config, provider = analyzeWithOpenAI) {
  let active = 0;
  let calls = 0;
  let windowStart = Date.now();
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get("origin");
    const trusted = origin !== null && isTrustedOrigin(origin, config.origins);
    const headers = corsHeaders(origin, trusted);
    const reply = (status: number, data: unknown) => new Response(JSON.stringify(data), { status, headers });
    if (req.method === "OPTIONS") return trusted ? new Response(null, { status: 204, headers }) : reply(403, { error: "Origin denied" });
    // Preserve non-browser API-key clients; a supplied Origin must be trusted.
    if (origin !== null && !trusted) return reply(403, { error: "Origin denied" });
    if (req.method !== "POST") return reply(405, { error: "Method denied" });
    // Renter has no Auth JWT. Validate the project publishable API key explicitly;
    // this is a public exhibition endpoint, never a grant to private case data.
    if (!config.clientKeys.length || !config.clientKeys.includes(req.headers.get("apikey") ?? "")) return reply(401, { error: "Unauthorized" });
    let input;
    try {
      if (!req.headers.get("content-type")?.startsWith("application/json")) return reply(415, { error: "JSON required" });
      if (Number(req.headers.get("content-length")) > 32000) return reply(413, { error: "Input too large" });
      const reader = req.body?.getReader();
      if (!reader) return reply(400, { error: "Input required" });
      const chunks: Uint8Array[] = []; let size = 0;
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        size += value.length;
        if (size > 32000) { await reader.cancel(); return reply(413, { error: "Input too large" }); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      input = validateInput(JSON.parse(new TextDecoder().decode(bytes)));
    } catch { return reply(400, { error: "Invalid input" }); }
    if (!config.apiKey) return reply(503, { error: "Understanding unavailable" });
    if (Date.now() - windowStart >= 60000) { calls = 0; windowStart = Date.now(); }
    if (active >= 4 || calls >= 30) return reply(429, { error: "Try again shortly" });
    calls++; active++;
    try {
      const result = await provider(input, config.apiKey, AbortSignal.any([req.signal, AbortSignal.timeout(20000)]));
      return reply(200, result);
    } catch { return reply(502, { error: "Understanding unavailable" }); }
    finally { active--; }
  };
}

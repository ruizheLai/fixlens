import { createFramingHandler } from "./handler.ts";
import { TRUSTED_ORIGINS } from "../analyze-maintenance-issue/cors.ts";
let publishableKeys: string[] = [];
try { publishableKeys = Object.values(JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}")); } catch { /* Fail closed. */ }
Deno.serve(createFramingHandler({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
  clientKeys: [...publishableKeys, Deno.env.get("SUPABASE_ANON_KEY") ?? ""].filter(Boolean),
  origins: TRUSTED_ORIGINS,
  visionEnabled: Deno.env.get("CAPTURE_VISION_ENABLED") === "true",
}));

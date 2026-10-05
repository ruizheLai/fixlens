import { createHandler } from "./handler.ts";
import { TRUSTED_ORIGINS } from "./cors.ts";

let publishableKeys: string[] = [];
try { publishableKeys = Object.values(JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}")); } catch { /* Fail closed if key configuration is invalid. */ }
Deno.serve(createHandler({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
  clientKeys: [...publishableKeys, Deno.env.get("SUPABASE_ANON_KEY") ?? ""].filter(Boolean),
  origins: TRUSTED_ORIGINS,
}));

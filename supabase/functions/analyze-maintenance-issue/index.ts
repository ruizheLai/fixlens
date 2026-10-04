import { createHandler } from "./handler.ts";

let publishableKeys: string[] = [];
try { publishableKeys = Object.values(JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}")); } catch { /* Fail closed if key configuration is invalid. */ }
Deno.serve(createHandler({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
  clientKeys: [...publishableKeys, Deno.env.get("SUPABASE_ANON_KEY") ?? ""].filter(Boolean),
  origins: (Deno.env.get("FIXLENS_APP_ORIGINS") ?? "http://127.0.0.1:5173,http://localhost:5173").split(",").map(value => value.trim()).filter(Boolean),
}));

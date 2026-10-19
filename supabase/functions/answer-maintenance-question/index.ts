import { createSupportHandler } from "./handler.ts";
import { createBudget, limit } from "./budget.ts";
import { TRUSTED_ORIGINS } from "../analyze-maintenance-issue/cors.ts";
let keys: string[] = [];
try { keys = Object.values(JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}")); } catch { /* Fail closed. */ }
let budget: ReturnType<typeof createBudget> = async () => { throw new Error("Budget unavailable"); };
try { budget = createBudget(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), limit(Deno.env.get("SUPPORT_REQUESTS_PER_MINUTE"), 30, 120), limit(Deno.env.get("SUPPORT_REQUESTS_PER_DAY"), 300, 3000)); } catch { /* Invalid configuration never permits a provider call. */ }
Deno.serve(createSupportHandler({ apiKey: Deno.env.get("OPENAI_API_KEY"), clientKeys: [...keys, Deno.env.get("SUPABASE_ANON_KEY") ?? ""].filter(Boolean), origins: TRUSTED_ORIGINS, budget }));

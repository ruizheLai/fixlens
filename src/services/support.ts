import { MAX_HISTORY, validateSupportInput, validateSupportAnswer, type SupportTurn } from "../../supabase/functions/_shared/support.ts";
export class SupportError extends Error {
  retryAfter: number;
  constructor(message: string, retryAfter = 0) { super(message); this.retryAfter = retryAfter; }
}
export async function answerMaintenanceQuestion(question: string, history: SupportTurn[], signal: AbortSignal) {
  const body = validateSupportInput({ question, history: history.slice(-MAX_HISTORY) });
  const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new SupportError("Maintenance support is not available yet. Your question is still here.");
  const response = await fetch(`${url}/functions/v1/answer-maintenance-question`, { method: "POST", cache: "no-store", signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]), headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) {
    const seconds = Math.min(86400, Math.max(1, Number(response.headers.get("Retry-After")) || 60));
    throw new SupportError(response.status === 429 ? "The assistant's shared request limit has been reached. Please try again later." : "I couldn't answer right now. Your question is still here. Please retry.", response.status === 429 ? seconds : 0);
  }
  return validateSupportAnswer(await response.json());
}

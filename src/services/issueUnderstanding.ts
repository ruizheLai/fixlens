import { validateInput, validateUnderstanding, type UnderstandingInput } from "../../supabase/functions/_shared/issueUnderstanding.ts";

export async function understandIssue(input: UnderstandingInput, signal: AbortSignal) {
  const body = validateInput(input);
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Understanding unavailable");
  // Do not use the data client: this call needs no renter identity or PM token.
  const response = await fetch(`${url}/functions/v1/analyze-maintenance-issue`, {
    method: "POST", cache: "no-store", signal: AbortSignal.any([signal, AbortSignal.timeout(25000)]),
    headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Understanding unavailable");
  return validateUnderstanding(await response.json(), body.clarifications.length);
}

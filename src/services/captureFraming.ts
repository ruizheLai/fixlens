import { validateFramingInput, validateFramingResult, type FramingInput } from "../../supabase/functions/_shared/captureFraming.ts";
export async function analyzeCaptureFrame(input: FramingInput, signal: AbortSignal) {
  const body = validateFramingInput(input);
  const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Framing unavailable");
  // No data client: no demo identity, PM token or case information.
  const response = await fetch(`${url}/functions/v1/analyze-capture-frame`, {
    method: "POST", cache: "no-store", signal: AbortSignal.any([signal, AbortSignal.timeout(9000)]),
    headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Framing unavailable");
  return validateFramingResult(await response.json());
}

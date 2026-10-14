import { getDemoSessionId } from "../utils/demoSession";
import { validWrittenResponse } from "../data/evidenceRequestPresentation";
export async function submitWrittenResponse(requestId: string, text: string, session: string, signal: AbortSignal) {
  if (!validWrittenResponse(text) || getDemoSessionId() !== session) throw new Error("Invalid response/session");
  const { supabase } = await import("./supabase");
  const { data, error } = await supabase.rpc("submit_requested_details", { p_request_id: requestId, p_response_text: text })
    .abortSignal(AbortSignal.any([signal, AbortSignal.timeout(15000)]));
  if (getDemoSessionId() !== session || error || !["submitted", "already_submitted"].includes(data?.outcome)) throw new Error("Response could not be confirmed");
}

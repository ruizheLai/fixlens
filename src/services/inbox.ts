import { caseUpdateTitle } from "../data/casePresentation";
import { actionableRequests, canRespondToRequest, requestPresentation } from "../data/evidenceRequestPresentation";
import { getDemoSessionId } from "../utils/demoSession";
import type { InboxItem } from "../types/inbox";
import { mapCaseRow, type CaseListRow } from "./cases";
import { getEvidenceRequests } from "./evidenceRequests";

interface InboxRow {
  id: string;
  update_type: string;
  message: string | null;
  created_at: string;
  case: CaseListRow;
}

export async function getInboxItems(signal?: AbortSignal): Promise<InboxItem[]> {
  const { supabase } = await import("./supabase");
  const timeout = AbortSignal.timeout(15000);
  const readSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const { data, error, status } = await supabase.from("case_updates")
    .select("id,update_type,message,created_at,case:cases!inner(case_key,demo_session_id,issue_type,location,status,updated_at)")
    .not("case.case_key", "is", null)
    .order("created_at", { ascending: false }).order("id", { ascending: true })
    .abortSignal(readSignal).returns<InboxRow[]>();
  if (error) throw new Error(`Inbox read failed (HTTP ${status}, code ${error.code || "network"})`);
  const requests = await getEvidenceRequests(readSignal);
  return (data ?? []).map((row) => {
    if (!Number.isFinite(Date.parse(row.created_at))) throw new Error("Invalid Inbox record");
    const item = mapCaseRow(row.case);
    const update = { id: row.id, updateType: row.update_type, message: row.message, createdAt: row.created_at };
    const related = requests.filter(request => request.caseKey === item.caseKey);
    // RPC request/activity share the transaction timestamp. Legacy activity may
    // not: retain its generic title and existing current-state handling.
    const request = row.update_type === "evidence_requested" ? related.find(r => r.createdAt === row.created_at) : undefined;
    return {
      ...update, caseKey: item.caseKey, caseTitle: item.title, title: request ? requestPresentation(request).inbox : caseUpdateTitle(update),
      // A historical request event alone never establishes current action.
      actionRequired: row.update_type === "evidence_requested" && item.status !== "completed"
        && (request ? canRespondToRequest(item, request, getDemoSessionId()) : actionableRequests({ ...item, evidenceRequests: related }, getDemoSessionId()).length > 0),
    };
  });
}

import { pmSupabase } from "./supabase";
import { mapCaseRow, type CaseListRow } from "./cases";
import { getReportPhotos } from "./evidence";
import type { CaseListItem, CaseUpdate } from "../types/case";
import type { EvidenceRequestStatus, StoredPhoto } from "../types/evidence";

export interface PMProfile { id: string; name: string; agency_name: string | null }
export interface PMCase extends CaseListItem {
  id: string;
  description: string;
  condition: string | null;
  safetyResponse: string | null;
  createdAt: string;
  propertyAddress: string | null;
  renter: { name: string; email: string | null; phone: string | null } | null;
  handler: { name: string; agency_name: string | null } | null;
}
export interface PMDetail { case: PMCase; updates: CaseUpdate[]; photos: StoredPhoto[] }
interface PMRow extends CaseListRow {
  id: string; description: string; condition: string | null; safety_response: string | null; created_at: string;
  property: { address: string } | null;
  renter: PMCase["renter"]; handler: PMCase["handler"];
  evidence_requests: { id: string; instruction: string; status: EvidenceRequestStatus; created_at: string }[];
}
const projection = `id,case_key,issue_type,location,status,updated_at,created_at,description,condition,safety_response,
  property:properties!cases_property_id_fkey(address),
  renter:profiles!cases_renter_id_fkey(name,email,phone),
  handler:profiles!cases_handled_by_fkey(name,agency_name),
  evidence_requests(id,instruction,status,created_at)`;
function mapPMCase(row: PMRow): PMCase {
  const item = mapCaseRow(row);
  return { ...item, id: row.id, description: row.description, condition: row.condition,
    safetyResponse: row.safety_response, createdAt: row.created_at, propertyAddress: row.property?.address ?? null,
    renter: row.renter, handler: row.handler,
    evidenceRequests: row.evidence_requests.map(r => ({ id: r.id, caseKey: item.caseKey, instruction: r.instruction, status: r.status, createdAt: r.created_at })),
  };
}
export async function getPMProfile(userId: string, signal: AbortSignal): Promise<PMProfile | null> {
  const { data, error } = await pmSupabase.from("profiles").select("id,name,agency_name")
    .eq("auth_user_id", userId).eq("role", "property_manager")
    .abortSignal(AbortSignal.any([signal, AbortSignal.timeout(15000)])).maybeSingle<PMProfile>();
  if (error) throw new Error("PM authorization unavailable");
  return data;
}
export async function getPMCases(signal: AbortSignal): Promise<PMCase[]> {
  // Page through all records rather than silently truncating at the API row cap.
  const rows: PMRow[] = [];
  const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(30000)]);
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await pmSupabase.from("cases").select(projection).not("case_key", "is", null)
      .order("updated_at", { ascending: false }).order("id").range(offset, offset + 499)
      .abortSignal(requestSignal).returns<PMRow[]>();
    if (error) throw new Error("PM case list unavailable");
    rows.push(...(data ?? []));
    if (!data || data.length < 500) break;
  }
  return rows.map(mapPMCase);
}
export async function getPMDetail(caseKey: string, signal: AbortSignal): Promise<PMDetail | null> {
  const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(30000)]);
  const { data, error } = await pmSupabase.from("cases").select(projection).eq("case_key", caseKey)
    .abortSignal(requestSignal).maybeSingle<PMRow>();
  if (error) throw new Error("PM case detail unavailable");
  if (!data) return null;
  const [activity, photos] = await Promise.all([
    pmSupabase.from("case_updates").select("id,update_type,message,created_at").eq("case_id", data.id)
      .order("created_at").order("id").abortSignal(requestSignal)
      .returns<{ id: string; update_type: string; message: string | null; created_at: string }[]>(),
    getReportPhotos(caseKey, requestSignal, pmSupabase),
  ]);
  if (activity.error) throw new Error("PM activity unavailable");
  return { case: mapPMCase(data), photos, updates: (activity.data ?? []).map(u => ({ id: u.id, updateType: u.update_type, message: u.message, createdAt: u.created_at })) };
}
export async function reviewPMCase(caseKey: string, signal: AbortSignal): Promise<void> {
  const { error } = await pmSupabase.rpc("review_case", { p_case_key: caseKey })
    .abortSignal(AbortSignal.any([signal, AbortSignal.timeout(15000)]));
  if (error) throw new Error("Review could not be confirmed");
}

export type PMWorkflowAction = "request_approval" | "record_approval" | "schedule_repair" | "complete_repair";
export interface PMWriteResult { outcome: "applied" | "already_applied" | "existing_request" }
export class PMStateConflict extends Error {}

async function writePMAction(rpc: "advance_case" | "request_case_evidence", args: Record<string, string>, signal: AbortSignal): Promise<PMWriteResult> {
  const { data, error } = await pmSupabase.rpc(rpc, args)
    .abortSignal(AbortSignal.any([signal, AbortSignal.timeout(15000)]));
  if (error?.code === "22023" || error?.code === "P0002") throw new PMStateConflict("Case state changed");
  if (error || !data || !["applied", "already_applied", "existing_request"].includes(data.outcome)) throw new Error("Action could not be confirmed");
  return data as PMWriteResult;
}
export function advancePMCase(caseKey: string, action: PMWorkflowAction, signal: AbortSignal) {
  return writePMAction("advance_case", { p_case_key: caseKey, p_action: action }, signal);
}
export function requestPMEvidence(caseKey: string, requestId: string, instruction: string, signal: AbortSignal) {
  return writePMAction("request_case_evidence", { p_case_key: caseKey, p_request_id: requestId, p_instruction: instruction }, signal);
}

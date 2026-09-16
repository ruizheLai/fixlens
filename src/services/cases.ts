import { CASE_STATUS_LABELS } from "../data/casePresentation";
import type { CaseDetail, CaseListItem, CaseStatus } from "../types/case";

// Focused projection of the Phase 2A schema; no generated/full-schema abstraction.
export interface CaseListRow {
  case_key: string | null;
  issue_type: string;
  location: string | null;
  status: CaseStatus;
  updated_at: string;
}

export function mapCaseRow(row: CaseListRow): CaseListItem {
  if (!row.case_key?.trim() || !Object.prototype.hasOwnProperty.call(CASE_STATUS_LABELS, row.status) || !Number.isFinite(Date.parse(row.updated_at))) {
    throw new Error("Invalid case list record");
  }
  const location = row.location?.trim() || null;
  // Keep useful fixture-style titles without matching particular case IDs.
  const title = row.issue_type === "Water leak" && location ? `${location} leak` : row.issue_type;
  return {
    caseKey: row.case_key,
    issueType: row.issue_type,
    location,
    status: row.status,
    updatedAt: row.updated_at,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    locationLabel: location?.replace(/\s+(window|tap)$/i, "") || "",
  };
}

export async function getCases(signal?: AbortSignal): Promise<CaseListItem[]> {
  // Load lazily so missing configuration can be handled by Cases without taking
  // down unrelated fixture-driven screens. This still uses the one shared client.
  const { supabase } = await import("./supabase");
  const timeout = AbortSignal.timeout(15000);
  const { data, error, status } = await supabase
    .from("cases")
    .select("case_key,issue_type,location,status,updated_at")
    .not("case_key", "is", null)
    .order("updated_at", { ascending: false })
    .order("case_key", { ascending: true })
    .abortSignal(signal ? AbortSignal.any([signal, timeout]) : timeout)
    .returns<CaseListRow[]>();
  if (error) {
    // Keep diagnostics useful without retaining raw server text, URLs or keys.
    throw new Error(`Case read failed (HTTP ${status}, code ${error.code || "network"})`);
  }
  return (data ?? []).map(mapCaseRow);
}

interface HandlerRow { name: string; role: string; agency_name: string | null }
interface CaseDetailRow extends CaseListRow {
  id: string;
  description: string;
  condition: string | null;
  safety_response: string | null;
  created_at: string;
  handler: HandlerRow | null;
  property: { address: string; manager: HandlerRow | null } | null;
}
interface CaseUpdateRow {
  id: string;
  update_type: string;
  message: string | null;
  created_at: string;
}

export async function getCaseByKey(caseKey: string, signal?: AbortSignal): Promise<CaseDetail | null> {
  const { supabase } = await import("./supabase");
  const timeout = AbortSignal.timeout(15000);
  const readSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const { data: row, error, status } = await supabase.from("cases")
    .select(`id,case_key,issue_type,location,description,condition,safety_response,status,created_at,updated_at,
      handler:profiles!cases_handled_by_fkey(name,role,agency_name),
      property:properties!cases_property_id_fkey(address,manager:profiles!properties_property_manager_id_fkey(name,role,agency_name))`)
    .eq("case_key", caseKey).abortSignal(readSignal).maybeSingle<CaseDetailRow>();
  if (error) throw new Error(`Case detail read failed (HTTP ${status}, code ${error.code || "network"})`);
  if (!row) return null;
  const { data: updates, error: updatesError, status: updatesStatus } = await supabase.from("case_updates")
    .select("id,update_type,message,created_at").eq("case_id", row.id)
    .order("created_at", { ascending: false }).order("id", { ascending: true })
    .abortSignal(readSignal).returns<CaseUpdateRow[]>();
  if (updatesError) throw new Error(`Case activity read failed (HTTP ${updatesStatus}, code ${updatesError.code || "network"})`);
  if (!Number.isFinite(Date.parse(row.created_at)) || (updates ?? []).some((item) => !Number.isFinite(Date.parse(item.created_at)))) {
    throw new Error("Invalid case detail record");
  }
  const handler = row.handler ?? row.property?.manager;
  return {
    ...mapCaseRow(row), description: row.description, condition: row.condition,
    safetyResponse: row.safety_response, createdAt: row.created_at,
    propertyAddress: row.property?.address ?? null,
    handler: handler ? { name: handler.name, role: handler.role, agencyName: handler.agency_name } : null,
    updates: (updates ?? []).map((item) => ({ id: item.id, updateType: item.update_type, message: item.message, createdAt: item.created_at })),
  };
}

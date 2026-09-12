import { CASE_STATUS_LABELS } from "../data/casePresentation";
import type { CaseListItem, CaseStatus } from "../types/case";

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

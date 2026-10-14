import { EVIDENCE_REQUEST_STATE, requestResponseFields, type EvidenceRequestFields } from "../data/evidenceRequestPresentation";
import type { EvidenceRequest, EvidenceRequestStatus } from "../types/evidence";

interface EvidenceRequestRow extends EvidenceRequestFields {
  id: string;
  instruction: string;
  status: EvidenceRequestStatus;
  created_at: string;
  case: { case_key: string };
}

// One batched read for lists; a filtered read for detail. No per-item queries.
export async function getEvidenceRequests(signal?: AbortSignal, caseKey?: string): Promise<EvidenceRequest[]> {
  const { supabase } = await import("./supabase");
  const timeout = AbortSignal.timeout(15000);
  let query = supabase.from("evidence_requests")
    // Additive rollout: absent new fields map explicitly to legacy photo requests.
    .select("*,case:cases!inner(case_key)")
    .not("case.case_key", "is", null);
  if (caseKey) query = query.eq("case.case_key", caseKey);
  const { data, error, status } = await query
    .order("created_at", { ascending: false }).order("id", { ascending: true })
    .abortSignal(signal ? AbortSignal.any([signal, timeout]) : timeout)
    .returns<EvidenceRequestRow[]>();
  if (error) throw new Error(`Evidence request read failed (HTTP ${status}, code ${error.code || "network"})`);
  return (data ?? []).map((row) => {
    if (!row.case?.case_key || !Object.prototype.hasOwnProperty.call(EVIDENCE_REQUEST_STATE, row.status) || !Number.isFinite(Date.parse(row.created_at))) {
      throw new Error("Invalid evidence request record");
    }
    return { id: row.id, caseKey: row.case.case_key, instruction: row.instruction, status: row.status, createdAt: row.created_at, ...requestResponseFields(row) };
  });
}

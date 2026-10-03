import type { EvidenceRequest, EvidenceRequestStatus } from "../types/evidence";

export const EVIDENCE_REQUEST_STATE: Record<EvidenceRequestStatus, { actionRequired: boolean; label: string }> = {
  requested: { actionRequired: true, label: "Action required" },
  submitted: { actionRequired: false, label: "Evidence submitted — awaiting review" },
  resolved: { actionRequired: false, label: "Evidence reviewed" },
};

export function hasRequestedEvidence(requests: EvidenceRequest[]) {
  return requests.some((request) => EVIDENCE_REQUEST_STATE[request.status].actionRequired);
}

export function currentEvidenceRequest(requests: EvidenceRequest[]) {
  return requests.find((request) => EVIDENCE_REQUEST_STATE[request.status].actionRequired)
    ?? requests.find((request) => request.status === "submitted")
    ?? requests[0];
}

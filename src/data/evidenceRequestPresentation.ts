import type { EvidenceRequest, EvidenceRequestStatus, EvidenceRequestType } from "../types/evidence";

export const EVIDENCE_REQUEST_STATE: Record<EvidenceRequestStatus, { actionRequired: boolean; label: string }> = {
  requested: { actionRequired: true, label: "Action required" },
  submitted: { actionRequired: false, label: "Response submitted — awaiting review" },
  resolved: { actionRequired: false, label: "Response reviewed" },
};

export function hasRequestedEvidence(requests: EvidenceRequest[]) {
  return requests.some((request) => EVIDENCE_REQUEST_STATE[request.status].actionRequired);
}

export const INFORMATION_REQUEST_TYPES = {
  overview_photo: { label: "Additional overview photo", requested: "Additional overview photo requested", inbox: "Additional photo requested", action: "Add photo", role: "overview" },
  closeup_photo: { label: "Additional close-up photo", requested: "Additional close-up photo requested", inbox: "Additional photo requested", action: "Add photo", role: "closeup" },
  written_details: { label: "More written details", requested: "More written details requested", inbox: "More details requested", action: "Provide details", role: null },
  legacy_photo: { label: "Additional photo", requested: "Additional photo requested", inbox: "Additional photo requested", action: "Add photo", role: "closeup" },
} as const;
export function requestPresentation(request: Pick<EvidenceRequest, "requestType">) {
  return INFORMATION_REQUEST_TYPES[request.requestType ?? "legacy_photo"];
}
export function canRequestInformation(c: { status: string; evidenceRequests: EvidenceRequest[] }) {
  // Preserve the existing stronger rule: one unresolved request of any type.
  return c.status === "under_review" && !c.evidenceRequests.some(r => r.status !== "resolved");
}
export interface EvidenceRequestFields {
  request_type?: EvidenceRequestType; response_text?: string | null; submitted_at?: string | null;
}
export function requestResponseFields(row: EvidenceRequestFields) {
  const type = row.request_type ?? "legacy_photo";
  if (!Object.prototype.hasOwnProperty.call(INFORMATION_REQUEST_TYPES, type)) throw new Error("Invalid request type");
  return { requestType: type, responseText: row.response_text ?? null, submittedAt: row.submitted_at ?? null };
}
export const MAX_WRITTEN_RESPONSE = 4000;
export function validWrittenResponse(text: string) { return Boolean(text.trim()) && text.length <= MAX_WRITTEN_RESPONSE; }

export function currentEvidenceRequest(requests: EvidenceRequest[]) {
  return requests.find((request) => EVIDENCE_REQUEST_STATE[request.status].actionRequired)
    ?? requests.find((request) => request.status === "submitted")
    ?? requests[0];
}

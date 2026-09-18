export type PhotoType = "overview" | "closeup";
export type AnnotationTool = "circle" | "arrow" | "text" | "draw";

export type EvidenceRequestStatus = "requested" | "submitted" | "resolved";
export interface EvidenceRequest {
  id: string;
  caseKey: string;
  instruction: string;
  status: EvidenceRequestStatus;
  createdAt: string;
}

// Display metadata for the existing simulated media, not a stored evidence record.
export interface DemoEvidence {
  label: string;
  note: string;
  src: string | null;
  type: "photo" | "video";
}

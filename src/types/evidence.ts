export type PhotoType = "overview" | "closeup";
export type AnnotationTool = "circle" | "arrow" | "text" | "draw";

export interface AnnotationPoint { x: number; y: number }
export interface PhotoAnnotation {
  tool: AnnotationTool;
  points: AnnotationPoint[];
  text?: string;
}
export interface PhotoMetadata {
  version: 1;
  width: number;
  height: number;
  annotations: PhotoAnnotation[];
}
export interface LocalPhoto extends PhotoMetadata {
  id: string;
  role: PhotoType;
  file: Blob;
  previewUrl: string;
}
export interface StoredPhoto {
  id: string;
  role: PhotoType;
  storagePath: string;
  metadata: PhotoMetadata;
}

export interface RequestedPhoto extends StoredPhoto { requestId: string }

export type EvidenceRequestStatus = "requested" | "submitted" | "resolved";
export type InformationRequestType = "overview_photo" | "closeup_photo" | "written_details";
export type EvidenceRequestType = InformationRequestType | "legacy_photo";
export interface EvidenceRequest {
  id: string;
  caseKey: string;
  instruction: string;
  status: EvidenceRequestStatus;
  createdAt: string;
  requestType?: EvidenceRequestType;
  responseText?: string | null;
  submittedAt?: string | null;
}

// Display metadata for the existing simulated media, not a stored evidence record.
export interface DemoEvidence {
  label: string;
  note: string;
  src: string | null;
  type: "photo" | "video";
}

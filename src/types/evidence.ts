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

export type PhotoType = "overview" | "closeup";
export type AnnotationTool = "circle" | "arrow" | "text" | "draw";

// Display metadata for the existing simulated media, not a stored evidence record.
export interface DemoEvidence {
  label: string;
  note: string;
  src: string | null;
  type: "photo" | "video";
}

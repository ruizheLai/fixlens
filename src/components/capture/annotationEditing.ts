import type { PhotoAnnotation } from "../../types/evidence";
export const ANNOTATION_COLORS = [
  { name: "White", value: "#FFFFFF" }, { name: "Black", value: "#000000" },
  { name: "Yellow", value: "#FACC15" }, { name: "Blue", value: "#2563EB" },
  { name: "Red", value: "#EF4444" }, { name: "Green", value: "#22C55E" },
] as const;
export const annotationColor = (value?: string) => /^#[0-9a-fA-F]{6}$/.test(value ?? "") ? value! : "#F59E0B";
export interface AnnotationHistory { past: PhotoAnnotation[][]; present: PhotoAnnotation[]; future: PhotoAnnotation[][] }
export const annotationHistory = (present: PhotoAnnotation[]): AnnotationHistory => ({ past: [], present, future: [] });
export function editAnnotations(h: AnnotationHistory, present: PhotoAnnotation[]): AnnotationHistory {
  return { past: [...h.past.slice(-49), h.present], present, future: [] };
}
export function undoAnnotations(h: AnnotationHistory): AnnotationHistory {
  if (!h.past.length) return h;
  return { past: h.past.slice(0,-1), present: h.past[h.past.length-1], future: [h.present,...h.future] };
}
export function redoAnnotations(h: AnnotationHistory): AnnotationHistory {
  if (!h.future.length) return h;
  return { past: [...h.past,h.present], present: h.future[0], future: h.future.slice(1) };
}

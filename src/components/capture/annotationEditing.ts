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

/** Shared soft wrapping; stored text and normalized anchors are never rewritten. */
export function annotationTextLayout(
  text: string,
  width: number,
  height: number,
  x: number,
  y: number,
) {
  const available = Math.max(1, width * (1 - x))
  const context =
    typeof document === "undefined"
      ? null
      : document.createElement("canvas").getContext("2d")
  let fontSize = Math.max(width, height) * 0.035
  const wrap = () => {
    if (context) context.font = `${fontSize}px Inter,sans-serif`
    const measure = (value: string) =>
      context?.measureText(value).width ??
      Array.from(value).length * fontSize * 0.6
    return text.split("\n").flatMap((paragraph) => {
      const lines: string[] = []
      let line = ""
      for (const word of paragraph.split(/(\s+)/)) {
        if (line && measure(line + word) > available) {
          lines.push(line)
          line = ""
        }
        for (const char of word) {
          if (line && measure(line + char) > available) {
            lines.push(line)
            line = ""
          }
          line += char
        }
      }
      lines.push(line)
      return lines
    })
  }
  let lines = wrap()
  // Keep even multiline text near an edge inside the image without moving its anchor.
  for (
    let i = 0;
    i < 20 &&
    (lines.length - 1) * fontSize * 1.2 + fontSize * 0.25 > height * (1 - y);
    i++
  ) {
    fontSize *= 0.8
    lines = wrap()
  }
  return { lines, fontSize }
}

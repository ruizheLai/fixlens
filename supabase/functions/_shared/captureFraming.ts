export type CaptureMode = "overview" | "close_up";
export interface FramingContext { issue: string; location: string; observedCondition: string | null; summary: string }
// Position describes the USER'S CAMERA AIM, never the target's position.
export interface FramingResult {
  // Relevant physical fixture/area is identifiable, NOT the reported defect confirmed.
  targetPresence: "visible" | "not_visible" | "uncertain";
  coverage: "too_little_context" | "enough_context" | "too_much_context" | "unknown";
  distance: "too_close" | "good" | "too_far" | "unknown";
  position: "move_left" | "move_right" | "move_up" | "move_down" | "centered" | "unknown";
  confidence: "low" | "medium" | "high";
}
export interface FramingInput { captureMode: CaptureMode; issueContext: FramingContext; image: string }
export const MAX_FRAME_BYTES = 300_000;
export const MAX_FRAMING_BODY = 410_000;
const enums = {
  targetPresence: ["visible", "not_visible", "uncertain"],
  coverage: ["too_little_context", "enough_context", "too_much_context", "unknown"],
  distance: ["too_close", "good", "too_far", "unknown"],
  position: ["move_left", "move_right", "move_up", "move_down", "centered", "unknown"],
  confidence: ["low", "medium", "high"],
};
export const framingSchema = { type: "object", additionalProperties: false, required: Object.keys(enums),
  properties: Object.fromEntries(Object.entries(enums).map(([key, values]) => [key, { type: "string", enum: values }])) };
function object(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== keys.length || keys.some(key => !(key in value))) throw new Error("Invalid framing input");
  return value as Record<string, unknown>;
}
export function validateFramingResult(value: unknown): FramingResult {
  const result = object(value, Object.keys(enums));
  for (const [key, values] of Object.entries(enums)) if (!values.includes(result[key] as string)) throw new Error("Invalid framing result");
  return result as unknown as FramingResult;
}
export function validateFramingContext(value: unknown): FramingContext {
  const context = object(value, ["issue", "location", "observedCondition", "summary"]);
  for (const [key, max] of [["issue", 160], ["location", 200], ["observedCondition", 400], ["summary", 800]] as const) {
    const text = context[key];
    if (key === "observedCondition" && text === null) continue;
    if (typeof text !== "string" || !text.trim() || text.length > max) throw new Error("Invalid framing context");
  }
  return context as unknown as FramingContext;
}
export function validateFramingInput(value: unknown): FramingInput {
  const input = object(value, ["captureMode", "issueContext", "image"]);
  if (input.captureMode !== "overview" && input.captureMode !== "close_up") throw new Error("Invalid capture mode");
  const issueContext = validateFramingContext(input.issueContext);
  if (typeof input.image !== "string" || input.image.length > MAX_FRAME_BYTES * 4 / 3 + 23 || !/^data:image\/jpeg;base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input.image)) throw new Error("Invalid image");
  const bytes = atob(input.image.slice(23));
  if (bytes.length < 16 || bytes.length > MAX_FRAME_BYTES || bytes.charCodeAt(0) !== 255 || bytes.charCodeAt(1) !== 216 || bytes.charCodeAt(bytes.length - 2) !== 255 || bytes.charCodeAt(bytes.length - 1) !== 217) throw new Error("Invalid JPEG");
  // Bound encoded dimensions as well as bytes. Reject unsupported JPEG structures.
  let dimensions = false;
  for (let offset = 2; offset + 8 < bytes.length;) {
    if (bytes.charCodeAt(offset) !== 255) break;
    const marker = bytes.charCodeAt(offset + 1);
    const length = bytes.charCodeAt(offset + 2) * 256 + bytes.charCodeAt(offset + 3);
    if (length < 2 || offset + 2 + length > bytes.length) break;
    if (marker === 192 || marker === 194) {
      const height = bytes.charCodeAt(offset + 5) * 256 + bytes.charCodeAt(offset + 6);
      const width = bytes.charCodeAt(offset + 7) * 256 + bytes.charCodeAt(offset + 8);
      dimensions = length >= 8 && width > 0 && height > 0 && Math.max(width, height) <= 768;
      break;
    }
    offset += 2 + length;
  }
  if (!dimensions) throw new Error("Invalid image dimensions");
  return { captureMode: input.captureMode, issueContext, image: input.image };
}

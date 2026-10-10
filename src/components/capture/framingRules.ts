import type { CaptureMode, FramingResult } from "../../../supabase/functions/_shared/captureFraming.ts";
export type FramingCue = "aim" | "back" | "closer" | "left" | "right" | "up" | "down" | "good";
export interface FramingGuide { cue: FramingCue; message: string }
export function framingGuide(mode: CaptureMode, result: FramingResult): FramingGuide | null {
  if (result.confidence === "low") return null;
  // Absence must be confident. Never act on framing fields for an absent target,
  // even if the provider contradicts itself. No direction/depth cue for this text.
  if (result.targetPresence === "not_visible") return result.confidence === "high" ? { cue: "aim", message: "Aim at the affected area" } : null;
  // Explicit visible check also fails closed for a legacy/malformed runtime value.
  if (result.targetPresence !== "visible") return null;
  if (result.coverage === "unknown" || result.distance === "unknown" || result.position === "unknown") return null;
  if (result.coverage === "too_little_context" && result.distance === "too_far" || result.coverage === "too_much_context" && result.distance === "too_close") return null;
  if (mode === "overview") {
    if (result.coverage === "too_little_context" || result.distance === "too_close") return { cue: "back", message: "Move back slightly" };
    if (result.coverage === "too_much_context" || result.distance === "too_far") return { cue: "closer", message: "Move a little closer" };
  } else {
    if (result.distance === "too_far") return { cue: "closer", message: "Move closer" };
    if (result.distance === "too_close") return { cue: "back", message: "Move back slightly" };
  }
  const directions = { move_left: "left", move_right: "right", move_up: "up", move_down: "down" } as const;
  if (result.position !== "centered") return result.confidence === "high" && result.coverage === "enough_context" && result.distance === "good"
    ? { cue: directions[result.position], message: `Move ${directions[result.position]}` } : null;
  return result.coverage === "enough_context" && result.distance === "good" ? { cue: "good", message: "Good framing" } : null;
}

export type QualityHint = "framing" | "dark" | "moving" | "ready";

export function sampleLuminance(rgba: Uint8ClampedArray): Float32Array {
  const values = new Float32Array(rgba.length / 4);
  for (let i = 0; i < values.length; i++) values[i] = .2126 * rgba[i * 4] + .7152 * rgba[i * 4 + 1] + .0722 * rgba[i * 4 + 2];
  return values;
}

// Conservative, advisory-only checks. They cannot recognize a subject or prove
// sharpness. Two matching samples and a minimum hold avoid flickering messages.
export class QualityGuidance {
  private previous: Float32Array | null = null;
  private shown: QualityHint = "framing";
  private candidate: QualityHint = "framing";
  private repeats = 0;
  private changedAt = 0;
  update(frame: Float32Array, now: number): QualityHint {
    if (!frame.length) return this.shown;
    const brightness = frame.reduce((sum, value) => sum + value, 0) / frame.length;
    const previous = this.previous;
    const motion = previous?.length === frame.length
      ? frame.reduce((sum, value, i) => sum + Math.abs(value - previous[i]), 0) / frame.length : 0;
    this.previous = frame;
    const next: QualityHint = brightness < (this.shown === "dark" ? 40 : 28) ? "dark"
      : motion > (this.shown === "moving" ? 12 : 22) ? "moving" : "ready";
    this.repeats = next === this.candidate ? this.repeats + 1 : 1;
    this.candidate = next;
    if (this.repeats >= 2 && now - this.changedAt >= 1500) { this.shown = next; this.changedAt = now; }
    return this.shown;
  }
}

import type { FramingResult } from "../../../supabase/functions/_shared/captureFraming.ts";
export interface FramingBudget { count: number; lastStart: number; inFlight: boolean }
export const newFramingBudget = (): FramingBudget => ({ count: 0, lastStart: -Infinity, inFlight: false });
export type FramingEvent = "start" | "end" | "stale" | "cooldown" | "limit" | "failed";
// One budget per report stage survives Retake/re-entry. No camera or UI ownership.
export class FramingScheduler {
  private stableSince: number | null = null;
  private generation = 0;
  private controller: AbortController | null = null;
  private failures = 0;
  private retryAt = 0;
  private shownAt = 0;
  private disposed = false;
  private lastEvent: FramingEvent | null = null;
  private budget: FramingBudget;
  private analyze: (signal: AbortSignal) => Promise<FramingResult>;
  private show: (result: FramingResult | null) => void;
  private clock: () => number;
  private trace?: (event: FramingEvent, count: number) => void;
  constructor(budget: FramingBudget, analyze: (signal: AbortSignal) => Promise<FramingResult>, show: (result: FramingResult | null) => void, clock = () => performance.now(), trace?: (event: FramingEvent, count: number) => void) {
    this.budget = budget; this.analyze = analyze; this.show = show; this.clock = clock; this.trace = trace;
  }
  private event(event: FramingEvent) { if (event !== this.lastEvent) this.trace?.(event, this.budget.count); this.lastEvent = event; }
  invalidate() {
    this.generation++; this.stableSince = null; this.controller?.abort(); this.show(null);
  }
  dispose() { this.disposed = true; this.invalidate(); }
  observe(usable: boolean) {
    if (this.disposed) return;
    const now = this.clock();
    if (!usable) { this.invalidate(); return; }
    if (this.shownAt && now - this.shownAt > 8000) { this.show(null); this.shownAt = 0; }
    this.stableSince ??= now;
    if (now - this.stableSince < 1500 || this.budget.inFlight) return;
    if (this.budget.count >= 5) { this.event("limit"); return; }
    if (now - this.budget.lastStart < 4000 || now < this.retryAt) { this.event("cooldown"); return; }
    const generation = this.generation;
    const controller = new AbortController(); this.controller = controller;
    this.budget.count++; this.budget.lastStart = now; this.budget.inFlight = true;
    this.event("start");
    // The service also times out. Keep inFlight until the underlying request
    // settles; even an uncooperative provider cannot overlap another request.
    const timeout = setTimeout(() => {
      this.failures++; this.retryAt = this.clock() + Math.min(16000, 4000 * 2 ** (this.failures - 1));
      this.invalidate(); this.event("failed");
    }, 10000);
    Promise.resolve().then(() => {
      if (controller.signal.aborted) throw new Error("Cancelled");
      return this.analyze(controller.signal);
    }).then(result => {
      if (this.disposed || controller.signal.aborted || generation !== this.generation) { this.event("stale"); return; }
      this.failures = 0; this.shownAt = this.clock(); this.show(result);
    }).catch(() => {
      if (this.disposed || generation !== this.generation) return;
      this.failures++; this.retryAt = this.clock() + Math.min(16000, 4000 * 2 ** (this.failures - 1));
      this.show(null); this.event("failed");
    }).finally(() => {
      clearTimeout(timeout); this.budget.inFlight = false;
      if (this.controller === controller) this.controller = null;
      this.event("end");
    });
  }
}

// Supplements (does not change) the debounced local quality message: invalidate
// immediately on movement, including accumulated change since the last analysis.
export class FramingStability {
  private previous: Float32Array | null = null;
  private anchor: Float32Array | null = null;
  observe(frame: Float32Array, ready: boolean): boolean {
    const difference = (other: Float32Array | null) => other?.length === frame.length ? frame.reduce((sum, value, i) => sum + Math.abs(value - other[i]), 0) / frame.length : Infinity;
    const usable = ready && frame.length > 0 && frame.reduce((a, b) => a + b, 0) / frame.length >= 40 && difference(this.previous) <= 12 && difference(this.anchor) <= 22;
    this.previous = frame;
    if (!usable) this.anchor = frame;
    return usable;
  }
}

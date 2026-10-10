import { test } from "node:test";
import assert from "node:assert/strict";
import { framingGuide } from "../src/components/capture/framingRules.ts";
import { FramingScheduler, FramingStability, newFramingBudget } from "../src/components/capture/framingScheduler.ts";
import type { FramingResult } from "../supabase/functions/_shared/captureFraming.ts";
import { previewCrop } from "../src/components/capture/framingFrame.ts";
const good: FramingResult = { targetPresence: "visible", coverage: "enough_context", distance: "good", position: "centered", confidence: "high" };
test("Analysis crop matches visible cover without changing accepted evidence", () => {
  assert.deepEqual(previewCrop(1920, 1080, 1080, 1080), { x: 420, y: 0, width: 1080, height: 1080 });
  assert.deepEqual(previewCrop(640, 480, 640, 480), { x: 0, y: 0, width: 640, height: 480 });
  assert.throws(() => previewCrop(0, 480, 640, 480));
});
test("Overview priorities, conflicts and one-message output", () => {
  for (const result of [{ distance: "too_close" }, { coverage: "too_little_context" }, { coverage: "too_little_context", distance: "too_close", position: "move_right" }] as Partial<FramingResult>[]) assert.deepEqual(framingGuide("overview", { ...good, ...result }), { cue: "back", message: "Move back slightly" });
  for (const result of [{ distance: "too_far" }, { coverage: "too_much_context" }] as Partial<FramingResult>[]) assert.equal(framingGuide("overview", { ...good, ...result })?.message, "Move a little closer");
  assert.equal(framingGuide("overview", good)?.message, "Good framing");
});
test("Close-up prioritizes scale, not surrounding room context", () => {
  assert.equal(framingGuide("close_up", { ...good, distance: "too_far", coverage: "too_much_context" })?.message, "Move closer");
  assert.equal(framingGuide("close_up", { ...good, distance: "too_close" })?.message, "Move back slightly");
  assert.equal(framingGuide("close_up", good)?.message, "Good framing");
  assert.equal(framingGuide("close_up", { ...good, coverage: "too_little_context" }), null);
});
test("Hard presence gate precedes all framing fields in both modes", () => {
  for (const mode of ["overview", "close_up"] as const) {
    assert.deepEqual(framingGuide(mode, { ...good, targetPresence: "not_visible" }), { cue: "aim", message: "Aim at the affected area" });
    assert.deepEqual(framingGuide(mode, { ...good, targetPresence: "not_visible", distance: "too_close", coverage: "too_much_context", position: "move_right" }), { cue: "aim", message: "Aim at the affected area" });
    for (const confidence of ["low", "medium"] as const) assert.equal(framingGuide(mode, { ...good, targetPresence: "not_visible", confidence }), null);
    assert.equal(framingGuide(mode, { ...good, targetPresence: "uncertain", position: "move_left" }), null);
    assert.equal(framingGuide(mode, { ...good, targetPresence: undefined } as unknown as FramingResult), null);
  }
});
test("Contradictions suppress advice instead of resolving opposing corrections", () => {
  for (const mode of ["overview", "close_up"] as const) {
    assert.equal(framingGuide(mode, { ...good, coverage: "too_little_context", distance: "too_far" }), null);
    assert.equal(framingGuide(mode, { ...good, coverage: "too_much_context", distance: "too_close" }), null);
  }
});
test("Direction needs high confidence, known framing and no scale/context correction", () => {
  for (const mode of ["overview", "close_up"] as const) {
    for (const position of ["move_left", "move_right", "move_up", "move_down"] as const) {
      assert.equal(framingGuide(mode, { ...good, position, confidence: "medium" }), null);
      assert.equal(framingGuide(mode, { ...good, position, distance: "too_close" })?.cue, "back");
    }
  }
  assert.equal(framingGuide("close_up", { ...good, position: "move_left", coverage: "too_little_context" }), null);
});
test("Both modes map camera-aim directions, suppress uncertainty", () => {
  for (const mode of ["overview", "close_up"] as const) {
    for (const dir of ["left", "right", "up", "down"] as const) assert.equal(framingGuide(mode, { ...good, position: `move_${dir}` })?.message, `Move ${dir}`);
    assert.equal(framingGuide(mode, { ...good, confidence: "low" }), null);
    for (const key of ["coverage", "distance", "position"] as const) assert.equal(framingGuide(mode, { ...good, [key]: "unknown" }), null);
    assert.equal(framingGuide(mode, { ...good, confidence: "medium" })?.message, "Good framing");
  }
});
const flush = () => new Promise(resolve => setImmediate(resolve));
test("Stable delay, dark/motion gate, cooldown, five requests including Retake", async () => {
  let now = 0, calls = 0;
  const budget = newFramingBudget();
  const analyze = async () => { calls++; return good; };
  const scheduler = new FramingScheduler(budget, analyze, () => {}, () => now);
  for (now = 0; now < 5000; now += 500) scheduler.observe(false);
  assert.equal(calls, 0);
  scheduler.observe(true); now += 1000; scheduler.observe(true); await flush(); assert.equal(calls, 0);
  now += 500; scheduler.observe(true); await flush(); assert.equal(calls, 1);
  now += 3999; scheduler.observe(true); await flush(); assert.equal(calls, 1);
  now++; scheduler.observe(true); await flush(); assert.equal(calls, 2);
  scheduler.dispose();
  const retake = new FramingScheduler(budget, analyze, () => {}, () => now);
  for (let i = 0; i < 40; i++) { now += 1000; retake.observe(true); await flush(); }
  assert.equal(calls, 5); assert.equal(budget.count, 5); retake.dispose();
});
test("No overlap; moving camera ignores late response", async () => {
  let now = 0; let resolve!: (result: FramingResult) => void; let shown: FramingResult | null = null;
  const budget = newFramingBudget();
  const scheduler = new FramingScheduler(budget, () => new Promise(r => { resolve = r; }), r => { shown = r; }, () => now);
  scheduler.observe(true); now = 1500; scheduler.observe(true); await flush();
  now = 9000; scheduler.observe(true); assert.equal(budget.count, 1);
  scheduler.observe(false); resolve(good); await flush(); assert.equal(shown, null); scheduler.dispose();
});
test("Step/exit cancellation and provider failures are advisory; failures back off", async () => {
  let now = 0, calls = 0; let resolve!: (r: FramingResult) => void; let shown: FramingResult | null = null;
  const stage = new FramingScheduler(newFramingBudget(), () => new Promise(r => { resolve = r; }), r => { shown = r; }, () => now);
  stage.observe(true); now = 1500; stage.observe(true); await flush(); stage.dispose(); resolve(good); await flush(); assert.equal(shown, null);
  const failing = new FramingScheduler(newFramingBudget(), async () => { calls++; throw new Error("Offline"); }, r => { shown = r; }, () => now);
  failing.observe(true); now += 1500; failing.observe(true); await flush(); assert.equal(calls, 1);
  now += 4000; failing.observe(true); await flush(); assert.equal(calls, 2);
  now += 4000; failing.observe(true); await flush(); assert.equal(calls, 2);
  now += 4000; failing.observe(true); await flush(); assert.equal(calls, 3); assert.equal(shown, null); failing.dispose();
});
test("Immediate gate catches motion before debounced message and cumulative changes", () => {
  const gate = new FramingStability();
  const frame = (v: number) => new Float32Array(20).fill(v);
  assert.equal(gate.observe(frame(120), true), false);
  assert.equal(gate.observe(frame(120), true), true);
  assert.equal(gate.observe(frame(155), true), false);
  assert.equal(gate.observe(frame(155), true), true);
  assert.equal(gate.observe(frame(165), true), true);
  assert.equal(gate.observe(frame(175), true), true);
  assert.equal(gate.observe(frame(185), true), false);
  assert.equal(gate.observe(frame(10), false), false);
});
test("Overview and Close-up have independent bounded budgets; expired guide clears", async () => {
  let now = 0, shown: FramingResult | null = null;
  const overview = newFramingBudget(), closeup = newFramingBudget();
  overview.count = 5;
  const scheduler = new FramingScheduler(closeup, async () => good, r => { shown = r; }, () => now);
  scheduler.observe(true); now = 1500; scheduler.observe(true); await flush();
  assert.equal(closeup.count, 1); assert.equal(overview.count, 5); assert.deepEqual(shown, good);
  closeup.count = 5; now += 8001; scheduler.observe(true); assert.equal(shown, null); scheduler.dispose();
});
test("Watchdog aborts optional analysis and never overlaps a slow provider", async t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let now = 0, signal!: AbortSignal, resolve!: (value: FramingResult) => void;
  let shown: FramingResult | null = null;
  const budget = newFramingBudget();
  const scheduler = new FramingScheduler(budget, s => { signal = s; return new Promise(r => { resolve = r; }); }, r => { shown = r; }, () => now);
  scheduler.observe(true); now = 1500; scheduler.observe(true); await flush();
  now += 10000; t.mock.timers.tick(10000); assert.equal(signal.aborted, true);
  scheduler.observe(true); now += 10000; scheduler.observe(true); assert.equal(budget.count, 1);
  resolve(good); await flush(); assert.equal(shown, null); scheduler.dispose();
});

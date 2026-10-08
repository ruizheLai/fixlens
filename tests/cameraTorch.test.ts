import test from "node:test";
import assert from "node:assert/strict";
import { CameraTorch } from "../src/components/capture/cameraTorch.ts";

function device(supported = true) {
  let on = false;
  const calls: boolean[] = [];
  const track = {
    readyState: "live",
    getCapabilities: () => ({ torch: supported }),
    getConstraints: () => ({ width: { ideal: 1920 }, advanced: [{ torch: true, zoom: 1 }] }),
    getSettings: () => ({ torch: on }),
    applyConstraints: async (value: MediaTrackConstraints) => {
      assert.deepEqual(value.width, { ideal: 1920 });
      on = (value.advanced!.at(-1) as { torch: boolean }).torch;
      calls.push(on);
    },
  };
  return { track, calls, media: track as unknown as MediaStreamTrack };
}
test("torch is unavailable for false/missing/throwing capabilities", async () => {
  const no = device(false), control = new CameraTorch(no.media);
  assert.equal(control.supported, false); await control.set(true); control.dispose(); assert.deepEqual(no.calls, []);
  assert.equal(new CameraTorch({ readyState: "live" } as MediaStreamTrack).supported, false);
});
test("torch toggles existing track, confirms settings and preserves camera constraints", async () => {
  const value = device(), control = new CameraTorch(value.media);
  assert.equal(control.supported, true);
  assert.equal(await control.set(true), true);
  assert.equal(await control.set(false), false);
  await control.set(true); control.dispose();
  assert.deepEqual(value.calls, [true, false, true, false]);
  assert.equal(await control.set(true), false);
});
test("cleanup wins a pending torch toggle without keeping stream alive", async () => {
  const value = device(); let release!: () => void;
  value.track.applyConstraints = async constraints => {
    const on = (constraints.advanced!.at(-1) as { torch: boolean }).torch;
    value.calls.push(on);
    if (on) await new Promise<void>(resolve => { release = resolve; });
  };
  const control = new CameraTorch(value.media), pending = control.set(true);
  assert.equal(await control.set(true), false); // No parallel toggle.
  control.dispose(); value.track.readyState = "ended"; release();
  assert.equal(await pending, false); assert.deepEqual(value.calls, [true, false, false]);
});
test("rejected or silently ignored torch constraint can degrade without camera changes", async () => {
  const value = device(); value.track.applyConstraints = async () => { throw new Error("unsupported"); };
  const control = new CameraTorch(value.media);
  await assert.rejects(control.set(true)); control.dispose();
  assert.equal(value.track.readyState, "live");
  const ignored = device(); ignored.track.applyConstraints = async () => {};
  await assert.rejects(new CameraTorch(ignored.media).set(true), /unavailable/);
});

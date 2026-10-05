import test from "node:test";
import assert from "node:assert/strict";
import { CameraSession, CAMERA_CONSTRAINTS, cameraErrorMessage, captureFrame } from "../src/components/capture/cameraSession.ts";
import { QualityGuidance, sampleLuminance } from "../src/components/capture/cameraQuality.ts";

class Track extends EventTarget {
  readyState = "live";
  stops = 0;
  stop() { this.stops++; this.readyState = "ended"; }
}
function stream() {
  const track = new Track();
  return { track, media: { getTracks: () => [track], getVideoTracks: () => [track] } as unknown as MediaStream };
}
const tick = () => new Promise(resolve => setImmediate(resolve));

test("camera requests rear preference, no microphone; repeated open shares one acquisition", async () => {
  const session = new CameraSession(), value = stream(); let calls = 0;
  const acquire = async (constraints: MediaStreamConstraints) => { calls++; assert.deepEqual(constraints, CAMERA_CONSTRAINTS); return value.media; };
  const first = session.open(acquire, () => {}), second = session.open(acquire, () => {});
  assert.equal(first, second); assert.equal(await first, value.media); assert.equal(calls, 1);
  assert.equal(CAMERA_CONSTRAINTS.audio, false);
  session.stop(); session.stop(); assert.equal(value.track.stops, 1);
});
test("late permission success after exit is stopped and never exposed", async () => {
  const session = new CameraSession(), value = stream(); let resolve!: (s: MediaStream) => void;
  const pending = session.open(() => new Promise(r => { resolve = r; }), () => {});
  await tick(); session.stop(); resolve(value.media);
  assert.equal(await pending, null); assert.equal(value.track.stops, 1);
});
test("Strict Mode setup/cleanup/setup and retake serialize unresolved requests", async () => {
  const first = new CameraSession(), next = new CameraSession();
  const old = stream(), fresh = stream(); let resolve!: (s: MediaStream) => void; let calls = 0;
  const pending = first.open(() => { calls++; return new Promise(r => { resolve = r; }); }, () => {});
  await tick(); first.stop();
  const replacement = next.open(async () => { calls++; assert.equal(old.track.readyState, "ended"); return fresh.media; }, () => {});
  await tick(); assert.equal(calls, 1);
  resolve(old.media); assert.equal(await pending, null); assert.equal(await replacement, fresh.media);
  next.stop(); assert.equal(fresh.track.stops, 1);
  const retake = stream(); assert.equal(await next.open(async () => retake.media, () => {}), retake.media);
  next.stop(); assert.equal(retake.track.stops, 1);
});
test("another capture owner stops previous stream and unexpected ending cleans all tracks", async () => {
  const a = new CameraSession(), b = new CameraSession(), old = stream(), fresh = stream(); let ended = 0;
  await a.open(async () => old.media, () => {});
  await b.open(async () => { assert.equal(old.track.readyState, "ended"); return fresh.media; }, () => { ended++; });
  fresh.track.dispatchEvent(new Event("ended"));
  assert.equal(ended, 1); assert.equal(fresh.track.stops, 1);
  fresh.track.dispatchEvent(new Event("ended")); assert.equal(ended, 1);
});
test("denial and initialization failure release acquisition for explicit Retry", async () => {
  const session = new CameraSession();
  for (const name of ["NotAllowedError", "NotFoundError", "NotReadableError"]) {
    const error = new Error("private device details"); error.name = name;
    await assert.rejects(session.open(async () => { throw error; }, () => {}));
    assert.match(cameraErrorMessage(error), /picker|Gallery/);
    assert.doesNotMatch(cameraErrorMessage(error), /private/);
  }
  const value = stream(); await session.open(async () => value.media, () => {}); session.stop();
});
test("gallery/background/exit invalidation stops tracks; queued canceled start never requests permission", async () => {
  for (const reason of ["gallery", "hidden", "unmount", "shutter"]) {
    const session = new CameraSession(), value = stream();
    await session.open(async () => value.media, () => {}); session.stop();
    assert.equal(value.track.readyState, "ended", reason);
  }
  const session = new CameraSession(); let calls = 0;
  const pending = session.open(async () => { calls++; return stream().media; }, () => {});
  session.stop(); assert.equal(await pending, null); assert.equal(calls, 0);
});
test("dark guidance wins over motion; hysteresis clears only after stable samples", () => {
  const q = new QualityGuidance(), frame = (n: number) => new Float32Array(16).fill(n);
  assert.equal(q.update(frame(15), 500), "framing");
  assert.equal(q.update(frame(20), 1500), "dark");
  assert.equal(q.update(frame(32), 2000), "dark");
  q.update(frame(100), 2500); q.update(frame(100), 3000);
  assert.equal(q.update(frame(100), 3500), "ready");
  q.update(frame(160), 4000);
  assert.equal(q.update(frame(100), 5000), "moving");
  q.update(frame(100), 5500); assert.equal(q.update(frame(100), 6500), "ready");
});
test("moderately dim stationary indoor scene is not labeled dark and samples contain no alpha", () => {
  const q = new QualityGuidance(), frame = new Float32Array(10).fill(55);
  q.update(frame, 500); assert.equal(q.update(frame, 1500), "ready");
  const values = sampleLuminance(new Uint8ClampedArray([255,255,255,0,0,0,0,255]));
  assert.equal(values.length, 2); assert.equal(values[0], 255); assert.equal(values[1], 0);
});
test("capture uses intrinsic portrait dimensions, JPEG, no mirror/crop and existing 2048 limit", async () => {
  const savedDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const draws: unknown[][] = [];
  const canvas = { width: 0, height: 0, getContext: () => ({ drawImage: (...args: unknown[]) => draws.push(args) }),
    toBlob(callback: (b: Blob) => void, type: string, quality: number) {
      assert.equal(this.width, 1152); assert.equal(this.height, 2048);
      assert.equal(type, "image/jpeg"); assert.equal(quality, .92); callback(new Blob(["jpeg"], { type }));
    } };
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: () => canvas } });
  try {
    const video = { readyState: 2, videoWidth: 2160, videoHeight: 3840 } as HTMLVideoElement;
    const file = await captureFrame(video);
    assert.equal(file.type, "image/jpeg"); assert.deepEqual(draws[0], [video, 0, 0, 1152, 2048]);
    assert.equal(canvas.width, 0); assert.throws(() => captureFrame({ readyState: 0 } as HTMLVideoElement));
  } finally {
    if (savedDocument) Object.defineProperty(globalThis, "document", savedDocument);
    else Reflect.deleteProperty(globalThis, "document");
  }
});

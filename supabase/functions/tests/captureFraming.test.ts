import { test } from "node:test";
import assert from "node:assert/strict";
import { validateFramingInput, validateFramingResult, MAX_FRAMING_BODY, type FramingInput, type FramingResult } from "../_shared/captureFraming.ts";
import { createFramingHandler } from "../analyze-capture-frame/handler.ts";
import { analyzeFraming } from "../analyze-capture-frame/openai.ts";
import { TRUSTED_ORIGINS } from "../analyze-maintenance-issue/cors.ts";
// JPEG header fixture for validation; provider decoding tested separately with real JPEGs.
const jpeg = (width = 640, height = 480) => `data:image/jpeg;base64,${Buffer.from([255,216,255,192,0,11,8,height>>8,height&255,width>>8,width&255,1,1,17,0,255,217]).toString("base64")}`;
const input: FramingInput = { captureMode: "overview", issueContext: { issue: "Leaking tap", location: "Kitchen", observedCondition: null, summary: "The kitchen tap is leaking." }, image: jpeg() };
const good: FramingResult = { targetPresence: "visible", coverage: "enough_context", distance: "good", position: "centered", confidence: "medium" };
const config = { apiKey: "server-only-test-secret", clientKeys: ["public-test-key"], origins: TRUSTED_ORIGINS, visionEnabled: true };
const req = (body: unknown = input, origin = "http://localhost:5173", headers = {}) => new Request("https://example.test/framing", { method: "POST", headers: { "content-type": "application/json", apikey: "public-test-key", origin, ...headers }, body: JSON.stringify(body) });
test("Disabled or missing server configuration never invokes provider; CORS/auth/validation remain", async () => {
  let calls = 0;
  for (const visionEnabled of [undefined, false, "true", 1]) {
    const handler = createFramingHandler({ ...config, visionEnabled: visionEnabled as boolean | undefined }, async () => { calls++; return good; });
    const response = await handler(req(input, undefined, { "x-capture-vision-enabled": "true" }));
    assert.equal(response.status, 503);
    assert.equal(await response.text(), '{"error":"Framing unavailable"}');
    assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
    assert.equal((await handler(req({ ...input, visionEnabled: true }))).status, 400);
    assert.equal((await handler(req(input, undefined, { apikey: "wrong" }))).status, 401);
    assert.equal((await handler(req(input, "https://evil.vercel.app"))).status, 403);
    const preflight = await handler(new Request("https://example.test", { method: "OPTIONS", headers: { origin: "http://localhost:5173" } }));
    assert.equal(preflight.status, 204);
  }
  assert.equal(calls, 0);
});
test("Both modes validate; exact fields only; image format/dimensions/size enforced", () => {
  for (const captureMode of ["overview", "close_up"]) assert.equal(validateFramingInput({ ...input, captureMode }).captureMode, captureMode);
  for (const bad of [{ ...input, captureMode: "video" }, { ...input, issueContext: null }, { ...input, renterName: "Not allowed" }, { ...input, issueContext: { ...input.issueContext, address: "Not allowed" } }, { ...input, image: "https://example.test/photo.jpg" }, { ...input, image: "data:image/png;base64,AAAA" }, { ...input, image: "data:image/jpeg;base64,???" }, { ...input, image: jpeg(2000) }, { ...input, image: "data:image/jpeg;base64," + "A".repeat(410000) }, { ...input, issueContext: { ...input.issueContext, summary: "a".repeat(801) } }]) assert.throws(() => validateFramingInput(bad));
  assert.throws(() => validateFramingResult({ ...good, diagnosis: "forbidden" }));
  assert.throws(() => validateFramingResult({ ...good, position: "target_on_left" }));
});
test("Presence is required, exact and never defaulted to visible", async () => {
  const { targetPresence, ...legacy } = good;
  for (const invalid of [legacy, { ...good, targetPresence: "detected" }, { ...good, targetPresence: null }, { ...good, targetPresence: true }]) {
    assert.throws(() => validateFramingResult(invalid));
    const handler = createFramingHandler(config, async () => invalid as FramingResult);
    assert.equal((await handler(req())).status, 502);
  }
  for (const presence of [targetPresence, "not_visible", "uncertain"]) assert.equal(validateFramingResult({ ...good, targetPresence: presence }).targetPresence, presence);
});
test("Handler accepts modes, uses CORS, rejects bad origin/key/payload without provider call", async () => {
  let calls = 0;
  const handler = createFramingHandler(config, async () => { calls++; return good; });
  for (const captureMode of ["overview", "close_up"]) {
    const response = await handler(req({ ...input, captureMode })); assert.equal(response.status, 200); assert.deepEqual(await response.json(), good);
  }
  const preflight = await handler(new Request("https://example.test", { method: "OPTIONS", headers: { origin: "https://fixlens-git-phase-3b-brad-s-team2.vercel.app", "access-control-request-headers": "apikey,content-type" } }));
  assert.equal(preflight.status, 204); assert.equal(preflight.headers.get("access-control-allow-origin"), "https://fixlens-git-phase-3b-brad-s-team2.vercel.app");
  for (const origin of ["https://evil.vercel.app", "https://fixlens-x-other.vercel.app", "https://fix-lens.app.evil.test"]) assert.equal((await handler(req(input, origin))).status, 403);
  assert.equal((await handler(req(input, undefined, { apikey: "wrong" }))).status, 401);
  assert.equal((await handler(req({ ...input, image: "bad" }))).status, 400);
  assert.equal((await handler(req("x".repeat(MAX_FRAMING_BODY + 1)))).status, 413);
  assert.equal(calls, 2);
});
test("Errors/timeouts/malformed provider output are normalized and reveal no secret", async () => {
  for (const provider of [async () => { throw new DOMException("private provider detail", "TimeoutError"); }, async () => ({ ...good, confidence: "invalid" } as unknown as FramingResult)]) {
    const response = await createFramingHandler(config, provider)(req());
    assert.equal(response.status, 502); assert.equal(await response.text(), '{"error":"Framing unavailable"}');
  }
  assert.equal((await createFramingHandler({ ...config, apiKey: undefined })(req())).status, 503);
});
test("Provider uses image + minimal context, strict schema, server key, no persistence", async () => {
  const mock: typeof fetch = async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    assert.equal((options?.headers as Record<string,string>).Authorization, `Bearer ${config.apiKey}`);
    const body = JSON.parse(options?.body as string);
    assert.equal(body.store, false); assert.equal(body.text.format.strict, true);
    assert.deepEqual(body.text.format.schema.required, ["targetPresence", "coverage", "distance", "position", "confidence"]);
    assert.equal(body.input[0].content[1].type, "input_image");
    assert.deepEqual(JSON.parse(body.input[0].content[0].text), { captureMode: input.captureMode, issueContext: input.issueContext });
    return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(good) }] }] });
  };
  assert.deepEqual(await analyzeFraming(input, config.apiKey, new AbortController().signal, mock), good);
  for (const body of [{ status: "incomplete" }, { status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: "not-json" }] }] }]) await assert.rejects(analyzeFraming(input, config.apiKey, new AbortController().signal, async () => Response.json(body)));
});
test("Per-isolate call cap limits provider spend", async () => {
  const handler = createFramingHandler(config, async () => good);
  for (let i = 0; i < 30; i++) assert.equal((await handler(req())).status, 200);
  assert.equal((await handler(req())).status, 429);
});

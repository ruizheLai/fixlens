import test from "node:test";
import assert from "node:assert/strict";
import { validateInput, validateUnderstanding } from "../_shared/issueUnderstanding.ts";
import { analyzeWithOpenAI } from "../analyze-maintenance-issue/openai.ts";
import { createHandler } from "../analyze-maintenance-issue/handler.ts";
import { TRUSTED_ORIGINS, isTrustedOrigin } from "../analyze-maintenance-issue/cors.ts";

test("FixLens origin policy rejects other projects, teams and URL lookalikes", async () => {
  let calls = 0;
  const handler = createHandler({ apiKey: "test-key", clientKeys: ["test-client"], origins: TRUSTED_ORIGINS }, async () => { calls++; return validateUnderstanding(sufficient); });
  const accepted = [...TRUSTED_ORIGINS, "https://fixlens-nrgfbv8js-brad-s-team2.vercel.app", "https://fixlens-q34vaazxy-brad-s-team2.vercel.app", "https://fixlens-git-phase-3a-brad-s-team2.vercel.app"];
  for (const origin of accepted) {
    assert.equal(isTrustedOrigin(origin), true, origin);
    const preflight = await handler(new Request("https://test.invalid", { method: "OPTIONS", headers: { origin } }));
    assert.equal(preflight.status, 204); assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), origin);
    const post = await handler(new Request("https://test.invalid", { method: "POST", headers: { origin, apikey: "test-client", "Content-Type": "application/json" }, body: JSON.stringify(input) }));
    assert.equal(post.status, 200); assert.equal(post.headers.get("Access-Control-Allow-Origin"), origin);
    const error = await handler(new Request("https://test.invalid", { method: "POST", headers: { origin } }));
    assert.equal(error.status, 401); assert.equal(error.headers.get("Access-Control-Allow-Origin"), origin);
  }
  assert.equal(calls, accepted.length);
  const rejected = ["https://random-project-attacker.vercel.app", "https://fixlens-attacker.vercel.app", "https://other-x-brad-s-team2.vercel.app", "https://fixlens-x-other-team.vercel.app", "https://fixlens-x-brad-s-team2.vercel.app.evil.test", "https://fixlens-x-brad-s-team2.vercel.app:444", "http://fixlens-x-brad-s-team2.vercel.app", "https://fixlens--brad-s-team2.vercel.app", "https://fixlens-x.y-brad-s-team2.vercel.app", "https://fix-lens.app/", "https://user@fix-lens.app", "https://fix-lens.app.evil.test", "null", "not a URL"];
  for (const origin of rejected) {
    assert.equal(isTrustedOrigin(origin), false, origin);
    for (const method of ["OPTIONS", "POST"]) {
      const response = await handler(new Request("https://test.invalid", { method, headers: { origin } }));
      assert.equal(response.status, 403, origin);
      assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
    }
  }
  assert.equal(calls, accepted.length);
});

const input = { description: "Kitchen tap is leaking", clarifications: [] };
const sufficient = { status: "sufficient", issue: "Leaking tap", location: "Kitchen", observedCondition: "Leaking", summary: "The kitchen tap is leaking.", followUpQuestions: [] };
test("bounded input rejects extra/private fields and excess answers", () => {
  assert.deepEqual(validateInput(input), input);
  for (const value of [{ ...input, userId: "private" }, { ...input, description: " " }, { ...input, description: "a".repeat(4001) }, { ...input, clarifications: Array(3).fill({ question: "Where?", answer: "Kitchen" }) }]) assert.throws(() => validateInput(value));
});
test("strict output rejects missing/extra fields, invalid types and unsupported decisions", () => {
  assert.deepEqual(validateUnderstanding(sufficient), sufficient);
  for (const value of [{ ...sufficient, priority: "urgent" }, { ...sufficient, status: "approved" }, { ...sufficient, location: null }, { ...sufficient, summary: 3 }, { ...sufficient, followUpQuestions: ["When?"] }, { ...sufficient, issue: "a".repeat(161) }]) assert.throws(() => validateUnderstanding(value));
});
test("one question at a time and no third follow-up", () => {
  const partial = { ...sufficient, status: "needs_follow_up", location: null, followUpQuestions: ["Where is the tap?"] };
  assert.equal(validateUnderstanding(partial, 1).followUpQuestions.length, 1);
  assert.equal(validateUnderstanding(partial, 2).followUpQuestions.length, 0);
  assert.throws(() => validateUnderstanding({ ...partial, followUpQuestions: ["Where?", "When?"] }));
  assert.throws(() => validateUnderstanding({ ...sufficient, status: "not_maintenance" }));
});
test("provider uses strict schema, no tools/history/personal context, and no stored response", async () => {
  const mock: typeof fetch = async (_url, init) => {
    const body = JSON.parse(init!.body as string);
    assert.equal(body.store, false); assert.equal(body.tools, undefined); assert.equal(body.text.format.strict, true);
    assert.deepEqual(JSON.parse(body.input[0].content), input);
    return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(sufficient) }] }] });
  };
  assert.deepEqual(await analyzeWithOpenAI(input, "test-key", new AbortController().signal, mock), sufficient);
});
test("provider refusal, incomplete, malformed and failed responses reject safely", async () => {
  for (const response of [Response.json({}, { status: 429 }), Response.json({ status: "incomplete", output: [] }), Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "refusal" }] }] }), Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: "not json" }] }] })]) {
    await assert.rejects(analyzeWithOpenAI(input, "test-key", new AbortController().signal, async () => response));
  }
});
const request = (body: unknown = input, key = "test-client") => new Request("https://test.invalid", { method: "POST", headers: { apikey: key, "Content-Type": "application/json", origin: "http://localhost:5173" }, body: JSON.stringify(body) });
test("trusted preflight succeeds before credentials/provider processing; untrusted origin stays denied", async () => {
  let calls = 0;
  const origin = "http://localhost:5173";
  const handler = createHandler({ clientKeys: [], origins: [origin] }, async () => { calls++; return validateUnderstanding(sufficient); });
  const preflight = await handler(new Request("https://test.invalid", { method: "OPTIONS", headers: {
    origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "authorization,x-client-info,apikey,content-type",
  } }));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), origin);
  assert.equal(preflight.headers.get("Vary"), "Origin");
  assert.equal(preflight.headers.get("Access-Control-Allow-Methods"), "POST, OPTIONS");
  assert.deepEqual(preflight.headers.get("Access-Control-Allow-Headers")?.split(", "), ["authorization", "x-client-info", "apikey", "content-type"]);
  assert.equal(calls, 0);
  for (const method of ["OPTIONS", "POST"]) {
    const denied = await handler(new Request("https://test.invalid", { method, headers: { origin: "https://untrusted.invalid" } }));
    assert.equal(denied.status, 403);
    assert.notEqual(denied.headers.get("Access-Control-Allow-Origin"), "https://untrusted.invalid");
  }
  assert.equal(calls, 0);
});
test("HTTP boundary fails closed and never invokes provider for invalid input/config", async () => {
  let count = 0;
  const handler = createHandler({ apiKey: "test-key", clientKeys: ["test-client"], origins: ["http://localhost:5173"] }, async () => { count++; return validateUnderstanding(sufficient); });
  assert.equal((await handler(request(input, "wrong"))).status, 401);
  assert.equal((await handler(request({ ...input, privateData: "no" }))).status, 400);
  assert.equal(count, 0);
  assert.equal((await handler(request())).status, 200); assert.equal(count, 1);
  const unavailable = createHandler({ clientKeys: ["test-client"], origins: ["http://localhost:5173"] });
  assert.equal((await unavailable(request())).status, 503);
});
test("HTTP provider failures reveal no provider text or input", async () => {
  const handler = createHandler({ apiKey: "test-key", clientKeys: ["test-client"], origins: ["http://localhost:5173"] }, async () => { throw new Error("private provider detail"); });
  const response = await handler(request()); assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "Understanding unavailable" });
});
test("HTTP origin, method, size and concurrent-call bounds", async () => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let entered = 0;
  const handler = createHandler({ apiKey: "test-key", clientKeys: ["test-client"], origins: ["http://localhost:5173"] }, async () => { entered++; await gate; return validateUnderstanding(sufficient); });
  assert.equal((await handler(new Request("https://test.invalid", { headers: { origin: "https://untrusted.invalid" } }))).status, 403);
  assert.equal((await handler(new Request("https://test.invalid"))).status, 405);
  assert.equal((await handler(request({ description: "x".repeat(33000), clarifications: [] }))).status, 413);
  const firstFour = Array.from({ length: 4 }, () => handler(request()));
  while (entered < 4) await new Promise(resolve => setImmediate(resolve));
  assert.equal((await handler(request())).status, 429);
  release();
  assert.ok((await Promise.all(firstFour)).every(response => response.status === 200));
});

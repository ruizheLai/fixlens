import { test } from "node:test";
import assert from "node:assert/strict";
import { captureVisionEnabled } from "../src/components/capture/captureVision.ts";

test("Exhibition configuration must keep experimental provider capture disabled", () => {
  assert.equal(captureVisionEnabled, false);
});

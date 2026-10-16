import { test } from "node:test";
import assert from "node:assert/strict";
import { canSubmitReport, isSafetyReport, IMMEDIATE_DANGER } from "../src/data/reportSafety.ts";
test("Only an explicit affirmative safety answer bypasses ordinary two-photo validation", () => {
  assert.equal(canSubmitReport(IMMEDIATE_DANGER,false,false),true);
  for(const response of [null,"Yes","Dangerous leak","No immediate danger reported"]) {
    assert.equal(canSubmitReport(response,false,false),false);
    assert.equal(canSubmitReport(response,true,false),false);
    assert.equal(canSubmitReport(response,false,true),false);
  }
  assert.equal(canSubmitReport("No immediate danger reported",true,true),true);
  assert.equal(canSubmitReport(null,true,true),false);
  assert.equal(isSafetyReport("AI thinks danger"),false);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { requestPresentation, requestResponseFields, canRequestInformation, EVIDENCE_REQUEST_STATE, validWrittenResponse } from "../src/data/evidenceRequestPresentation.ts";
import type { EvidenceRequest } from "../src/types/evidence.ts";
const base: EvidenceRequest = { id: "request", caseKey: "case", instruction: "Show the area", createdAt: "2026-10-14T00:00:00Z", status: "requested" };
test("Old requests remain generic photos and new types choose the intended input", () => {
  assert.equal(requestResponseFields({}).requestType, "legacy_photo");
  assert.equal(requestPresentation(base).action, "Add photo");
  assert.equal(requestPresentation({ requestType: "overview_photo" }).role, "overview");
  assert.equal(requestPresentation({ requestType: "closeup_photo" }).role, "closeup");
  assert.equal(requestPresentation({ requestType: "written_details" }).role, null);
  assert.equal(requestPresentation({ requestType: "written_details" }).action, "Provide details");
  assert.throws(() => requestResponseFields({ request_type: "invalid" as never }));
});
test("Only under-review cases without unresolved requests can request again", () => {
  for (const status of ["submitted", "awaiting_approval", "arranging_repair", "repair_scheduled", "completed"]) assert.equal(canRequestInformation({ status, evidenceRequests: [] }), false);
  for (const status of ["requested", "submitted"] as const) assert.equal(canRequestInformation({ status: "under_review", evidenceRequests: [{ ...base, status }] }), false);
  assert.equal(canRequestInformation({ status: "under_review", evidenceRequests: [{ ...base, status: "resolved" }] }), true);
});
test("Request lifecycle action and exact response fields stay independent of case status", () => {
  assert.equal(EVIDENCE_REQUEST_STATE.requested.actionRequired, true);
  assert.equal(EVIDENCE_REQUEST_STATE.submitted.actionRequired, false);
  assert.equal(EVIDENCE_REQUEST_STATE.resolved.actionRequired, false);
  const text = "  First line\nSecond line  ";
  assert.equal(requestResponseFields({ request_type: "written_details", response_text: text }).responseText, text);
  for (const invalid of ["", " \n\t ", "x".repeat(4001)]) assert.equal(validWrittenResponse(invalid), false);
  assert.equal(validWrittenResponse(text), true);
  assert.equal(validWrittenResponse("x".repeat(4000)), true);
});

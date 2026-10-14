# Batch 1.1 — PM information requests

Prepared on `Polish`, 14 October 2026, after Batch 1 commit `bcc258c`.
**Approved database deployment and controlled live acceptance PASS, 14 October 2026.**
Frontend remains local; no commit, push, merge or frontend deployment performed.

## Prepared behavior

- PM Detail and action dialogs omit the technical case ID. Internal keys remain.
- One Request more information dialog offers required Overview, Close-up or written
  details selection. Original photo cards preselect their own type; general action
  starts without a selection. Instructions are required, max 1,000 characters.
- Existing permission rule retained: under_review, with no unresolved request of
  any type. This is deliberately stricter than only preventing same-type duplicates.
  Completed cases have no request actions; unresolved requests show Request pending.
- PM creation freezes a UUID/type/instruction for Retry; input survives failures.
- Renter photo requests reuse the existing camera/Gallery/Preview/annotation/upload
  flow, choosing Overview or Close-up capture role. Legacy requests keep Close-up
  capture behavior. Additional photos never replace original evidence.
- Written responses use a 16px multiline field, non-whitespace validation and a
  4,000-character limit. Exact submitted text is frozen across Retry; no AI or
  Storage operation is involved. Original report fields/status are untouched.
- PM sees type, instruction, exact response and submitted timestamp; existing
  resolution action resolves it. Pending/submitted requests still block approval.
- Renter Case Detail/Inbox recognize type. Submitted removes renter action and
  shows Response submitted — awaiting review. Text remains readable after resolution
  and subsequent case completion. Photo-load errors do not hide written responses.
- Shared request presentation/state helpers are the interpretation source for a
  later Home action section; Home is not changed. Existing case routes identify
  the case, and its requested request ID selects the appropriate response workflow.
- Existing session-scoped renter polling and private PM invalidation are unchanged.

## Approved migration applied

`supabase/migrations/20261014081934_information_request_types.sql`:

1. Adds `request_type` (default `legacy_photo`) and nullable `response_text` to
   `evidence_requests`. Allowed new UI types are `overview_photo`, `closeup_photo`,
   `written_details`. Legacy rows/seeded requests retain generic photo semantics.
2. Adds checks for response type/length/non-whitespace and valid written lifecycle
   state. Reuses existing submitted_at/resolved_at; creates no response table.
3. Adds authenticated PM `request_case_information` with a public invoker wrapper
   and narrow private definer implementation. The old three-argument request RPC
   remains compatible and delegates with legacy_photo explicitly.
4. Adds renter `submit_requested_details`: matches the existing case/demo-session
   ownership boundary, locks case then request, persists exact wording and commits
   Requested → Submitted plus one activity atomically. Same-text retries recover
   even after resolution; changed text is rejected. No case lifecycle transition.
5. Existing photo submission rejects written requests. Existing PM resolution
   accepts either linked photo evidence or a persisted written response. Its
   idempotent Resolved behavior and case-status restrictions remain.
6. Retains case-first locking, one unresolved request across all types, existing
   indexes, original report/evidence relationships, RLS/table grants and Storage
   policies. New RPC execution grants are explicit; no browser direct UPDATE.
7. Notifies PostgREST to reload schema. Prior migrations are unchanged.

Read projections use the authorized evidence-request relation with additive fields
mapped to legacy_photo when missing, so existing live reads still work before the
migration. New typed/write actions require the migration. Do not publish this
frontend ahead of the approved backend deployment.

## Verification performed

- Live read-only inspection confirmed original eight request columns, existing
  policies and atomic RPCs. Migration history ends at pm_realtime_invalidation;
  the new migration was not yet applied at that pre-deployment inspection.
- Full initial-through-resolution migrations plus the new migration executed in
  isolated PGlite PostgreSQL. Auth uid and Storage catalog were local fixtures.
  No remote database was used for these tests. Real migrations' roles/RLS/grants
  and business functions were used; hosted Auth/Storage/Realtime were not simulated
  as full services. Realtime migration was excluded from this local runtime.
- Four SQL suites PASS, all transaction fixtures rolled back:
  `pm_workflow.sql`, `requested_evidence.sql`, `pm_evidence_resolution.sql`,
  `information_requests.sql`.
- Tests cover three new types, explicit legacy compatibility, wrong types/blank/
  oversized text, exact multiline persistence, no text-only evidence row, owner vs
  unrelated-session SELECT/submission, anonymous/unauthorized PM denial, denied
  direct updates, stable-ID retries, duplicate active request recovery, repeated
  photo/text submissions, repeated resolution, completed rejection and approval
  blocking for Requested and Submitted. New requests are allowed after resolution.
- Embedded execution was serialized; independent PostgreSQL connection tests
  were subsequently completed live as recorded below.
- 3 new frontend model/validation tests PASS. 2 existing PM annotation tests PASS.
  TypeScript (`npx tsc --noEmit`) and production build PASS. No dependencies added
  to package.json/lockfile; temporary PGlite runtime removed after use.
- Browser, explicit mock RPC harness: Overview/Close-up/general selection, 390px
  modal containment, whitespace rejection, pending disable, retained input after
  failure, stable Retry IDs/payloads, one request on double-click, successful close,
  renter form at 375/390px, exact multiline retry and text-only PM review at 1024px.
- Live browser reads: Dashboard at 1440px, legacy request/case compatibility,
  completed no-request actions, ID-free header and the actual preselected request
  dialog. No Send or workflow write was run against live cases. Console clean.
- These initial checks preceded deployment approval. Subsequent live acceptance
  is recorded below. Physical iPhone Safari keyboard testing remains manual.

## Approved deployment and live acceptance

- Confirmed the existing **FixLens** project, `ycnilqoqtgjmptxzuhty`, and eight
  prior migrations. Applied only the exact approved local SQL file, once, through
  the Supabase migration tool. Its generated remote history version is
  **20261014093153 — information_request_types**. The approved local filename
  remains `20261014081934_information_request_types.sql`; do not apply it again.
  Account for this recorded version mapping before any future CLI migration push.
- Reviewed the additive SQL and current RPC signatures/grants before applying.
  The transaction provides rollback on application failure. Former private RPC
  definitions were captured for recovery review; previous migration source also
  remains available. A post-commit issue would require stopping new writes and
  reviewing restoration of RPC behavior while retaining columns/responses, rather
  than dropping data. No restore, reset, reseed or unrelated migration was needed.
- Immediate post-deployment checks: request_type is NOT NULL text with
  legacy_photo default; response_text is nullable text. All six existing requests
  retain their original states and default to legacy_photo with null response.
  All existing record hashes, evidence links, case statuses and Storage objects
  were unchanged. Public legacy signatures and execution grants are preserved.
  New PM request RPC is authenticated-only; written submission is anon/authenticated
  with visitor ownership checks. Public wrappers remain security invoker.
  RLS remains enabled on all six application tables and storage.objects; exact
  public/Storage policy definitions match the pre-deployment snapshot.
- Four SQL suites also PASS against hosted PostgreSQL, with transaction fixtures
  rolled back: pm_workflow, requested_evidence, pm_evidence_resolution,
  information_requests. This includes unauthorized authenticated-user denial,
  anonymous PM-write denial, ownership isolation, denied direct updates, invalid
  types/text, completed restriction and Requested/Submitted approval blocking.
- Four disposable visitor cases were created through anonymous session-scoped
  HTTP insertion, real private JPEG upload and PM review. Additional overview,
  close-up, written details and legacy photo requests all passed
  **Requested → Submitted → Resolved** with canonical status unchanged.
  Original descriptions and original evidence rows/annotations stayed identical.
  Photo responses added one immutable linked photo each; written responses
  preserved exact multiline text and created no evidence row or Storage object.
- Browser acceptance used real clients and the existing PM Auth session. An
  additional written request completed entirely through the actual PM dialog,
  renter response form and PM review confirmation. Responses remain readable
  after resolution. Overview capture routing, Submitted Report, Case Detail,
  Inbox, Profile, Home and completed treatment were checked. Completed PM UI has
  no request/workflow CTA. Legacy PM transitions worked through completion.
- Concurrent independent HTTP requests and repeated stable payloads passed
  create/submit/resolve idempotency. Controlled lost-acknowledgement checks
  deliberately discarded committed RPC results before retrying; these were
  client-side acknowledgment simulations, not a physical network outage.
  Exactly one activity per successful request/submission/resolution was observed.
- Extra concurrent committed written lifecycle checks used distinct PostgreSQL
  backend connections: create PIDs 3270120/3270122, submit 3270127/3270150,
  resolve 3270775/3270778. Each pair returned one applied/submitted outcome and
  one already_applied/already_submitted recovery, without duplicate rows/events.
- A fresh anonymous client with a different demo_session_id could not select the
  disposable cases, requests or evidence, submit text/photos, download their
  private objects or create signed access. The PM could freshly download the
  same objects. No PM token was supplied to the unrelated client.
- Existing renter polling updated submitted/resolved state without refreshing.
  The separate PM view received private realtime invalidations and showed newly
  submitted responses automatically. Typed Inbox events were verified.
- Existing Production at https://fix-lens.app was not deployed or modified.
  Home, Cases, legacy kitchen Case Detail and Inbox loaded normally after the
  migration, with no console warnings/errors. Legacy RPC compatibility was also
  exercised live using the same old three-argument request/photo-submit/resolve
  contracts. Production PM login/write UI was not separately re-authenticated;
  those contracts were tested through the existing local PM Auth session.
  New typed/written UI requires the reviewed frontend release; additive database
  deployment does not add these controls to the old Production bundle.
- Normal local renter/PM and Production consoles were clean. Expected failed
  requests occurred only in the disposable negative-test runner.
- TypeScript, production build, three request model tests and two existing PM
  annotation tests PASS. No dependencies changed.

## Baseline and cleanup

| Table / objects | Before deployment | After cleanup |
| --- | ---: | ---: |
| profiles | 2 | 2 |
| properties | 1 | 1 |
| cases | 11 | 11 |
| evidence_requests | 6 | 6 |
| evidence | 19 | 19 |
| case_updates | 48 | 48 |
| Storage objects | 19 | 19 |

All four disposable cases, six requests (including three written responses),
30 activities, seven evidence rows and seven Storage objects were removed.
Evidence rows were removed first, then unlinked files through the Storage API,
then disposable cases and cascading requests/activities. Zero orphan Storage
objects remain. Existing cases, requests (excluding the two additive columns),
evidence, activities and Storage catalog content hashes exactly match baseline.
Existing seeded/legitimate records and Sarah Chen's PM/Auth linkage are preserved.
The temporary runner/recovery directory was removed and the original renter
browser demo session restored. No secrets or .env.local are staged/tracked.

## Files

Created:
- src/components/pm/RequestInformationDialog.tsx
- src/features/evidence/WrittenDetailsWorkflow.tsx
- src/services/writtenResponse.ts
- supabase/migrations/20261014081934_information_request_types.sql
- supabase/tests/information_requests.sql
- tests/informationRequests.test.ts
- docs/INFORMATION_REQUEST_VERIFICATION.md

Modified:
- src/App.tsx (request response dispatch only)
- src/components/case/RequestedEvidenceGallery.tsx
- src/components/pm/PMEvidencePhoto.tsx
- src/components/pm/PMWorkflowActions.tsx
- src/data/evidenceRequestPresentation.ts
- src/features/evidence/RequestedEvidenceWorkflow.tsx
- src/features/pm/pm.css
- src/screens/pm/PMCaseDetail.tsx
- src/screens/renter/cases/KitchenCaseDetailScreen.tsx
- src/screens/renter/cases/HotWaterCaseDetailScreen.tsx (readable response history)
- src/services/evidenceRequests.ts
- src/services/inbox.ts
- src/services/pm.ts
- src/types/evidence.ts
- README.md
- docs/ARCHITECTURE.md

## Next step

Review the Batch 1.1 diff and this live verification record. If accepted, manually
commit the prepared changes, then publish a frontend Preview for final device
review before a Production release. Do not reapply the recorded migration.
Physical iPhone Safari keyboard verification remains a manual device check;
desktop browser coverage does not prove a physical mobile keyboard interaction.

No commit, push, merge, frontend deployment or Batch 2 work was performed.
Suggested commit: `Add typed PM information requests and renter written responses`.

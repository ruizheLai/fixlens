# Batch 3 — Report core UX and safety

Prepared on `fix/report-core-batch-3` from main `81b673c` (Batch 2.1 included).
Physical iPhone Safari acceptance remains required. No frontend/Edge deployment,
schema migration, authentication change or commit was performed.

## Input and keyboard

`IssueComposer` is a controlled textarea shared by initial description and issue
follow-ups. It starts at one line, grows to 120px (five 24px lines), then scrolls
internally. Enter inserts a line break; the explicit Send button submits. Limits,
original wording, clarification handling and Phase 3A interpretation are unchanged.
Text remains in the mounted conversation during capture/review visibility changes.
The inactive microphone controls were removed; OS keyboard dictation remains usable.

The previous input used Tailwind text-sm (14px), a known iOS focus-zoom trigger.
The textarea uses 16px, min-width:0 and wrapping. The report-only visualViewport
listener sizes the flex conversation to the available mobile viewport on keyboard
resize, releases listeners on unmount and ignores non-unit user zoom. It neither
sets page scale nor disables accessibility zoom. Camera layouts are untouched.

## Explicit safety branch

Only the deterministic Yes answer sets the exact persisted value
`Immediate danger reported`; AI/keywords/images never set it. The danger card
offers Continue without photos plus a return to the question for correction.
Returning to the question does not silently clear Yes; explicitly selecting No
replaces it. The separate review shows structured fields, original wording, safety
answer and `No photos collected for safety reasons.` before Submit.

The live authoritative PM profile has phone=null and no approved verified contact
source exists. No Call button or fictional number is rendered. Tenancy-agreement
emergency maintenance guidance remains available. A verified phone/dialer scenario
cannot be accepted until an approved source is supplied; no schema was expanded.
Australian emergency wording was checked against the government's Triple Zero page:
https://www.infrastructure.gov.au/media-communications/phone/triple-zero
FixLens does not assess safety, dispatch emergency assistance or promise response time.

## Persistence contract and boundaries

Live constraints, INSERT RLS and triggers were inspected. Existing case creation
is a two-step process: case INSERT commits before photo upload, with one atomic
submission activity. The database has never required two photos for that INSERT.
No migration is needed for the new branch. It uses the existing stable case key,
session ownership checks, duplicate recovery and frozen Retry input.

`canSubmitReport` requires affirmative danger OR explicit No plus both local photos.
An additional branch match check prevents an ordinary review using the bypass.
Safety submissions never invoke persistReportPhotos or create placeholder evidence.
Normal flow retains Overview, Close-up, optional demo video, Final Review and the
existing service's strict two-photo validation. Direct Data API INSERTs remain the
pre-existing two-phase contract, not a server-enforced photo-completion guarantee;
this batch does not introduce a draft/finalize architecture or weaken any policy.

PM detail, renter detail variants and Submitted Report show a conditional safety
notice and intentional no-photo explanation. Completed safety cases do not inherit
the old fixture's `2 captured` label. Status, responsibility, activity and workflow
transitions are unchanged. PM request dialogs retain the safety warning; a safety
case's requested-photo flow requires an explicit safe-to-proceed choice before
opening capture. It can instead return to the case without opening the camera.

## Verification

- TypeScript and production build passed.
- 41 Node tests passed: safety eligibility and rendering, textarea rendering,
  existing Home/contact/request tests, camera lifecycle/torch/quality/framing,
  experimental Vision-disabled guard and PM annotation rendering.
- `supabase/tests/report_safety.sql` passed live inside a rolled-back transaction:
  affirmative safety INSERT, zero evidence, one submission activity, unique-key
  duplicate rejection, cross-session read/write denial and authorized PM visibility.
- Actual 375px input: 16px font, multiline wrapping, Enter newline, 120px cap with
  internal scrolling; explicit Send only. Review tested at 375×667, 390×844, 1024px
  and 1440px; Submit remains reachable by scrolling. No horizontal overflow.
- Controlled normal flow used local photo fixtures through actual preview/review
  screens; both photo roles reached persistence. Safety path did not upload.
- Controlled lost-acknowledgement failure retained report/Yes and the same case key;
  Retry recovered one simulated committed case. Separately, the actual creation
  service recovered the live committed disposable case without a duplicate.
- Real Phase 3A summary succeeded from approved localhost:5173. The auxiliary
  localhost:5176 origin correctly exercised the existing provider-failure fallback;
  its CORS diagnostic is not a new normal-path error. PM and approved-origin AI
  console warning/error checks were empty. No Edge Function was changed.
- Real disposable safety report submitted through the UI: correct session persona
  and property, one case, zero evidence/Storage objects, one initial activity.
  PM Dashboard/detail displayed it; authenticated Review changed it to Under review.
  Existing renter Home polling updated its Recent card; Cases and Submitted Report
  displayed the same case and safety information. PM request warning was verified
  without sending an additional request.

## Physical Safari checklist (required before final acceptance)

- On reviewed Preview, focus description and a follow-up: no unwanted zoom or
  horizontal shift; text and Send remain visible with the real keyboard.
- Enter several lines, exceed five lines, scroll/edit internally, dismiss/reopen
  keyboard and rotate: text retained and layout restored; user pinch zoom works.
- Correct Yes→question→No; verify normal two-photo flow on device.
- Yes→Continue without photos→review→Submit, including background/return and Retry.
- Confirm no camera request on the danger path and no fake Call action.
- Verify PM/renter safety presentation after refresh. No actual emergency calls.

Synthetic/browser viewport checks do not prove iPhone keyboard behavior. Normal
camera regression used fixtures plus automated lifecycle tests, not fresh physical
camera acceptance. No new independent polling or realtime system was introduced.

## Cleanup

The one live disposable case (`demo-7609950b-5c0b-4be9-bf97-41965e9fffa7`)
and its two activities were removed using exact ID, session and description guards.
It had no evidence rows, requests or Storage objects. Rolled-back SQL test rows
left no records. All seven pre/post table content hashes and counts match exactly:
2 profiles, 1 property, 14 cases, 11 requests, 27 evidence, 76 activities,
27 Storage objects. Existing seed and legitimate visitor records are preserved.
Storage orphan check: zero. Temporary harnesses, fixture SVGs and recovery scripts
were removed; permanent tests remain. `.env.local` stays ignored and unstaged.

## Files

Created:
- src/features/report/IssueComposer.tsx
- src/features/report/useReportViewport.ts
- src/features/report/SafetyReportReview.tsx
- src/components/common/SafetyNotice.tsx
- src/data/reportSafety.ts
- tests/reportSafety.test.ts
- tests/reportRendering.test.mjs
- supabase/tests/report_safety.sql
- docs/REPORT_CORE_VERIFICATION.md

Modified:
- src/features/report/ReportWorkflow.tsx
- src/App.tsx (pass existing safety answer to requested-photo flow)
- src/features/evidence/RequestedEvidenceWorkflow.tsx (safety gate only)
- src/components/pm/RequestInformationDialog.tsx (safety notice only)
- src/screens/pm/PMCaseDetail.tsx
- src/screens/renter/SubmittedReportScreen.tsx
- src/screens/renter/cases/BedroomCaseDetailScreen.tsx
- src/screens/renter/cases/HotWaterCaseDetailScreen.tsx
- src/screens/renter/cases/KitchenCaseDetailScreen.tsx
- README.md

Next manual action: review this branch/diff, use the normal approved Preview
release process, and complete the physical Safari checklist before acceptance.
Suggested commit: `feat: add safe no-photo reporting and multiline issue input`.

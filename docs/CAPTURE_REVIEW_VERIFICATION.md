# Batch 4 — Capture and Final Review

The annotation-editor presentation below records Batch 4. It is superseded by
[Batch 4.1 direct photo editing](ANNOTATION_EDITOR_VERIFICATION.md). Batch 4
workflow/persistence results remain applicable.

Prepared on `fix/capture-review-batch-4` from accepted main `a307ea5`.
Physical iPhone Safari verification remains required. No commit, push, deployment,
schema migration, Auth change or Edge Function change was performed.

## Annotation editor

Creation tools are Text and Draw. The six swatches are White #FFFFFF, Black
#000000, Yellow #FACC15, Blue #2563EB, Red #EF4444 and Green #22C55E. Swatches have
44px touch targets, accessible names and selected rings. Colour applies to selected
text, otherwise to the next annotation; unrelated annotations are preserved.

Text creation opens a focused native modal with Save/Cancel; nonempty text starts
at normalized image centre (0.5,0.5). Tap existing text for Edit/Delete controls;
drag it with pointer capture. Image coordinates account for letterboxing and remain
normalized. A reserved contextual toolbar row prevents image resizing mid-drag.
Touch-action:none is limited to the editable image, not read-only viewers.

Snapshot Undo/Redo supports text add/edit/move/delete, recolour and completed draw
strokes. One drag/stroke is one action; new edits clear Redo. No-op edits do not
create history entries; history is bounded to 50 undo snapshots.

PhotoAnnotation keeps its existing tool/points/text structure and adds optional
hex colour in the existing version-1 JSON metadata. Legacy annotations without
colour retain amber. Circle/Arrow remain rendered and validated but cannot be
created from the new toolbar. No database or Storage schema changes were needed.
Metadata validation continues rejecting invalid coordinates, oversized metadata
and invalid colour values. PM/renter read-only viewers share the same renderer.

## Camera and navigation

Only copy changed in PhotoSource. `Steady & well lit` is shown only for the existing
local ready hint; otherwise guidance remains neutral/lighting/movement advice.
Fallback labels are `Resume in-app camera`, `Try in-app camera again` and
`Open device photo picker`. Device-controlled native picker options are not promised.
Framing zones, rear-camera preference, JPEG capture, torch capability detection,
quality thresholds, stream lifecycle and Vision-disabled guards are unchanged.

Normal new reports now go Overview → Close-up → Final Review. Video is no longer
imported, mounted, offered or mentioned in that journey. Capture expectations and
preview counts are two photos. Legacy video models/exports are retained for
compatibility, with no new video persistence or simulated submission evidence.

## Final Review and replacement

One Edit details action opens a lightweight modal for issue type, location,
observed details/summary and original description. Save applies renter-approved
values directly; Cancel discards the local edit. No AI request is made on Save.
Identity/property/safety fields are not ordinary editable text fields.

The condition field is the single structured summary/observation representation.
If issue/location/original description changes while that field is untouched, the
outdated interpretation is cleared. The editor explains this rule; updated observed
details can be supplied explicitly. Original wording changes only through explicit
editing and Save. The dedicated Batch 3 safety question/review remains separate.

Each photo has full annotated preview and Replace photo. Replacement candidates
are separate from active draft photos. Capture exit or Cancel discards/revokes
only the candidate; original photo and annotations remain intact and submit-ready.
Retake discards only the candidate during replacement. Use photo commits it,
revokes the previous local URL and returns to Final Review. Old image annotations
are never copied onto the replacement. No Storage operation occurs until Submit.

After submission starts, details/replacement are locked. Stable case keys and
immutable photo IDs retain the existing Retry/idempotency behavior. Normal reports
still require both photos; affirmative safety reports bypass capture and photo
upload using the unchanged Batch 3 branch, without replacement controls or warnings.

## Verification

- TypeScript and production build passed; 47 automated tests passed, including
  annotation history, optional colour serialization/validation/rendering, legacy
  Circle/Arrow, report edits, safety, Home, requests, camera lifecycle/torch/quality,
  framing and the experimental Vision-disabled guard.
- Browser editor: centred text, focus, edit, desktop drag, delete, multiple notes,
  all six drawing colours and Undo/Redo. Drag image bounds remain identical before
  and after selection; coordinates remain unchanged on viewport resizing.
- Editor and Final Review checked at 375×667, 390×844, 1024px and 1440px. Text dialog
  focus/fit checked at mobile size; no horizontal overflow; controls/Submit reachable.
- Edit details Cancel/Save, approved values, photo full preview, both replacement
  roles, candidate cancellation, capture cancellation and Retake passed. Overview
  cancellation restored the exact original blob URL, text and six strokes.
- Real gallery picker selected a temporary SVG through the actual PhotoSource,
  converted it into the normal preview, allowed annotation and returned through
  Retake/Leave camera. No gallery-only test report was submitted.
- Controlled normal E2E used generated JPEG capture fixtures and structured-input
  fixtures with real Supabase creation/upload. Saved case contains approved edited
  fields, final Overview/Close-up with correct per-image annotations and no abandoned
  candidate. Six draw colours and text colours matched in actual renter/PM viewers.
- A separate real affirmative safety report had zero evidence/Storage objects.
- A real typed close-up request went Requested → Submitted → Resolved; its green
  text annotation displayed in PM, and canonical case status remained Under review.
  Overview/legacy/written dispatch and lifecycle eligibility tests also pass.
- Controlled partial upload failure retained selected photo IDs/annotations and
  report fields; Retry recovered successfully with editing locked. Separately,
  concurrent real committed-case and evidence recovery succeeded without duplicates.
- Normal renter/PM integration consoles were clean. Expected controlled-failure
  diagnostics were confined to the temporary harness. No expensive AI evaluation
  or new provider calls were used for these fixture-driven acceptance checks.

## Physical iPhone Safari acceptance (pending)

- Create/edit/cancel text; verify keyboard focus and dismissal without unwanted zoom.
- Drag text by touch, including near image edges; verify no page scroll or duplicate
  annotation. Rotate/resize, then check text/stroke placement and colour.
- Use all six swatches and meaningful Undo/Redo, including new edit after Undo.
- Capture Overview and Close-up on hardware; use gallery, retake, torch where
  supported, permission denial/Retry and return/background behavior.
- Edit details, cancel/confirm both replacement roles and submit final evidence;
  verify PM/renter presentation after refresh.
- Explicit danger → Continue without photos → Safety Review → Submit remains intact.

Desktop pointer/viewport checks and media mocks do not prove physical touch,
hardware camera, native picker choices or Safari keyboard behavior. Fresh live
integration used a close-up request; other request types were checked through the
existing focused regression tests. No new diagnosis, AI verification or video
persistence claim is introduced.

## Files

Created: src/components/capture/annotationEditing.ts,
src/components/capture/PhotoAnnotationEditor.tsx,
src/features/report/FinalReportReview.tsx, src/features/report/reportDraft.ts,
tests/annotationEditing.test.ts, tests/photoMetadata.test.mjs,
tests/reportDraft.test.ts and this document.

Modified: src/components/capture/AnnotatedPhoto.tsx,
src/components/capture/PhotoSource.tsx, src/components/capture/PrototypeCapture.tsx,
src/features/report/ReportWorkflow.tsx, src/services/evidence.ts,
src/types/evidence.ts, tests/pmAnnotations.test.mjs and README.md.

Next manual action: review the diff, use the approved Preview release process,
then complete the physical checklist before final acceptance.
Recommended commit: `feat: simplify annotations and make report review editable`.

## Cleanup and final review

Only the two verified disposable cases were removed:
`demo-62242e11-d4b0-466b-87fe-2376a413cc49` and
`demo-793c1714-ef87-48b7-ac86-85a4b0d80044`.
Cleanup used exact case IDs, session and descriptions, and checked related counts.
Three evidence rows were unlinked, then the three exact private Storage objects
were removed through Storage API while the owner case still existed. Case cleanup
removed one resolved request and six activities. No unrelated rows were touched.

Pre-test/restored counts: 2 profiles, 1 property, 15 cases, 11 requests, 27 evidence,
77 activities and 27 objects. Before cleanup: 17 cases, 12 requests, 30 evidence,
83 activities and 30 objects. All seven restored content hashes match the original
baseline exactly. Storage orphan count is zero.

Temporary browser harnesses, generated images, recovery/cleanup scripts and their
server were removed. No screenshots were saved to the repository. `.env.local`
remains ignored and unstaged; no credentials or provider secrets were introduced.
Database policies, Auth, Edge Functions and experimental Vision configuration are
unchanged. No Batch 5 work was started.

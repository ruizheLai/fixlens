# Batch 4.1 — Full-screen annotation editor

Prepared on `fix/capture-review-batch-4` from Batch 4 commit `39d24b7`.
Local implementation and focused verification completed on 16 October 2026.
Physical iPhone Safari acceptance remains pending. Nothing was committed, pushed,
merged or deployed by this batch. No database, Auth, Storage policy, Edge Function,
AI or camera/Vision configuration was changed.

## Implementation

- Black image-first canvas fills the renter screen. SVG `xMidYMid meet` contains
  the complete original photo in portrait and landscape. JPEG bytes are untouched.
  The established desktop phone shell remains in place.
- Compact top/bottom overlays use `rgba(0,0,0,.62)`, white controls and safe-area
  padding. Equal 88px header columns keep the truncated title mathematically
  centered independently of Undo/Redo state.
- Default footer: accessible Add text and Draw on photo icons, Use photo, and
  Cancel only in the existing replacement context. Targets are at least 44×44.
- The exact six existing colours appear only while drawing or editing text.
  White/black swatches retain visible selected rings. Historical amber remains
  readable; it does not become a new creation-palette colour.
- The old text dialog is removed. Text mounts a transparent on-photo textarea and
  focuses synchronously within the initiating gesture. Cancel/Done replace the
  normal header; existing text also exposes a contextual Delete icon.
- New text starts near the visual centre at normalized (0.3, 0.5), a left-aligned
  text anchor. Existing text keeps its original point. Intentional newlines and
  soft wrapping render through the shared viewer; long text near the bottom is
  fitted within the remaining image height without rewriting stored text/points.
  The existing 80-character limit is unchanged.
- Text content and colour are staged. Done commits one history action; Cancel
  commits nothing. Blank Done is disabled. The edited SVG text is temporarily
  hidden to avoid duplicate text. Delete is undoable. Legacy optional colour and
  existing points are preserved on an unchanged edit.
- Tap versus drag uses a 6 CSS-pixel threshold. Drag commits once on release;
  cancellation commits nothing. Draw disables text hit handling, so drawing over
  text cannot drag it or open the keyboard. Existing normalized drawing logic and
  snapshot history are retained; new edits invalidate Redo.
- ResizeObserver measures canvas and actual control bars. VisualViewport resize
  and scroll keep the editor within the visible parent area without hardcoded
  keyboard heights. Text mode fits its canvas between controls. Input font is
  at least 16px; accessibility zoom is not disabled. Display adjustments never
  write annotation points. Observers/listeners/tip timers clean up on unmount.
- Initial/Draw/text-move tips are dismissible, expire after four seconds, consume
  no layout space and show at most once per editor instance. They hide during
  text editing. App support controls remain absent on report/capture routes.

## Verification and limits

TypeScript (`npx tsc --noEmit`): PASS. Production build (`npm run build`): PASS.
49 focused tests pass: annotation history/colours, multiline bounds, shared
PM/renter historical rendering and edited-text hiding, evidence metadata
validation, report details/safety rendering and eligibility, camera lifecycle,
JPEG capture, torch, Vision-disabled guard and existing request/identity rules.

Browser interaction checks passed for focused direct input; multiline/colour Done;
new-text Cancel and blank Done; existing-text Cancel restoring content/colour;
mouse drag without opening input; deletion and Undo/Redo; all six drawing colours;
drawing over text without moving it; inactive drawing; new edit clearing Redo;
Retake/Use/Cancel callbacks. A clean editor tab had no console warnings/errors.
Temporary HMR syntax/module errors during development were corrected and are not
present in the clean success run.

Portrait 600×900 and landscape 1200×600 fixtures were checked at 375×667,
390×844, 1024×768 and 1440×900, both directly and in the real PhoneShell.
Header center error was 0 CSS pixels in all eight shell combinations. No horizontal
overflow; default palette absent; controls meet 44px targets. Desktop keeps the
390px renter shell. Before/after and responsive screenshots are saved outside the
repository in the task visualization directory.

Reducing a text-editing viewport from 390×844 to 390×400 kept Cancel, Done,
palette and input visible, with input font 16px and byte-identical committed
annotation data after restoring/cancelling. This checks resize behavior, **not a
physical Safari keyboard**. Touch dragging and Safari keyboard behavior remain
unverified on hardware.

A temporary browser fixture reused the current ReportWorkflow implementation,
starting at capture with a valid local report and stubbing only backend writes:
real gallery decoding → Overview annotation → Close-up → Final Review → local
submission success. Both submission photos remained `image/jpeg`; original text
and normalized points reached the submission payload. An annotated replacement
candidate was cancelled and the original Overview annotation restored. The shared
replacement Retake/Use/Cancel callbacks were also checked independently. Backend
persistence/idempotency and replacement confirmation logic were not changed;
Batch 4 live persistence acceptance is retained, not claimed as a new live test.

A second local fixture reused RequestedEvidenceWorkflow with a stubbed submit:
its existing danger safety gate required explicit confirmation, then gallery →
Requested photo editor → Review requested evidence → local submit callback passed.
The JPEG, overview role and annotation reached the payload. No live request was
submitted or resolved. Full live request lifecycle and isolation were not repeated
because their implementation/policies are unchanged.

Actual app Home/Cases/Inbox/Profile navigation and report entry were smoke checked;
Profile and seeded Cases rendered and the report confirmation had no support
button overlay. The clean actual app console had no warnings/errors. The browser
file chooser occasionally stalled (one prolonged call); decoding recovered and
subsequent local workflow checks passed. This is not hardware camera acceptance.

No live test cases or Storage objects were created. Temporary fixture sources,
HTML and gallery SVG were removed after testing. No dependency changes.

## Files

Created: `src/components/capture/annotationEditor.css`, this document.
Modified: `src/components/capture/PhotoAnnotationEditor.tsx`,
`src/components/capture/AnnotatedPhoto.tsx`,
`src/components/capture/annotationEditing.ts`, `tests/annotationEditing.test.ts`,
`tests/pmAnnotations.test.mjs`, `docs/CAPTURE_REVIEW_VERIFICATION.md`, `README.md`.
ReportWorkflow, RequestedEvidenceWorkflow, camera sources, evidence services and
annotation types are unchanged.

## Physical iPhone Safari acceptance

On an approved HTTPS Preview, with Vision still disabled:

- Check portrait/landscape camera and gallery photos: complete image, centred
  header, safe areas, compact bars, no overflow or floating support overlap.
- Tap Add text: caret/keyboard appear immediately on the image. Enter multiline
  and wrapped text, select every colour, confirm Done; test empty/new Cancel.
- Dismiss/reopen keyboard; rotate and use Safari chrome. Cancel/Done/colours and
  active input must stay reachable, without unexpected zoom/horizontal jumps.
- Tap existing text, edit/recolour/Cancel, then Done and Delete. Confirm no
  duplication and unchanged position after keyboard close/reopen.
- Drag with touch without opening keyboard; confirm Undo/Redo restores exactly.
- Draw in all six colours, including over text. Disable Draw and confirm gestures
  make no strokes. New edit after Undo must clear Redo.
- Retake, Use photo, both capture steps and Final Review. Cancel a replacement and
  confirm the original image/marks; confirm another replacement and check only
  the candidate is retained. Return correctly to Final Review.
- Submit a controlled normal report; verify stored annotations in renter/PM views.
  Check danger no-photo reporting and a requested-photo loop. Clean only verified
  disposable data through the established acceptance process.

Next manual action: review the diff, publish an approved Preview through the
normal manual process, and perform this physical checklist before final acceptance.
Recommended commit: `feat: add full-screen direct photo annotation editor`.

BATCH 4.1 — PHYSICAL MOBILE VERIFICATION PENDING

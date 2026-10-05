# Phase 3B-1 camera verification

This page separates mocked browser logic from physical-device compatibility.
No Phase 3B-1 Vercel deployment or physical iPhone test has been performed yet.

## Automated checks

Run `node --experimental-strip-types --test tests/camera.test.ts` (Node 24).
The nine tests cover rear preference/no audio, repeated acquisition, late permission
resolution after exit, Strict Mode-like remount timing, one stream owner, Retake,
unexpected end, denied/missing/busy devices, Gallery/visibility cleanup,
brightness/motion priority/hysteresis and intrinsic portrait JPEG dimensions.
They mock media APIs and do not certify a real camera or Safari permissions.

## Local acceptance — 6 October 2026

- TypeScript (`npx tsc --noEmit`), production build and all nine camera tests passed.
- Clearly labelled synthetic streams verified Overview capture/Retake, fresh
  Close-up acquisition, Circle/Arrow/Text/Draw and Undo/Redo across the accepted
  photos. The accepted second Overview replaced the discarded first capture.
- Dark/moving/stable guidance, denied/unavailable/initialization failures and
  unexpected stream end passed. Native picker and Gallery reached Preview;
  switching to Gallery stopped the active stream immediately.
- Peak active track count was one. Shutter, Retake handoff and Back/unmount
  released tracks. A delayed permission grant after exit was immediately stopped.
  Strict Mode timing and background/session invalidation also passed unit tests;
  actual OS camera indicators/background behavior remain device checks below.
- One disposable report used two synthetic captures and skipped optional video.
  Supabase contained exactly two original JPEG evidence rows/objects, normalized
  annotations covering all four tools, no video and one submission activity.
  Submitted Report loaded both private photos. PM Dashboard received the case
  automatically; PM Detail displayed the same photos/annotations and report fields.
- Existing kitchen requested-evidence entry opened the shared source. Synthetic
  live acquisition and Back cleanup passed; Gallery, annotation and review passed
  without submitting or changing its seeded request.
- The 390×844 capture layout had no horizontal overflow. Renter and PM acceptance
  tabs had no console warnings/errors. Physical camera permission was not surfaced
  by the Codex local browser, so these results do not certify webcam or phone access.
- Disposable case, its two evidence rows/Storage objects and submission activity
  were removed. Baseline restored: 8 cases, 13 evidence, 37 updates, 6 requests,
  13 Storage objects, zero orphan objects. Temporary camera pages, mock overlay,
  harness and Gallery fixture were removed; only permanent camera tests remain.
- AI/provider, PM workflow, Auth, Realtime, RLS and persistence services are unchanged.
  Existing requested-evidence and PM Realtime SQL suites had passed with rollback
  earlier in this phase; persistence code did not change during closeout.

## Physical iPhone Safari — pending

After the owner pushes the reviewed branch and Vercel creates its normal HTTPS
Preview, open that deployment's `/report` path. No current Preview contains these
uncommitted changes; do not use an older Phase 3A Preview to certify this work.
Production `https://fix-lens.app/report` should be checked only after merge/deploy.

1. Open the new HTTPS Preview in physical iPhone Safari and enter the normal report
   flow. Confirm AI summary and Safety, reach Overview, then tap Open camera.
   Confirm Safari asks for camera permission, allow it, and check the embedded
   live rear-camera view (where available). No microphone permission should appear.
   Check portrait orientation and “Show the issue and the surrounding area.”
2. Darken the camera, restore light, move then steady it. Check one readable hint
   at a time; shutter must remain available. No subject/blur judgment is expected.
3. Capture, verify the camera indicator turns off and Preview matches the frame
   with correct orientation and no rear-camera mirroring.
   Retake: one fresh stream, no old photo retained. Capture again and annotate.
4. Use photo → Close-up; check generic close-up guidance and fresh stream. Capture,
   annotate if desired, Use photo → Skip video → Final Review → Submit.
5. Check exactly two photos and annotations in Submitted Report and PM. Confirm
   the case appears through existing automatic updates; report fields are intact.
6. While live, choose Gallery and cancel/select a photo. Camera must stop. Verify
   selected photo → Preview → Annotation. Deny permission in a fresh permission
   context and verify native picker/Gallery can still complete both photos.
7. Background/foreground, Back, exit, rotate portrait/landscape, and re-enter.
   Check no persistent camera indicator, duplicate stream or inaccessible control.
8. Check requested-evidence entry and shared capture/Preview without changing an
   intentional seeded request. Use a disposable case if testing submission.
9. Remove only the identified disposable report/evidence/Storage objects afterwards.

No physical Android device is available for this verification. Desktop viewport
checks cannot certify Android Chrome or iPhone Safari. Browser camera hardware,
autofocus, permission persistence and software camera indicators need device tests.

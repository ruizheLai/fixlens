# Camera verification

This page separates mocked browser logic from physical-device compatibility.
The owner reported Phase 3B-1 functional checks passing on physical iPhone Safari
on 8 October 2026: camera permission/live feed, brightness/motion, capture, Retake,
Preview/annotation, two-photo flow and lifecycle cleanup. Phase 3B-1.1 changes the
layout and adds optional torch; its physical layout/torch recheck is still pending.

## Phase 3B-1.1 local layout verification — 8 October 2026

- Synthetic browser: Start guided capture immediately opened one stream, with no
  Open-camera intermediate CTA. Overview and Close-up used the same Cover surface.
- 375×667 and 390×844 had no horizontal or vertical document overflow. Shutter was
  fully visible (bottom at 647px and 824px respectively), with 48px icon targets.
- Instruction appeared above the controls, with quality status above it. Manual
  close and five-second auto-dismiss collapsed/faded it; status moved down and
  stayed visible. Help reopened the instruction. Reduced-motion CSS removes animation.
- Capture → Preview stopped the stream; Retake and Close-up each opened a fresh
  stream. Peak active streams remained one. Full-frame Preview and annotation
  alignment were preserved; Cover can hide sensor-frame edges in the live view.
- Mocked denial retained Retry/native picker/Gallery and disabled shutter. Native
  picker and icon-only Gallery both reached the existing Preview. Gallery stopped
  the stream and turned off an enabled mocked torch immediately.
- Unsupported torch was absent. Supported mocked torch toggled the existing track;
  capture/exit/Gallery reset it. No physical torch capability is claimed.
- Browser console had no warnings/errors. No live backend writes were required.
- Permanent suites: nine unchanged camera tests plus four torch tests (capability,
  confirmed toggle/constraints, pending-toggle cleanup race and failure degradation).
  TypeScript and production build passed. Temporary harness and fixture removed.

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

## Physical iPhone Safari — Phase 3B-1.1 recheck pending

Owner action: review/commit/push the current Phase-3B-1 branch, then open its newly
created Vercel HTTPS Preview at `/report`. No commit, push, merge or deployment was
performed during this follow-up. Older Previews cannot verify the new layout.

1. Enter the normal report flow → Start guided capture. Permission must appear
   directly when required, without Open Camera. Allow it; verify rear camera and
   no microphone permission. Live Cover video should fill the app content area.
2. With Safari toolbars expanded and collapsed, check top/back/help controls,
   centered shutter and Gallery icon stay reachable within safe areas. No page
   scrolling or horizontal overflow should be needed. Repeat on Close-up.
3. Check the instruction card in the lower-middle and local status above it.
   After about five seconds the card should fade and status move down smoothly.
   Reopen with Help, then dismiss manually. Darkness/motion/ready status remains
   dynamic and never blocks shutter. No green box or AI guidance should appear.
4. Torch must be absent unless the device/browser reports capability. If present,
   toggle it and confirm physical continuous light, then verify off after capture,
   Gallery, Back, backgrounding and exit. Report any mismatch; do not assume support.
5. Capture → Preview: correct orientation, no mirroring, full sensor-frame evidence
   (more at the edges than live Cover is expected). Annotate → Retake → fresh camera;
   verify cleanup/indicator and one session. Use photo → Close-up, then capture.
6. Gallery while live must stop camera/torch and reach Preview/Annotation. In a
   denied-permission context, Retry and native picker/Gallery must remain usable;
   no permanent native-picker row should appear during successful live capture.
7. Background/return, Back/navigation and abandon capture: no camera/torch remains
   active. Resume is explicit after backgrounding. Finish the existing two-photo
   report/optional-video skip if desired and verify renter/PM photo continuity.

Physical Safari toolbar, safe-area and torch behavior remain unverified for this
revision until the owner reports results. No physical Android verification is
claimed. Phase 3B-2 AI visual guidance, blur tuning and video persistence remain out
of scope. Local frames are not sent to AI or uploaded before report submission.

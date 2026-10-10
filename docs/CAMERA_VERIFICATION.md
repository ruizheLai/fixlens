# Camera verification

This page separates mocked browser logic from physical-device compatibility.
The owner reported Phase 3B-1 functional checks passing on physical iPhone Safari
on 8 October 2026: camera permission/live feed, brightness/motion, capture, Retake,
Preview/annotation, two-photo flow and lifecycle cleanup. The owner subsequently
confirmed the Phase 3B-1 / 3B-1.1 baseline physically works on iPhone Safari.
The historical checklist below is retained; it is not a Phase 3B-2 acceptance result.

## Phase 3B-2B — exhibition fallback, verified 10 October 2026

**PREPARED — FINAL MOBILE VERIFICATION PENDING.** Frontend Vision is disabled by
default via `captureVisionEnabled = false`. Static 76% Overview and 48% Close-up
zones remain; local 500ms brightness/stability, fixed five-second instructions,
Gallery, shutter, capability-based torch, Preview/Retake and annotations remain.
No AI text/arrows/Good framing or empty AI status container is rendered. This is
Guided Evidence Capture, not object recognition, damage detection or AR tracking.

### Browser acceptance (mock camera, real capture/report components)

The existing disposable harness instruments fetch/resource requests, scheduler
events and canvas encoding. Phase 3A returns an explicit fixture in this harness
only; no new provider evaluation or live report/database submission was performed.

- Overview: previous 25.6-second dwell passed with 0 Vision requests, 0 scheduler
  events and 0 analysis JPEG encodes. Ready → dark → Hold steady remained dynamic;
  shutter remained enabled. Auto-dismiss, Help reopen and manual instruction
  dismissal passed. Retake opened a fresh stream and cleared torch.
- Close-up: 30.3-second continuation dwell passed with 0 Vision requests,
  0 scheduler events and 0 analysis JPEG encodes. Only prior accepted-photo/Gallery
  blob encodes existed; no encoding occurred during live dwell. The separate
  Vision `toDataURL` path was never called.
- Complete journey: Overview → Retake → accepted Overview → fresh Close-up stream
  → accepted Close-up → optional-video Skip → Review report → Final Review.
  Both photos present and Submit report available; no submission executed.
- Offline simulation blocked every application fetch after the mocked text
  summary. Camera opened, quality sampling ran, shutter/Preview/annotation worked,
  Gallery imported a disposable local image into Preview, and Final Review was
  reachable. This tests capture independence from network, not service-worker
  cold-start support or offline submission. Browser/Vite resources remained loaded.
- Requested-evidence `PhotoSource` kept its actual instruction, no AI zone/message,
  zero Vision calls/events/analysis encodes, and returned its captured photo.
  The database response-upload workflow was unchanged and not rerun.
- Stream peak was 1, final active count 0; torch false after capture. Existing
  lifecycle/torch unit tests remain passing. Hardware/permission behavior is
  mocked here, not a new physical iPhone verification.
- 375×667 Overview and 390×844 Close-up showed visible static zones, no horizontal
  overflow and reachable shutter without scrolling; no empty AI status container.
  At 390px, Close-up zone width was 187.2px (48%); at 375px, Overview was 285px (76%).
- Browser console: no warnings/errors during the successful continuation run.

### Server guard, tests and deployment boundary

The handler only permits provider invocation when its server-owned boolean
`visionEnabled` is exactly true. Entry point reads only server environment setting
`CAPTURE_VISION_ENABLED === "true"`; missing/false/other strings fail closed. Client
headers cannot override it and additional request fields fail validation. Valid
disabled POST returns generic 503 `{"error":"Framing unavailable"}`. Existing
trusted OPTIONS 204, untrusted-origin 403, bad-key 401 and input validation remain.
Injected provider call counter is 0 for all disabled/missing-config tests. No
private setting or secret is returned. No OpenAI calls/tokens used for this phase.

44 automated tests passed before continuation: 13 framing/scheduler/crop, 7 framing
Edge (including disable guard), 1 exhibition flag, 9 camera, 4 torch and 10 Phase 3A.
TypeScript and production build passed. Continuation changed documentation only;
no redundant full suite or expensive provider evaluation was needed. Production
frontend bundle did not contain the framing endpoint or AI movement/Good strings.

Approved deployment on 10 October: only `analyze-capture-frame` deployed, v3 → v4
ACTIVE, bundle SHA256 `290ae9aecdacd7ce9894fb35a4b4dc19b5beac4f8d59b6ca99be0a0fa0b92a59`.
No secret/configuration settings were changed or enabled. Private environment
values were not read. `analyze-maintenance-issue` remains v3, unchanged bundle
SHA256 `371ebdeecda47d90d9d3be802137c4ec93044cb7d675b4c55a78dbc5d18a0d53`.

All 16 direct live HTTP checks passed: localhost, 127.0.0.1, fix-lens.app and the
approved FixLens/team Preview origin returned OPTIONS 204 with exact Origin echo
and all required allow headers, plus POST 503 `{"error":"Framing unavailable"}`.
Two unrelated origins returned OPTIONS/POST 403 with no allow-origin. Header and
query-string enable attempts returned 503, an added body field returned 400, and
an invalid public key returned 401. No wildcard origin was introduced.

Function logs confirm all 16 requests on version 4: four OPTIONS 204, two OPTIONS
403, six POST 503, two POST 403, one POST 400 and one POST 401. Runtime logs show
Boot/Shutdown only; no warning/error or provider URL/secret-pattern matches in
queried log attributes. Returned responses contain no settings or secrets. The
503 branches return before provider invocation; provider-spy tests prove disabled
execution makes zero calls. These logs do not independently meter outbound OpenAI
traffic or billing. Remote source retrieval returned MCP UNAVAILABLE twice;
deployment response, matching listed bundle hash and versioned live logs provide
deployment evidence. No additional provider accuracy calls were made.

Next manual action: publish/review the frontend Preview through the owner's normal
workflow and perform final mobile UX verification with Vision kept off. Check
static guides, local quality, two-photo flow and zero Vision network requests on
iPhone Safari. No Production frontend deployment is authorized.

Privacy: exhibition camera frames are not sent for Vision analysis. Accepted photos
still use the unchanged private evidence workflow when submitted. Phase 3A text AI
remains enabled. Experimental schema/rules/scheduler/provider code is preserved for
future controlled research. DB/RLS/Auth, PM, evidence persistence and two-photo
requirement are unchanged. Temporary harness/images/screenshots removed; permanent
tests retained. No commit, push, merge, migration or live disposable records.

## Phase 3B-2A — 9 October 2026 (historical)

**EXPERIMENTAL — PROVIDER ACCURACY BLOCKER.** No physical iPhone testing performed
or requested. Recommend disabling provider guidance for exhibition, preserving
static guide zones and local brightness/stability. This is a recommendation, not
an implemented disable switch. Next manual decision: approve that simplification
before exhibition deployment; do not proceed to physical AI-guidance acceptance.

Five exact output fields: targetPresence, coverage, distance, position, confidence.
Presence identifies the physical area/fixture, never proves the defect. The local
gate ignores framing fields when absent/uncertain; high-confidence absence returns
neutral Aim text without arrows, low confidence is always silent. Visible framing
must be known/coherent. Directions need high confidence and no context/distance
correction. Good requires visible + enough_context + good + centered, medium/high.
The prompt explicitly prioritizes uncertainty over guessing; missing/invalid/legacy
presence is rejected. Local validation cannot detect a semantically wrong visible.

### Bounded real-provider evaluation

12 calls / 12 crops from the same two public bedroom fixtures used previously,
predominantly a window-frame corner. This is not a broad maintenance benchmark.
Expected outcomes were recorded before calling. All 12 returned HTTP 200 and the
exact five-field contract; latency 1.007–3.905s, request bodies 1,120–39,416 bytes.
No additional tuning/recheck calls. Crops bounded to 768px, JPEG quality 0.65;
ambiguous crops deliberately contain only 16–30px of unidentifiable material.

| Case | Actual presence / confidence | Displayed guide | Assessment / prior comparison |
| --- | --- | --- | --- |
| Absent kitchen tap in bedroom | not_visible / high | Aim at the affected area | Pass; new clear absence control |
| Absent window, room/shadows | not_visible / high | Aim at the affected area | Improved: previously confident back/closer |
| Unidentified surface | visible / high | Good framing | Critical invented presence; unjustified positive framing |
| Unidentified partial edge | visible / high | Move left | Critical invented presence and unsupported direction |
| Overview tight | visible / high | Move back slightly | Useful, as before |
| Overview far | visible / high | Move a little closer | Useful, as before; raw right replaces previous incorrect down |
| Overview useful | visible / high | Move a little closer | Unnecessary correction; prior useful crop also failed (back) |
| Overview offset | visible / high | Move a little closer | Accepted scale correction; direction still masked |
| Close-up far | visible / high | Move closer | Useful; no former opposite-dimension conflict |
| Close-up useful | visible / medium | Move back slightly | Still incorrect scale; prior centered crop also got back |
| Close-up extreme tight | visible / high | Move back slightly | Plausible; uncertainty would be safer, not proof of recognition |
| Close-up offset | visible / high | Move back slightly | Incorrect scale still masks raw right, as previous recheck |

Critical false-confident guidance: **2/12 (16.7%) overall**, **2/2 on deliberately
unidentifiable crops**. Including the reviewed unnecessary/incorrect high-confidence
Overview-useful and Close-up-offset corrections gives **4/12 (33.3%)**, or 4/11
high-confidence outputs (36.4%). These tiny, correlated samples are descriptive,
not population accuracy estimates. Close-up-useful is an additional medium-confidence
error. No diagnosis was returned. No clear direction inversion was observed in this
set, but the only displayed direction was unsupported; directional reliability is
not established. High-confidence gating alone does not solve target hallucination.

Both clearly useful frames failed to receive sensible neutral/Good guidance.
The only Good response was on the unidentifiable surface. Explicit contradictory
coverage/distance pairs were 0/12 versus 5/9 initially; that improvement and correct
clear absence do not outweigh critical failures. Seven cues matched the predefined
acceptable sets, but message agreement is not an acceptance criterion. Historical
11-image / 15-call results below remain the comparison baseline.

### Engineering verification and scope

- 42 automated tests passed: 13 framing/rule/scheduler/crop, 6 framing Edge,
  9 camera, 4 torch, 10 unchanged Phase 3A. Includes absent/conflicting/low/uncertain,
  visible mode priorities, high/medium directions, good, malformed/missing presence.
- TypeScript and production build passed. Existing mobile mock-layout evidence
  below is historical, not a new physical or browser accuracy pass.
- Only framing function deployed: analyze-capture-frame v2 → v3 ACTIVE.
  analyze-maintenance-issue remains v3; no Phase 3A redeployment/evaluation.
- Same provider/model, low image detail, max 250 output tokens, store:false;
  key server-side only. Twelve evaluation requests incurred provider usage; exact
  billed tokens/cost were not exposed by the normalized endpoint.
- Scheduler, frame resizing, camera lifecycle/quality/torch, ReportWorkflow,
  annotations, Storage, PM and DB unchanged by this refinement. Existing 1.5s
  stability, 4s spacing, 5 attempts/stage across Retake, no overlap/stale output,
  memory-only analysis, no microphone and privacy constraints remain unchanged.
- Temporary downloaded images/crops/evaluation harness removed after recording
  results. No production frontend deployment, commit, push, merge or migrations.

## Phase 3B-2 — 9 October 2026 (historical, before 3B-2A)

**EXPERIMENTAL — provider framing quality needs review. Physical guidance testing
is pending; this phase is not marked complete or prepared for acceptance.**

Implemented without changing the camera foundation: four-field structured vision,
deterministic one-message mapping, local quality gating, sparse scheduling,
Overview corners / Close-up focus zone, memory-only downscaled frames and a separate
Edge Function. `analyze-capture-frame` v2 is active in project `ycnilqoqtgjmptxzuhty`;
Phase 3A `analyze-maintenance-issue` remains v3. V2 only clarifies visible-target,
camera-aim and coverage/distance semantics. No DB migration, Auth/RLS change or
client/Production deployment was performed.

### Small real-provider evaluation

11 distinct crops/images derived from two existing public bedroom fixtures;
9 initial calls, then 6 focused calls after one prompt clarification (15 total).
These predominantly exercise a window-frame corner, not a broad maintenance benchmark.
All calls returned HTTP 200 with the exact four-field schema; no semantic extras.
Latency approximately 1.1–3.7 seconds. JPEGs were 800–29,363 bytes, bounded to 768px;
JSON/base64 requests approximately 1.4–40KB. No full-resolution originals were sent.

| Example | Initial / focused recheck | Assessment |
| --- | --- | --- |
| Overview tight crop | Move back slightly | Directionally useful |
| Overview with context, clipped edge | Move back; contradictory dimensions initially, coherent on recheck | Plausible advice, unreliable judgement |
| Overview whole room | Move a little closer | Useful distance; returned downward position did not match target in upper-right |
| Overview offset | Move a little closer | Distance dominated; did not establish reliable directional guidance |
| Close-up from whole room | Move closer | Useful, but initial coverage/distance contradicted |
| Close-up useful crop | Move closer → Move back | Inconsistent scale; initial "centered" fixture label was also too generous (corner left of center) |
| Close-up extreme crop | Move back | Plausible; low/unknown would also be appropriate |
| Close-up offset | Move closer → Move back | Expected camera aim right; recheck returned right internally but incorrect distance masked it |
| No visible window, only room/shadows | Move back → Move closer, high confidence both times | **Failed uncertainty/absent-target gate** |
| Additional centered close-up | Move back | Did not recognize useful framing |
| Additional centered Overview | Move back | Did not demonstrate Good framing |

Initial superficial message matching was 6/9, but 5/9 had opposing coverage/distance
judgements; that is NOT a quality pass. The focused recheck removed those explicit
contradictions but only 1/6 matched the predeclared expected message set. In
particular, absence uncertainty, usable close-up scale and direction remain unreliable.
No further prompt tuning, model/vendor change or broad evaluation was attempted.
Good framing and low-confidence suppression are proven in deterministic/mock tests,
**not** demonstrated reliably by this provider evaluation.

Live CORS: localhost, 127.0.0.1 and the project/team Preview pattern returned 204,
echoing the origin; arbitrary `https://evil.vercel.app` returned 403 without ACAO.
The function reuses the unchanged validated Phase 3A CORS helper, not a wildcard.

### Automated and browser verification

- Final command: `node --experimental-strip-types --test tests/*.test.ts supabase/functions/tests/*.test.ts`.
  38 tests: 10 framing/rules/scheduler/crop tests, 5 framing Edge Function tests,
  9 camera tests, 4 torch tests, 10 unchanged Phase 3A tests.
- TypeScript and production build pass. Validation includes exact keys/enums,
  bad mode/context, malformed/oversized JPEG/body, image dimensions, normalized
  provider errors/malformed JSON, strict provider request and cost/CORS/key boundaries.
- Scheduler tests cover stable delay, dark/motion gating, cooldown, no overlap,
  five-attempt ceiling across Retake, independent stage budgets, stale/exit/step
  rejection, timeout watchdog, failure backoff and stale-guide expiration.
- Labelled synthetic browser tests: 375×667 Overview and 390×844 Close-up had no
  horizontal overflow or collisions with controls/local/instruction panel. Large
  Overview corners and smaller Close-up target render with one message. Move back,
  Move closer, Move left and Good framing were observed; direction mapping for all
  four actions is unit-tested. Low confidence rendered no instruction.
- Movement hid AI guidance and showed Hold steady; darkness showed the light
  warning. Counter remained unchanged while gated, then resumed after stability.
  Report-owned Overview budget reached 5 and stayed 5 after Retake. A subsequent
  focused two-stage run recorded 5 Overview + 3 failing Close-up calls with backoff.
  These are mock request counts, not physical-device/provider capture counts.
- Shutter remained enabled with guidance or unavailable analysis. Overview and
  Close-up reached Preview; Retake reopened camera; Use photo completed the focused
  sequence. Gallery after provider failure reached Preview and released all tracks.
  Peak active synthetic stream count was one; no console warnings/errors were seen.
- Requested-evidence live capture explicitly showed no framing zone and zero
  vision requests, even when the harness supplied a context/budget; exit cleaned up.
- One real Phase 3A browser request for a bedroom-window leak returned a structured
  issue/location/condition/summary and retained the confirmation/safety flow. The
  existing Phase 3A function/source/prompt were not changed or redeployed.
- Underlying capture/torch/quality tests remain green. No new real report was
  submitted during this follow-up; the existing evidence persistence path is unchanged.
  Mock/browser evidence is not a physical camera, torch or provider-accuracy test.
- Temporary harness, eval scripts/results and downloaded crops were removed after
  reference checks. No test report, Storage object or DB row was created. Only
  permanent tests and a labelled screenshot artifact outside the repository remain.
  Final diff has no Phase 3A/PM/Auth/RLS/persistence changes, staged files or secrets;
  `.env.local` is ignored and untracked. No commit, push, merge or Production deploy.

### Privacy and limits

Sparse downscaled frames are sent for framing analysis; they are not stored as
case evidence unless the renter presses the shutter and accepts the photo. More
precisely, analysis copies are discarded; a separately captured accepted photo
follows normal private submission. No analysis Storage object, DB row, localStorage
entry, image/base64 log or permanent frame file is created by the feature.
No microphone or continuous video. Only issue/location/observedCondition/summary
fields accompany the JPEG, not identity, address, PM, history or full case objects.
Images can themselves contain private surroundings; no automatic redaction is claimed.
OpenAI uses `store:false`, subject to the provider's separate retention policy.

Analysis: 1.5s usable stability, minimum 4s start spacing, max 5 attempts per stage
(including failures and Retake), no overlap. Client timeout 9s, server timeout 8s,
scheduler watchdog 10s, failure backoff 4/8/16s, shown-guide lifetime 8s.
Development-only `fixlens:framing` events expose stage/count/start/end/stale/limit,
not content. In a Vercel production-mode Preview use Safari Network to count calls;
development events are intentionally absent. No debug console logging is shipped.

### Physical iPhone Safari handoff — pending

First review the provider failures above; do not merge this as verified guidance.
If the owner chooses to test the experimental branch, review/commit/push
`Phase-3B-2` and open its new **Vercel Preview** on iPhone Safari. Existing/older
Previews do not include these uncommitted changes. Do not deploy Production.

1. Overview: large corners, enabled shutter; try too close, hold stable, wait for
   sparse advice; reposition target left/right, stabilize; assess direction and
   whether reasonable context ever yields Good framing. Record incorrect advice.
2. Close-up: smaller zone; start far, stabilize for Move closer; test near/off-center
   and useful framing. Guidance is advisory and never proves evidence sufficiency.
3. Shake, then darken: local Hold steady/light warning takes priority and requests
   pause. Restore a stable bright scene; no rapid catch-up burst.
4. Verify shutter regardless of advice, Preview/Retake, layout/safe areas and cleanup.
   If offline/provider unavailable, fixed guide/local checks and capture still work.
5. Record request counts separately: Overview ___ / Close-up ___ (maximum 5 each).
   Retake does not buy additional attempts; use a new report for a separate scenario.

Physical new-guidance accuracy, request counts and Safari overlays are **not verified**.
No Android claims. No diagnosis, object detection, tracked box, AR/WebXR, scores or
automatic shutter. Requested-evidence does not receive vision guidance.

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

## Historical Phase 3B-1.1 device checklist (subsequently owner-confirmed)

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

This historical checklist covered Phase 3B-1.1 only and has since been confirmed by
the owner. No physical Android verification is claimed. That baseline did not send
frames to AI; Phase 3B-2 changes this privacy boundary as documented at the top of
this page. Blur tuning and video persistence remain out of scope.

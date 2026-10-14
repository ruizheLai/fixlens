# FixLens

Batch 2 Home data and session-derived demo identities are prepared and verified.
The approved name-only PM profile update is applied; final Preview verification remains pending.
See [Batch 2 verification](docs/HOME_IDENTITY_VERIFICATION.md).

Batch 1.1 PM information requests passed approved live database acceptance on
14 October 2026. The frontend remains local and has not been deployed.
See [implementation and verification](docs/INFORMATION_REQUEST_VERIFICATION.md).

## Phase 3B-2B — Exhibition Guided Evidence Capture

Experimental Vision guidance is **disabled by default** in
`src/components/capture/captureVision.ts`. The camera keeps static Overview (76%)
and Close-up (48%) guides, fixed instructions, local brightness/stability, Gallery,
shutter, torch, Preview/Retake and annotations. It does not start the Vision
scheduler, prepare analysis JPEGs, send frames for analysis or show AI messages.
Accepted photos still use the existing private evidence upload workflow.
Phase 3A text-based issue understanding remains active and unchanged.

The prepared Edge guard also defaults off: only the server-only
`CAPTURE_VISION_ENABLED` setting exactly equal to `true` permits provider calls.
Missing/false/other values return a generic 503 after existing CORS/auth/input
validation, without calling OpenAI. Never configure this through Vite or client
headers. **Guard deployed with approval on 10 October 2026: framing v4 is ACTIVE.**
All 16 live disabled/CORS/override checks passed. No server settings were changed
or enabled. Phase 3A remains v3. Frontend Preview/final mobile UX verification
remain owner-controlled next steps.

Preserved Vision code is research-only. Re-enabling requires a deliberate code
change, server configuration, accuracy review and appropriate access/cost controls.
Do not market the current camera as object recognition or automated defect detection.
Historical evaluation below explains the fallback decision.

## Phase 3B-2A — experimental target-presence refinement

The strict output now adds `targetPresence` (visible / not_visible / uncertain).
Only confidently absent targets receive “Aim at the affected area”; uncertain or
low-confidence results stay silent. Visible targets still need coherent framing
dimensions, and directions require high confidence. This means identifying the
fixture/area, never confirming a defect.

**Provider accuracy blocker:** 12 real calls corrected both clear-absence examples,
but both unidentifiable crops were confidently called visible. One received Good
framing and one Move left. Recommend disabling provider guidance for exhibition
while retaining static zones and local quality feedback. This recommendation has
not been implemented as a feature switch. No physical testing is requested.

Normal Overview/Close-up capture now has a fixed four-corner guide and optional
server-side vision judgement. Local rules choose one short message from coverage,
distance and camera-aim position; confidence is an internal uncertainty control.
Local brightness/motion checks remain separate and gate analysis. Requests require
1.5 seconds of usable stability, at least 4 seconds between starts, no overlap and
at most 5 attempts per stage, including Retake. Shutter remains advisory/user-controlled.

Sparse downscaled JPEG frames (visible Cover crop, at most 768px, quality 0.65)
leave the device for OpenAI framing analysis through `analyze-capture-frame`.
They are memory-only and are not saved as case evidence. Accepted shutter photos
retain the existing private upload path. No microphone or continuous video is sent.
No identity/property/PM records are included; only four confirmed issue fields.
OpenAI `store:false` is used; this is not a promise of zero provider retention.

**Experimental, not acceptance-complete:** the small real-provider evaluation found
confident advice for an absent target and unreliable close-up/directional judgement,
even after one focused prompt clarification. Do not treat this as verified framing
accuracy. Physical Phase 3B-2 iPhone Safari verification is pending. See
[results and device checklist](docs/CAMERA_VERIFICATION.md#phase-3b-2--9-october-2026).
No diagnosis, object detection, tracked boxes, AR/WebXR, scores or automatic shutter.
Requested-evidence capture keeps its existing local guidance without this AI layer.

Run `node --experimental-strip-types --test tests/*.test.ts supabase/functions/tests/*.test.ts`,
`npx tsc --noEmit`, and `npm run build`. The new development-project function is
version 3; Phase 3A remains version 3. No migration or new dependency is required.

## Phase 3B-1.1 — camera layout

Start guided capture enters the shared camera directly, preferring the rear camera
and requesting video only. The live feed fills the app's dynamic viewport with
`object-fit: cover`; overlay controls respect safe areas. JPEG capture still keeps
the full intrinsic frame (bounded to 2048px), so Preview can show more at the edges.

A temporary instruction card fades/collapses after five seconds of live playback
or manual dismissal. Persistent local brightness/motion status moves down smoothly.
Gallery is icon-only. Native camera/file picker wording appears only in recovery
states. Torch is exposed only when the existing track reports support; rejected
or unverifiable toggles hide it without interrupting capture. Stopping the camera
also requests torch off. No new stream is opened for torch.

Preview, annotations, two required photos, optional simulated video and private
submission remain unchanged. Phase 3B-1 itself added no vision AI; the separate
Phase 3B-2 enhancement is described above. Blur remains deferred. The owner has
confirmed the Phase 3B-1 / 3B-1.1 baseline physically works on iPhone Safari.
See [camera verification](docs/CAMERA_VERIFICATION.md). Run
`node --experimental-strip-types --test tests/camera.test.ts tests/cameraTorch.test.ts`.

## Phase 3A — AI issue understanding

Reporting now uses OpenAI through the `analyze-maintenance-issue` Supabase Edge
Function. It extracts factual issue/location/observed details, asks only essential
clarifications (maximum two), and requires renter confirmation. Edit description
reruns understanding; failure offers Retry or Continue with my description.
Original renter wording and clarification answers are retained separately from
derived fields. Safety remains deterministic. Overview and Close-up are required;
video is optional, skippable and still a local simulation with no persistence.

AI does not diagnose, prioritize, recommend repairs, assess evidence, choose
capture requirements, change workflow or answer Other Questions. No provider key
belongs in Vite or `.env.local`. Setup, limits and verification are recorded in
[Backend setup](docs/BACKEND_SETUP.md#phase-3a--server-side-issue-understanding).

## Phase 2E — implemented hybrid automatic updates

Phase 2E uses authenticated private Broadcast for PM and scoped secure HTTP
polling for renters. Signals only invalidate reads; existing services remain
authoritative. Case Detail polls every 3 seconds while visible; Cases and Inbox
use 15 seconds. Hidden documents skip polls; focus, visibility return and online
events trigger a 150 ms debounced refetch without reloading the page. Home's
existing fixture summary is unchanged.

PM Dashboard subscribes to `fixlens:pm:cases`; Case Detail subscribes to its
`fixlens:pm:case:<caseKey>` channel. Both are private and require the existing
linked PM Auth profile. Triggers on cases, evidence_requests, evidence and
case_updates send empty invalidations (Supabase adds a generated event ID).
No private rows, session IDs, photo URLs, bytes or annotations enter Broadcast.
Domain tables remain outside the Postgres Changes publication.

The renter's `x-fixlens-demo-session` HTTP header is not WebSocket identity.
Existing HTTP RLS and private Storage authorization are unchanged. This identity
remains exhibition-only; production renter Auth could enable private authenticated
renter Realtime later. No renter identity bridge is implemented.

`useAuthoritativeRead` serializes reads, queues at most one follow-up, aborts
obsolete work and retains rendered data on background failure. Equal serialized
read models skip React data updates. PM RPC results replace authoritative state
and cancel stale reads. `useAutomaticInvalidation` coalesces signals, refetches
on subscription/reconnect, and removes channels/listeners/timers on unmount.
Manual navigation/refresh and focus recovery remain available.

Unchanged photos keep their mounted private Storage/blob views. Newly submitted
request IDs refresh gallery metadata; resolved status alone does not redownload
photos. Existing blob cleanup runs when a photo view unmounts or its path changes.
No new dependency, user-facing connection badge, or workflow redesign is added.

The earlier phase notes below describe their original checkpoints; Phase 2E supersedes their manual-refresh/Realtime-deferred statements.

FixLens is an AI-assisted rental maintenance reporting companion designed to help renters provide decision-relevant evidence and understand what happens after a maintenance report is submitted.

This repository contains the functional exhibition prototype developed from the FixLens high-fidelity UX prototype.

---

## Concept

FixLens focuses on two problems:

1. Renters often do not know what evidence a property manager needs to make an initial maintenance decision.
2. Renters often lose visibility into the status, responsibility, and next steps of a maintenance case after submission.

Core concept:

> A guided maintenance reporting companion that helps renters create a minimum sufficient report, then keeps the case status visible throughout the maintenance process.

---

## Exhibition Goal

The prototype aims to demonstrate a real end-to-end vertical slice:

Renter  
→ AI-assisted issue reporting  
→ adaptive guided capture  
→ structured report  
→ backend  
→ property manager portal  
→ status update or evidence request  
→ renter follow-up.

The goal is not to build a production-ready rental management platform.

---

## Core Features

### Renter

- AI-assisted maintenance issue reporting
- structured issue summary
- guided visual evidence capture
- adaptive camera guidance
- photo annotation
- report review and submission
- case status tracking
- Inbox updates
- additional evidence submission
- scoped FixLens support chatbot

### Property Manager

- receive submitted cases
- review structured reports
- view renter evidence
- update case status
- request additional evidence
- send renter-facing updates

---

## AI

AI is used selectively.

### Reporting Assistant

AI can:

- understand a renter's natural-language issue description
- identify issue type and location
- generate a concise structured description
- detect off-topic input
- identify important missing information where necessary

### Support Chat

The support chatbot answers only FixLens and rental-maintenance-reporting related questions.

Unrelated requests should be redirected rather than answered as a general-purpose assistant.

### Visual Guidance

Camera frames may be analysed periodically to provide adaptive guidance such as:

- Hold steady
- Try a brighter angle
- Move a little further back
- Move closer
- Include the whole window
- Good frame

The feature is better described as adaptive guided capture or an AR-style camera overlay rather than full spatial AR.

---

## Technology

Current:

- React
- TypeScript
- Vite
- Tailwind CSS

Planned:

- Supabase or an equivalent lightweight backend
- relational database
- evidence/file storage
- AI text analysis
- image/vision analysis
- property manager web portal

---

## Local Development

### Phase 2D-C — PM evidence review

Evidence requests now complete **requested → submitted → resolved**. After the
renter submits, PM explicitly confirms **Mark evidence reviewed**. The PM-only
transaction resolves the request and records one review activity without changing
the canonical case status. Both requested and submitted requests block approval;
normal under-review actions return only when all unresolved requests are cleared.
Photos, annotations and request history remain visible as **Evidence reviewed**.
Retry recovers committed responses without duplicate activity. Approval remains a
separate confirmed action. Cross-device updates require manual refresh; no AI
decision or Realtime is involved. See [Backend setup](docs/BACKEND_SETUP.md).

### Phase 2C-C — Renter evidence response

On a visitor-owned case, **Add requested evidence** opens a focused one-photo flow
with the real PM instruction. Native photo selection, Preview, Retake and optional
annotations are reused. Submit uploads a private JPEG, then atomically registers
request-linked evidence, changes the request to submitted and records one activity.
The canonical case status stays unchanged. Renter refresh shows **Evidence submitted
— awaiting review**; PM sees the photo/annotations alongside its request, separately
from original report evidence. Phase 2D-C adds the explicit PM review described above.

Retry retains the same photo ID and metadata, checks an existing upload, and recovers
committed success without duplicate objects, rows or activities. Cancelling before
submission writes nothing. Draft recovery after reload is not implemented; abandoning
an ambiguous failed attempt may leave an unlinked object for administrative cleanup.
The applied migration and verification are recorded in [Backend setup](docs/BACKEND_SETUP.md).
No new dependency or environment variable is required.

### Phase 2D-B — PM workflow

Open `/pm/login` and sign in with the existing exhibition PM Auth account.
`/pm` shows real cases across demo sessions; `/pm/cases/:caseKey` shows the
stored report, private photos with read-only annotations, requests and activity.
PM can record the canonical progression: **Submitted → Under review → Awaiting
approval → Arranging repair → Repair scheduled → Completed**. New transitions
require confirmation and atomically record activity. Under review also permits a
concise evidence request; this leaves case status unchanged and pauses the approval
action while requested evidence is pending. Next Action uses deterministic rules.
Refresh renter Cases/Detail/Inbox to see writes; Realtime is deferred.

PM Auth is linked administratively to Sarah Chen's existing profile. The PM client
persists its own Auth session; renter requests stay anonymous with the existing
demo-session header, even in the same browser. No new environment variables or
dependencies are needed. See [PM backend setup](docs/BACKEND_SETUP.md#phase-2d-b--pm-workflow-writes).
Approval and scheduling are manual PM records, with no external email, landlord
account or contractor integration. No AI recommendations,
PM Inbox or PDF are implemented. Renter demo sessions are not
production authentication.

Supabase schema and seed are applied; Cases, Case Detail, current evidence requests,
Inbox, and Submitted Report structured fields now read live data. Report submission
creates real visitor cases and initial activity, with browser demo-session isolation
and idempotent Retry. Overview and Close-up photos now persist in a private
Storage bucket with separate annotations. This is not production authentication.
Home, Profile, scripted support, video and requested-evidence acknowledgements
remain fixture/local. See [Backend setup](docs/BACKEND_SETUP.md).

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

---

## Vercel deployment

Import `ruizheLai/fixlens` with Framework Preset **Vite**, Root Directory **./**,
the default build command (**npm run build**) and output directory (**dist**).
Keep the default install command. First commit/push the reviewed deployment changes
to the branch Vercel will deploy; these changes are not published automatically.
Confirm that the selected production branch includes Phase 2C-A and vercel.json.

Enter these variables manually in Vercel for Production and Preview when testing
preview deployments (names only; never commit their values):

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Vite embeds these browser-safe values at build time; redeploy after changing them.
Never enter a database password, service-role key or private key in a VITE variable.
The shared client and its x-fixlens-demo-session header remain unchanged. Sessions
are localStorage/origin-specific: localhost, preview and production URLs have
different demo identities. This is exhibition isolation, not secure authentication.

The minimal vercel.json rewrite serves index.html for React Router deep links,
following [Vercel's Vite guidance](https://vercel.com/docs/frameworks/frontend/vite).
No server, middleware or functions are required. Phase 2C-Deploy was deployed and
verified on real mobile by the project owner. Phase 2C-B changes are local pending
review; this batch does not deploy or change Vercel settings.

Phone viewports below 768px use full width and 100dvh without a fake status bar,
rounded device frame or shadow. Larger viewports retain the centered 390×844
maximum phone preview. Local production-preview checks passed at 375×667,
390×844, 360×800 and desktop 1280×900, including scrolling, navigation, report
review/success and live submission. TypeScript/build and normal console checks
passed. No safe-area override was needed in desktop viewport testing; actual
phone browser chrome, keyboard, touch and safe-area behaviour remain unverified.

After deployment, verify HTTPS/secure context and direct entry/refresh/Back/Forward
for `/`, `/cases`, `/inbox`, `/profile`, `/support`, `/report`, all three seeded
case routes and `/cases/bedroom-window-leak/report`. On iPhone Safari or Android
Chrome, complete a report through submission, open its generated case and report,
refresh Cases/Detail, check Inbox and confirm a second browser cannot read it.
Check keyboard visibility, scrolling and bottom navigation without camera access.
Keep the existing backend security-review item documented in
[Backend setup](docs/BACKEND_SETUP.md) before public showcase use.

## Phase 2C-B — Photo evidence

Overview and Close-up use native image/file selection: the shutter requests the
rear camera where supported, and the gallery button selects a file. Photos stay
local until Submit. Preview, Retake and Final Review replacement use the selected
image. Circle, Arrow, Text and Draw store normalized coordinates separately from
the image; Undo/Redo edit the local marks. Submitted Report is read-only.

Submit confirms the case first, then uploads both JPEGs and confirms both evidence
rows before showing success. Retry reuses the case key and photo IDs and skips
confirmed rows. The private `case-evidence` bucket uses
`<demo-session>/<case-id>/<evidence-id>.jpg`. The shared client downloads private
images with the session header into revocable local blob URLs; no public image
URLs or signed-link expiry are involved. Refresh fetches the saved photos again.
Seeded reports without stored photos show an empty state, without fixture images.

Photos are resized to at most 2048px on the longest side and exported as JPEG
quality 0.9, without burned-in annotations or EXIF/GPS. Input limit: 20 MB; upload
limit: 6 MB. Unsupported image formats show a recoverable message. Video remains
a clearly labelled local simulation and creates no evidence rows.

The bucket/policy migration is applied; no extra environment variable or manual
backend setup is required for this project. Draft files survive only while the
report page remains open. Storage and database writes are not one transaction:
abandoning a failed upload can leave a partial case or unlinked file for
administrative cleanup. Session IDs are caller-controlled demo isolation, not
production authentication. See Backend setup for policies and verification.
PM and requested-photo responses are now implemented as described above.
AI, Realtime and PWA remain deferred.

## Project Structure

```text
fixlens-dev/
├─ AGENTS.md
├─ README.md
├─ docs/
│  ├─ PRODUCT_SPEC.md
│  ├─ UX_DECISIONS.md
│  └─ DEMO_SCOPE.md
├─ src/
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

---

## Current Stage

The high-fidelity UX prototype is complete enough to begin functional development.

Current development focus:

1. remove remaining Figma Make dependencies
2. establish a clean application architecture
3. connect real case data
4. implement AI-assisted issue understanding
5. implement real camera capture
6. add adaptive visual guidance
7. build a lightweight PM portal
8. complete the renter ↔ PM evidence request loop
9. prepare a stable exhibition demo

---

## Design Direction

FixLens should remain:

- clear
- calm
- trustworthy
- minimal
- professional
- quietly polished

The product innovation should come primarily from its reporting workflow, adaptive evidence guidance, AI-assisted issue structuring, and continuous case visibility rather than decorative UI.

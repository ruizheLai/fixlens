# FixLens Technical Architecture

## Phase 3B-1 — local camera acquisition

`PhotoSource` is shared by reporting and requested evidence. It renders a muted,
autoplay, playsInline video with contain fitting (the full unmirrored frame).
Initial camera permission follows an explicit Open camera action. A successful
camera choice is retained only in the current workflow, so Retake and Close-up
can open fresh streams; choosing Gallery/native picker clears that preference.

`CameraSession` serializes acquisition, including unresolved permission promises,
across mounts. Generation checks stop late streams; the current owner is stopped
before another acquisition. All tracks/listeners are released on capture, exit,
Gallery, unmount, pagehide or hidden visibility. Background return requires an
explicit restart. Video startup has a 15-second watchdog; an ignored permission
prompt may remain pending, while the picker and Gallery stay usable.

Shutter draws intrinsic video dimensions, proportionally bounded to 2048px, with
no mirror/crop transform; it stops the stream before asynchronous JPEG encoding.
The File passes through unchanged `preparePhoto`, preserving the existing local
photo contract, normalized annotation geometry and private Storage submission.
No upload occurs on shutter. Retake revokes/discards the old local photo.

`QualityGuidance` samples a downscaled frame every 500ms while live/visible.
Luminance and mean frame difference produce one advisory state: dark before motion,
then ready; fixed role guidance remains visible. Two matching samples, threshold
hysteresis and a 1.5-second minimum hold reduce flicker. No subject/framing detection,
blur verdict, percentage, automatic shutter, frame logging or network call exists.
Error states supersede advisory hints and retain picker/gallery access. No backend,
AI, Auth, RLS, Realtime, evidence contract or dependency change is required.

## Phase 3A — implemented issue understanding

`ReportWorkflow` calls `services/issueUnderstanding.ts` only on description send,
clarification send or explicit Retry. The service sends description plus at most
two question/answer pairs to `analyze-maintenance-issue`. It deliberately bypasses
the data client: no demo-session header or PM Auth token is needed. The function
validates input, calls one server-only OpenAI adapter and validates its strict JSON
result. No database client, tools or writes exist in this function.

Shared contract: `status` (sufficient / needs_follow_up / multiple_issues /
not_maintenance), nullable issue/location/observedCondition/summary, and bounded
followUpQuestions. One question is shown at a time, at most two per interpretation;
unknowns stay null. At the limit the app offers editing or raw-description fallback.
Clear issue + location proceeds directly. Multiple issues require selecting one;
off-topic input receives fixed application copy. Safety is a separate fixed step.

`useIssueUnderstanding` guards in-flight requests, aborts on exit/edit, retains input
on failure and exposes Retry. The renter explicitly confirms the result. Editing
starts a new interpretation; unconfirmed output never creates a case. The existing
submission service freezes its retry-safe snapshot and persists:

| Existing field | Phase 3A value |
| --- | --- |
| description | Original wording, plus verbatim clarification question/answer pairs |
| issue_type / location | Renter-confirmed derived values |
| condition | Confirmed summary plus observed condition, without exact duplicates |
| safety_response | Existing explicit safety answer |

No migration or AI transcript table is required. PM/Submitted Report read these
stored fields and never call AI again. Fallback uses the neutral category
“Maintenance issue”, null location/condition and the retained raw text.

Capture remains fixed: Overview + Close-up required, optional simulated video.
Video can be skipped before Final Review; no video row/upload is created. Existing
photo storage, annotations, PM workflow and Phase 2E invalidation remain unchanged.
No AI diagnosis, priority, repair advice, evidence assessment, capture selection,
workflow mutation or Other Questions integration is implemented.

See [backend setup](BACKEND_SETUP.md#phase-3a--server-side-issue-understanding) for
deployment, request limits, security scope and verification. Older target-architecture
examples below are superseded by this implemented Phase 3A contract.

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

## 1. Purpose

### Implemented Phase 2D-C surface

`resolve_evidence_request(case_key, request_id)` is an authenticated public
SECURITY INVOKER wrapper over a private, PM-authorized transaction. It locks the
case then the matching request, requires Under review plus a submitted request
with linked requested-photo evidence, and writes resolved/resolved_at and one
`message` activity (`Requested evidence reviewed.`) atomically. It touches case
recency but never changes canonical status. Already-resolved retries return
`already_applied`, including after later case progression, without another event.

Approval and new-request RPCs share the case lock and check every requested or
submitted request. Resolving one of several unresolved requests cannot unlock
approval. Generic request UPDATE remains denied; no new RLS or Storage policy is
introduced. `services/pm.ts` calls the controlled RPC. `PMWorkflowActions` freezes
the target request ID across Retry and reloads authoritative data after writes.

Next Action prioritizes Completed, unexpected unresolved non-review states,
requested evidence, submitted evidence, then ordinary lifecycle actions. Submitted
items are reviewed in stable creation/ID order. Only after all are resolved do
Request landlord approval and Request more evidence return. The dashboard attention
filter includes requested/submitted, not resolved. PM and renter keep reviewed
request/photo/annotation history; original report evidence stays separate. Refresh
is manual, with no Realtime, AI decision or automatic approval.

### Implemented Phase 2C-C surface

`RequestedEvidenceWorkflow` is a local subflow of Case Detail, not a restart of
`/report`. It owns one local photo, optional normalized annotations and a frozen
submission attempt. `services/requestedEvidence.ts` uploads an immutable JPEG using
the existing session/case/photo path and calls `submit_requested_evidence`.
The transaction locks the case then request, validates visitor ownership and stored
object existence, inserts one `requested_photo` linked by `evidence_request_id`,
sets the request to submitted and inserts one `evidence_submitted` activity. It does
not change the canonical case status. A unique request-photo index and exact-ID /
metadata recovery make repeated and concurrent retries safe.

Original report queries continue filtering `evidence_request_id IS NULL`.
`RequestedEvidenceGallery` shows additional photos/instructions on renter Detail;
PM Detail reads the same data with its separate authenticated client and existing
private-photo/annotation renderer. Under-review PM Next Action shows
Additional evidence submitted, with explicit PM resolution added in Phase 2D-C.
Refresh reloads authoritative data; no Realtime is used. Files/annotations stay
local until Submit and are discarded on unmount. An abandoned failed upload may
leave an unlinked object; durable drafts and automatic orphan cleanup are deferred.

### Retained Phase 2D-B surface

The renter route tree remains inside PhoneShell. A lazy `/pm/*` branch mounts a
desktop portal with `/pm/login`, `/pm`, and `/pm/cases/:caseKey`. PM Auth/profile
verification gates screen mounting; Supabase RLS enforces permissions. The PM
client has separate persisted Auth storage, while the existing renter client
continues anonymous demo-session requests on the same project.

`services/pm.ts` maps real case/property/renter/handler relationships and live
requests into PM views. Dashboard fetches paged records, then searches/filters
locally. Detail reads the case, chronological activity and persisted photos.
Evidence services accept an optional client; the existing download, validation,
normalized annotation renderer and object-URL cleanup are shared without changing
renter defaults. PM CSS is scoped to its desktop surface.

`review_case` preserves Submitted → Under review. `advance_case` accepts four
fixed actions for the remaining canonical progression, validating the source state
under a case row lock. Each transition and its activity commit together. Recorded
event types make Retry safe even after subsequent stages; no reopening is supported.
`request_case_evidence` shares the same lock, keeps the canonical status unchanged,
and creates a request plus activity atomically. A stable request UUID recovers lost
responses; a partial unique index permits one requested item while preserving history.
Requested and submitted evidence block approval progression in both UI and backend.
`PMWorkflowActions` owns confirmation/pending/Retry and reloads authoritative detail
after writes. Next Action is deterministic, without AI or optimistic status mutation.
Renter refresh observes changes through existing read paths and activity labels.
No Realtime, AI decisions, external email, landlord/contractor integrations,
PDF or PM Inbox are implemented.
The remaining sections describe the broader target architecture, not a claim
that those later capabilities already exist.

This document defines the technical architecture for the FixLens exhibition build.

It translates the product and UX specifications into an implementation plan.

The architecture should support a real end-to-end vertical slice:

Renter  
→ AI-assisted issue reporting  
→ adaptive guided capture  
→ structured report submission  
→ backend  
→ Property Manager Portal  
→ status update or evidence request  
→ renter response.

The objective is not production-scale architecture.

The objective is:

- understandable
- maintainable
- reliable for exhibition
- technically convincing
- simple enough to complete within the project timeframe

When technical sophistication conflicts with exhibition reliability, prefer reliability.

---

# 2. High-Level Architecture

FixLens will use one frontend codebase with two application surfaces:

1. Renter application
2. Property Manager Portal

Both communicate with the same backend.

High-level structure:

```text
┌──────────────────────────┐
│      Renter Web App      │
│                          │
│ React + TypeScript       │
│ Mobile-first UI          │
└────────────┬─────────────┘
             │
             │
             ▼
┌──────────────────────────┐
│        Supabase          │
│                          │
│ PostgreSQL               │
│ Storage                  │
│ Realtime                 │
│ Edge Functions           │
└────────────┬─────────────┘
             │
             ├──────────────────────┐
             │                      │
             ▼                      ▼
┌──────────────────────┐   ┌──────────────────────┐
│   AI Text Service    │   │   AI Vision Service  │
│                      │   │                      │
│ Issue extraction     │   │ Periodic frame       │
│ Support chat         │   │ analysis             │
└──────────────────────┘   └──────────────────────┘


┌──────────────────────────┐
│ Property Manager Portal  │
│                          │
│ React + TypeScript       │
│ Desktop-oriented UI      │
└────────────┬─────────────┘
             │
             └──────────────→ Same Supabase backend
```

---

# 3. Technology Stack

## Frontend

Use the current application stack:

- React
- TypeScript
- Vite
- Tailwind CSS

The existing Figma Make-derived UI is the starting point.

Do not rewrite the application from scratch.

---

## Routing

Use React Router.

Recommended package:

```text
react-router-dom
```

The router should support renter and PM surfaces within the same codebase.

Suggested routes:

```text
/
Renter Home

/report
Reporting Assistant

/capture
Guided Capture

/cases
My Cases

/cases/:caseId
Case Detail

/cases/:caseId/report
Submitted Report

/inbox
Inbox

/profile
Profile

/support
General Support Chat


/pm
PM Case List

/pm/cases/:caseId
PM Case Detail
```

The exact renter routing structure may be introduced gradually.

Do not rewrite all existing screen-state logic at once purely to introduce routing.

Migration should be incremental.

---

# 4. Frontend Architecture

The current application contains much of the prototype inside `App.tsx`.

Do not immediately perform a large refactor.

Refactor incrementally as functionality is added.

Recommended eventual structure:

```text
src/
├─ app/
│  ├─ router.tsx
│  └─ AppShell.tsx
│
├─ components/
│  ├─ common/
│  ├─ navigation/
│  ├─ cards/
│  ├─ chat/
│  ├─ capture/
│  └─ case/
│
├─ screens/
│  ├─ renter/
│  │  ├─ HomeScreen.tsx
│  │  ├─ ReportScreen.tsx
│  │  ├─ CaptureScreen.tsx
│  │  ├─ CasesScreen.tsx
│  │  ├─ CaseDetailScreen.tsx
│  │  ├─ SubmittedReportScreen.tsx
│  │  ├─ InboxScreen.tsx
│  │  ├─ ProfileScreen.tsx
│  │  └─ SupportChatScreen.tsx
│  │
│  └─ pm/
│     ├─ PMCaseListScreen.tsx
│     └─ PMCaseDetailScreen.tsx
│
├─ services/
│  ├─ supabase.ts
│  ├─ cases.ts
│  ├─ evidence.ts
│  ├─ ai.ts
│  └─ vision.ts
│
├─ hooks/
│  ├─ useCase.ts
│  ├─ useCases.ts
│  ├─ useRealtimeCase.ts
│  └─ useCameraAnalysis.ts
│
├─ types/
│  ├─ case.ts
│  ├─ evidence.ts
│  ├─ user.ts
│  └─ ai.ts
│
├─ utils/
│  ├─ cameraAnalysis.ts
│  ├─ guidanceRules.ts
│  └─ annotation.ts
│
├─ imports/
│  ├─ FixLens/
│  └─ Logo/
│
├─ App.tsx
├─ main.tsx
└─ index.css
```

This represents a target structure.

Do not create every folder or abstraction before it is needed.

---

# 5. Shared Data Model

The renter application and PM Portal must operate on the same case records.

Avoid maintaining separate renter and PM copies of the same maintenance case.

The backend should act as the source of truth.

---

# 6. Supabase

Supabase is the preferred backend for the exhibition build.

Use Supabase for:

- PostgreSQL database
- evidence file storage
- realtime subscriptions
- lightweight server-side / edge functions

This avoids building and deploying a custom backend server unless later required.

---

# 7. Core Database Tables

The schema should remain deliberately small.

## profiles

Represents demo users.

Suggested fields:

```text
id
role
name
email
phone
created_at
```

Role values:

```text
renter
property_manager
```

Production-grade organization and permissions modelling is not required.

---

## properties

Suggested fields:

```text
id
address
renter_id
property_manager_id
created_at
```

For the exhibition build, one seeded rental property is sufficient.

---

## cases

Represents a continuous maintenance case.

Suggested fields:

```text
id
property_id
renter_id
issue_type
location
description
condition
safety_response
status
handled_by
created_at
updated_at
```

Suggested `status` values:

```text
submitted
under_review
awaiting_approval
arranging_repair
repair_scheduled
completed
```

Do not use:

```text
action_required
more_information_needed
```

as permanent primary case statuses.

Those should be represented through evidence requests or other case actions.

---

## evidence

Suggested fields:

```text
id
case_id
evidence_request_id
evidence_type
storage_path
annotation_data
created_by
created_at
```

Suggested evidence types:

```text
overview
close_up
video
requested_photo
```

`evidence_request_id` may be null for original report evidence.

---

## case_updates

Represents activity visible in the case history / Inbox.

Suggested fields:

```text
id
case_id
update_type
message
created_by
created_at
```

Example update types:

```text
submitted
review_started
status_changed
evidence_requested
evidence_submitted
repair_scheduled
completed
message
```

---

## evidence_requests

Suggested fields:

```text
id
case_id
instruction
requested_by
status
created_at
submitted_at
resolved_at
```

Suggested lifecycle:

```text
requested
submitted
resolved
```

Evidence request state must remain independent from the main case status.

---

# 8. Demo Users

Do not build production authentication during the first implementation.

Use predefined demo identities.

Example renter:

```text
Brad Lai
```

Example property manager:

```text
Sarah Chen
Apex Rentals
```

The frontend may initially use fixed demo user IDs.

Example:

```ts
const DEMO_RENTER_ID = "..."
const DEMO_PM_ID = "..."
```

These can later be moved into configuration.

Do not spend exhibition-development time building:

- registration
- password reset
- email confirmation
- MFA
- organization administration

---

# 9. Supabase Storage

Use Supabase Storage for evidence files.

Recommended bucket:

```text
case-evidence
```

Suggested path structure:

```text
case-evidence/
  {caseId}/
    overview/
    close-up/
    requested/
    video/
```

Example:

```text
case-evidence/
  CASE-123/
    overview/
      overview-001.jpg
```

Do not store large image data directly inside database rows.

Store:

```text
storage_path
```

in the `evidence` table.

---

# 10. Image Upload Strategy

Captured photos should be compressed before upload where practical.

The exhibition version does not need original full-resolution camera files.

Preferred process:

```text
Camera capture
↓
Resize / compress
↓
Preview
↓
Annotation data
↓
Upload image
↓
Create evidence database record
```

Aim for a reasonable balance between image quality and upload speed.

---

# 11. Annotation Storage

Do not permanently burn annotation graphics into the original photo unless useful for export.

Store annotations as structured overlay data.

Example:

```json
[
  {
    "type": "circle",
    "x": 0.42,
    "y": 0.61,
    "width": 0.18,
    "height": 0.12
  }
]
```

Coordinates must be normalized between:

```text
0 and 1
```

rather than saved as viewport pixels.

This allows the same annotation to render correctly:

- on the renter phone,
- on Submitted Report,
- in the PM Portal.

---

# 12. AI Architecture

AI should never directly control application state.

Preferred pattern:

```text
User input
↓
Frontend
↓
Secure server-side function
↓
AI model
↓
Structured result
↓
Application validation
↓
UI state
```

Never expose a private AI API key in browser-side React code.

---

# 13. AI Server Layer

Use Supabase Edge Functions for AI requests unless implementation constraints suggest another lightweight server environment.

Suggested functions:

```text
analyze-maintenance-issue
support-chat
analyze-capture-frame
```

The frontend communicates with these functions.

The functions communicate with the external AI provider.

---

# 14. AI Provider Abstraction

Do not tightly couple application state to a specific AI provider.

Use a small application-level service interface.

Example:

```ts
interface IssueAnalyzer {
  analyze(description: string): Promise<IssueAnalysis>
}
```

The first implementation may use one provider, but frontend code should consume FixLens-specific response objects rather than provider-specific raw responses.

---

# 15. AI Issue Extraction

Primary reporting AI endpoint:

```text
analyze-maintenance-issue
```

Input:

```json
{
  "text": "Water comes through the bottom of my bedroom window whenever there is heavy rain."
}
```

Expected output:

```json
{
  "inScope": true,
  "issueType": "Water leak",
  "location": "Bedroom window",
  "description": "Water enters through the lower bedroom window frame during heavy rain.",
  "condition": "Occurs during heavy rain",
  "safetyConcern": null,
  "missingFields": []
}
```

The schema may evolve, but it should remain:

- small
- predictable
- validated
- directly useful to the UI

---

# 16. Off-Topic Classification

The same issue-analysis request may classify an input as out of scope.

Example:

```json
{
  "inScope": false
}
```

The frontend should then use a controlled redirect message.

Example:

> I’m here to help you report maintenance issues in your rental property. Please describe the issue you want to report.

The AI does not need to generate a long response to unrelated input.

---

# 17. AI Validation

Never assume AI output is valid.

Validate structured output before using it.

If required fields are missing or parsing fails:

Use a safe fallback.

Example:

```text
I understood that you're reporting a maintenance issue, but I need a little more detail. What part of the property is affected?
```

AI failure should not break the reporting journey.

---

# 18. General Support Chat Architecture

General Support Chat may use a real AI response.

Input should include:

- user message
- compact FixLens support instructions
- domain boundaries

The system should restrict supported topics to:

- FixLens usage
- maintenance reporting
- evidence requirements
- case states
- evidence requests
- post-submission workflow

For unrelated input:

redirect.

For legal advice:

state that FixLens cannot provide legal advice.

For technical repair instructions:

state that FixLens can help document and report the issue but cannot provide repair instructions.

Do not give the model unrestricted general-purpose assistant behaviour.

---

# 19. AI Conversation Memory

Long-term chatbot memory is not required.

For Reporting Assistant:

Only the current reporting session needs context.

For General Support Chat:

A short current-session message history is sufficient.

Do not build persistent AI conversation history unless later required.

---

# 20. Camera Architecture

Use the browser camera API.

Core browser capability:

```text
navigator.mediaDevices.getUserMedia()
```

Preferred initial implementation:

- mobile web camera
- rear camera where available
- live video preview
- camera overlay
- still photo capture

Device compatibility must be tested on the actual exhibition phone.

---

# 21. Camera Capture Pipeline

Recommended pipeline:

```text
Open camera
↓
Live video stream
↓
Local quality analysis
↓
Periodic AI vision analysis
↓
Guidance rule engine
↓
Capture
↓
Preview
↓
Optional annotation
↓
Use photo
↓
Store evidence
```

---

# 22. Local Visual Analysis

Local analysis should handle simple measurable image conditions before using AI.

Initial checks:

## Brightness

Estimate average frame luminance.

Possible state:

```text
too_dark
acceptable
```

## Movement

Compare successive sampled frames.

Possible state:

```text
unstable
stable
```

## Blur / Sharpness

Optional if implementation remains simple.

Possible state:

```text
blurry
acceptable
```

Local analysis should remain lightweight.

Do not introduce a heavy computer-vision framework unless necessary.

---

# 23. AI Vision Analysis

AI vision is used for higher-level visual interpretation.

Do not send every frame.

Suggested sampling:

```text
approximately every 2–5 seconds
```

Only analyse when appropriate.

For example:

- camera is relatively stable,
- previous AI request has completed,
- minimum interval has elapsed.

---

# 24. Vision Endpoint

Suggested server function:

```text
analyze-capture-frame
```

Input may contain:

```text
compressed frame image
capture type
issue archetype
issue summary
```

Example:

```json
{
  "captureType": "overview",
  "issueArchetype": "door_window",
  "issueType": "Water leak",
  "location": "Bedroom window"
}
```

Image data should be included through the chosen upload/request mechanism.

---

# 25. Vision Response

Keep the response small.

Example:

```json
{
  "targetVisible": true,
  "framing": "too_tight",
  "context": "insufficient",
  "quality": "acceptable"
}
```

Possible values for framing:

```text
too_tight
good
too_loose
unknown
```

Possible context values:

```text
insufficient
good
unknown
```

Do not ask the AI to generate arbitrary long UI guidance.

Application rules should convert vision results into controlled user-facing messages.

---

# 26. Guidance Rule Engine

The guidance engine belongs in application code, not in the AI model.

Example priority:

```text
1. Too dark?
   → Try a brighter angle

2. Camera unstable?
   → Hold steady

3. Vision says framing too tight?
   → Move a little further back

4. Vision says framing too loose?
   → Move closer

5. Context insufficient?
   → Include more of the surrounding area

6. Everything acceptable?
   → Good frame
```

This is intentionally small.

Do not build a large generic rules framework unless evidence shows it is necessary.

---

# 27. Guidance Stability

Adaptive guidance should not rapidly change.

Keep guidance visible for a minimum period.

Example:

```text
2–3 seconds
```

Possible implementation:

- debounce
- minimum state duration
- require repeated result before changing state

The exact algorithm can remain simple.

The UX goal is stability, not maximum responsiveness.

---

# 28. Capture Archetypes

Use a small mapping between issue archetypes and evidence requirements.

Example:

```ts
const capturePlans = {
  water_leak: [
    "overview",
    "close_up",
    "video"
  ],

  door_window: [
    "overview",
    "close_up",
    "video"
  ],

  appliance: [
    "overview",
    "close_up"
  ],

  fixture_damage: [
    "overview",
    "close_up"
  ],

  general_visual_damage: [
    "overview",
    "close_up"
  ]
}
```

Video may be optional.

Unknown issue types should use the generic fallback plan.

---

# 29. Video

Video is lower priority than photography.

If implemented, use:

```text
MediaRecorder
```

for short clips.

Recommended exhibition constraints:

- short duration
- simple preview
- no complex editing
- reasonable compression

If browser compatibility or upload reliability becomes problematic:

retain the video UX while reducing technical scope.

Photo capture must not depend on successful video implementation.

---

# 30. Case Submission Flow

Recommended end-to-end sequence:

```text
User confirms report
↓
Create case record
↓
Upload evidence
↓
Create evidence records
↓
Create submitted case update
↓
Show submission success
↓
Navigate to Case Detail
```

If evidence upload occurs before case creation for implementation reasons, ensure the final data relationship remains consistent.

---

# 31. Property Manager Portal Architecture

The PM Portal UI has not yet been finalized.

Do not lock the architecture to a specific desktop layout.

The backend only needs to support the following capabilities:

```text
Case List
↓
Case Detail
↓
Review Evidence
↓
Update Status
or
Request Evidence
```

The initial portal can remain extremely lightweight.

---

# 32. PM Case List Data

The PM Case List should be able to retrieve:

```text
case id
issue type
location
renter
property
status
created at
updated at
action-required indicator
```

The final UI design will be determined separately.

---

# 33. PM Case Detail Data

The backend must allow PM Case Detail to retrieve:

- renter information
- property information
- structured issue summary
- safety response
- original evidence
- annotations
- current status
- evidence requests
- activity history

This data requirement is stable even though the final PM visual design is not yet complete.

---

# 34. PM Status Update

PM may update the main case lifecycle.

Example:

```text
submitted
→ under_review
→ awaiting_approval
```

When status changes:

1. update `cases.status`
2. update `cases.updated_at`
3. create a `case_updates` record
4. notify the renter UI through realtime data where possible

---

# 35. PM Evidence Request

PM may create an evidence request.

Flow:

```text
PM enters instruction
↓
Create evidence_requests record
↓
Create case_updates record
↓
Renter receives Action Required state
↓
Renter captures evidence
↓
Evidence linked to request
↓
Request becomes submitted
↓
PM reviews
↓
Request becomes resolved
```

Do not change the main case status solely because an evidence request exists.

---

# 36. Realtime Architecture

Use Supabase Realtime where practical.

The renter app should subscribe to changes related to its active case.

Relevant changes:

- case status
- case updates
- evidence requests

The PM portal may also subscribe to:

- new cases
- newly submitted evidence

Exhibition realtime behaviour does not need production-level notification infrastructure.

---

# 37. Inbox Generation

Inbox does not require a separate complex messaging system.

Initial Inbox can be derived from:

```text
case_updates
```

Examples:

```text
Your report is now under review.
Additional evidence requested.
Repair scheduled.
```

An unread/read field may be added later if required.

Do not build a full chat messaging system unless the product scope changes.

---

# 38. Demo Reset Architecture

The exhibition build should support a repeatable demo.

Provide a development/demo reset mechanism.

Possible implementation:

```text
POST / reset-demo edge function
```

or a controlled frontend/admin utility that resets seeded demo records.

Reset may:

- restore demo case status
- remove visitor-created evidence
- remove evidence requests
- clear case updates
- restore seeded renter/PM data

Do not expose destructive reset controls prominently to normal visitors.

---

# 39. Environment Variables

Browser-safe variables may include:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Private secrets must never use the Vite `VITE_` prefix.

Private server-side environment variables may include:

```text
AI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
```

These must only exist in secure server / edge-function environments.

Never commit real secrets to Git.

---

# 40. Local Environment Files

Use:

```text
.env.local
```

for local development.

Ensure `.gitignore` contains:

```text
.env
.env.local
.env.*.local
```

Optionally provide:

```text
.env.example
```

containing variable names but no real keys.

Example:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

# 41. Security Scope

The exhibition build is not intended to demonstrate production security.

However:

- never expose private AI keys in frontend code,
- never commit service-role credentials,
- do not store secrets in Git,
- avoid publicly writable unrestricted database tables,
- keep basic Supabase access rules sensible.

Do not over-invest in production security engineering before the core demo works.

---

# 42. Error Handling

Every network-dependent feature should have graceful fallback behaviour.

---

## AI Issue Extraction Failure

If AI request fails:

Allow the renter to continue using a generic issue description.

Example:

> I couldn't automatically structure that description right now, but you can continue with your report.

Do not block the full flow.

---

## Vision Failure

If vision analysis fails:

Continue showing generic capture guidance.

Example:

> Keep the affected area clearly in frame.

Camera capture should still work.

---

## Evidence Upload Failure

Show:

- clear error state
- Retry action

Do not silently lose the captured image.

---

## Realtime Failure

Allow ordinary data refresh.

The system should still function without realtime subscriptions.

---

# 43. Loading States

Provide visible feedback for:

- AI issue analysis
- AI support response
- frame analysis when appropriate
- evidence upload
- report submission
- PM status update

Avoid unexplained pauses.

For exhibition, perceived responsiveness matters.

---

# 44. Performance

Prioritize:

- fast initial load
- responsive camera
- compressed uploads
- small AI response schemas
- infrequent vision requests

Do not introduce large computer-vision libraries without a strong reason.

---

# 45. Mobile Considerations

The renter application is mobile-first.

Test on the actual intended exhibition device.

Important areas:

- camera permission
- rear camera selection
- image orientation
- capture button size
- bottom safe area
- keyboard behaviour
- viewport height
- touch targets
- Safari/Chrome compatibility

Desktop browser testing alone is not sufficient.

---

# 46. PM Portal Considerations

The PM Portal is primarily desktop-oriented.

The current architecture should support a responsive layout, but mobile PM optimization is not required.

The PM Portal design can be created after the backend contract is stable.

Architecture should not assume a particular table/card layout.

---

# 47. Development Strategy

Do not implement the entire architecture in one large Codex task.

Use small phases.

---

## Phase 0 — Baseline

Already largely complete:

- remove Figma Make dependencies
- preserve working prototype
- verify build
- establish project documentation

---

## Phase 1 — Frontend Foundation

Goals:

- introduce shared TypeScript models
- introduce React Router carefully
- establish renter routes
- preserve existing visual design
- begin extracting only useful components from `App.tsx`

Do not redesign screens.

---

## Phase 2 — Supabase Foundation

Goals:

- create Supabase project
- configure environment
- create initial tables
- seed demo renter
- seed demo PM
- seed demo property
- connect frontend
- prove read/write with one test case

---

## Phase 3 — Real Case Submission

Goals:

- convert current report data into typed application state
- create real case
- upload evidence
- open real Case Detail from backend data

At this stage, scripted AI may temporarily remain.

---

## Phase 4 — AI Issue Understanding

Goals:

- create secure AI endpoint
- send renter description
- return validated structured JSON
- update reporting UI
- implement off-topic handling
- add graceful fallback

---

## Phase 5 — PM Portal

Goals:

- implement basic `/pm`
- show real cases
- open Case Detail
- update status
- verify renter receives change

PM visual design can be refined separately after functionality exists.

---

## Phase 6 — Real Camera

Goals:

- use actual mobile camera
- capture overview photo
- capture close-up
- preview
- store evidence

Do not add adaptive vision until basic camera reliability is proven.

---

## Phase 7 — Adaptive Capture

Goals:

- local brightness analysis
- local movement/stability analysis
- periodic vision calls
- small guidance rule engine
- stable guidance transitions
- Good Frame state

---

## Phase 8 — Evidence Request Loop

Goals:

- PM creates request
- renter receives Action Required
- targeted recapture
- submit additional evidence
- PM receives evidence
- resolve request

This completes the strongest end-to-end FixLens loop.

---

## Phase 9 — Support Chat

Goals:

- scoped AI support chatbot
- domain boundaries
- off-topic redirect
- unsafe/legal boundary handling

---

## Phase 10 — Exhibition Hardening

Goals:

- demo reset
- retries
- loading states
- network fallback
- device testing
- QR/deployment
- rehearse complete visitor journey

---

# 48. Git Strategy

Use small commits corresponding to meaningful development milestones.

Examples:

```text
chore: establish FixLens project architecture

feat: add renter routing

feat: connect Supabase case data

feat: implement AI issue extraction

feat: add real photo capture

feat: add adaptive capture guidance

feat: add property manager case portal

feat: support additional evidence requests
```

Avoid making unrelated major changes in one commit.

---

# 49. Architecture Principles

When making technical decisions, prioritize in this order:

1. Exhibition reliability
2. End-to-end continuity
3. UX fidelity
4. Maintainability
5. Technical sophistication

A simpler implementation that reliably demonstrates the intended interaction is better than a technically impressive implementation that frequently fails.

---

# 50. What Must Be Real

The following should eventually be genuinely functional:

- renter free-text issue input
- AI issue structuring
- real still-photo camera capture
- backend case creation
- evidence storage
- PM receipt of the case
- PM status update
- PM evidence request
- renter receipt of the request
- renter submission of additional evidence

---

# 51. What May Be Simplified

The following may be deliberately simplified:

- user authentication
- adaptive camera analysis frequency
- issue coverage
- computer-vision accuracy
- video support
- realtime notification behaviour
- PM interface design
- role/organization management

---

# 52. What Should Remain Simulated

The following may remain simulated:

- landlord approval
- contractor workflow
- quote collection
- repair scheduling integrations
- external property-management integrations
- emergency-service integration

---

# 53. Final Architecture Goal

The final exhibition system should allow this believable sequence:

```text
Renter:
“There is water coming through my bedroom window when it rains.”

        ↓

FixLens AI:
Water leak
Bedroom window
Structured summary

        ↓

Adaptive Capture:
“Move a little further back.”

        ↓

“Hold steady.”

        ↓

“Good frame.”

        ↓

Submit

        ↓

Supabase:
Case + evidence stored

        ↓

PM Portal:
New case received

        ↓

PM:
Request a closer photo of the lower-left frame

        ↓

Renter:
Action Required

        ↓

Adaptive guided recapture

        ↓

Additional evidence submitted

        ↓

PM:
New evidence received
```

If this complete loop works reliably, the technical implementation has successfully demonstrated the FixLens concept.

Everything beyond this should be considered secondary.

## Showcase Demo Sessions

The exhibition build should support multiple visitors using FixLens on their own devices without requiring production authentication.

Each browser/device should receive an anonymous demo session identifier.

Recommended behaviour:

1. On first visit, check localStorage for:

   fixlens_demo_session_id

2. If no ID exists, generate one using:

   crypto.randomUUID()

3. Store the ID in localStorage.

4. Reuse the same ID on later visits from the same browser/device.

5. Attach the ID to new renter-created maintenance cases.

Example:

```ts
const existingSessionId = localStorage.getItem("fixlens_demo_session_id")

const demoSessionId =
  existingSessionId ?? crypto.randomUUID()

if (!existingSessionId) {
  localStorage.setItem(
    "fixlens_demo_session_id",
    demoSessionId
  )
}

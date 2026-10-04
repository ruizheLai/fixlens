# Supabase backend setup

## Phase 3A — server-side issue understanding

`analyze-maintenance-issue` is deployed on the existing project, version 2. No
migration, schema/policy change, dependency or new renter Auth was introduced.
OpenAI uses the pinned `gpt-4.1-mini-2025-04-14` snapshot through the Responses API
with strict JSON schema, `store: false`, 1,100 output-token limit, no streaming,
tools, web search, images or model-selected actions. The provider adapter is
server-only; frontend types/results remain FixLens-specific.

`OPENAI_API_KEY` is configured only in Supabase → Edge Functions → Secrets. Never
put it in `.env.local`, a `VITE_*` variable, source, browser storage or a client
bundle. Successful live evaluations confirm the configured key/account works;
the key value was not read or copied. No service-role key was added.

The function has `verify_jwt = false` because exhibition renters have no Auth JWT.
Its handler explicitly matches `apikey` against the project's server-provided
publishable/legacy-anon keys and rejects unapproved browser origins. This is a
public exhibition endpoint, not renter authentication or access to private data.
`FIXLENS_APP_ORIGINS` optionally configures comma-separated exact origins; defaults
are `http://127.0.0.1:5173,http://localhost:5173`. A later hosted origin must be
explicitly configured before deployment testing. CORS is not an abuse-proof
authorization mechanism. The per-isolate limit (4 active calls, 30/minute) is a
small cost guard, not distributed production rate limiting. Keep provider-side
project spend limits appropriate for exhibition use.

Input is only `{ description, clarifications: [{ question, answer }] }`:
description ≤4,000 characters, answer ≤1,000, question ≤240, maximum two pairs,
HTTP body ≤32 KB. Unknown input properties are rejected. No renter/profile,
property address, email, phone, PM identity, demo-session ID, evidence or case
history is automatically attached. Text that a renter themselves includes in
their description still goes to the provider. Production code never logs this
text, provider errors or credentials.

Output requires exactly status/issue/location/observedCondition/summary/
followUpQuestions. Status is sufficient, needs_follow_up, multiple_issues or
not_maintenance. Nullable text, nonblank/bounded values, status consistency and
question counts are checked server-side and again in the frontend. Only one
question can be returned at a time; application logic suppresses further questions
after two answers. Invalid/refused/incomplete results, timeout or HTTP failure
produce a generic recoverable error. Server timeout is 20 seconds; client is 25.
There is no automatic retry that silently spends more provider requests.

The prompt treats renter text as untrusted data, permits factual language cleanup,
and excludes diagnosis, priority, repairs, cost/time, legal advice, workflow,
capture selection, evidence assessment and Other Questions. Human confirmation
precedes safety/capture. Edit description starts a fresh interpretation; the app
retains text during failure and offers Retry or Continue with my description.
Fallback shows a neutral Maintenance issue category, unknown location/condition
and raw wording, never a fake window-leak interpretation.

Persistence uses the unchanged case service: original description plus verbatim
clarification pairs in `description`, confirmed issue/location in their existing
columns, and confirmed summary/observed details in `condition`. The AI function
has no database reads/writes or arbitrary mutation path. PM/Submitted Report read
the saved snapshot and never reanalyze it. Safety remains explicit/deterministic.
Overview + Close-up are required; video is optional/skippable and never persisted.

Repeatable local tests (Node 24):

```sh
node --experimental-strip-types --test supabase/functions/tests/issueUnderstanding.test.ts
node --env-file=.env.local --experimental-strip-types supabase/functions/tests/issueUnderstanding.eval.ts
npx tsc --noEmit
npm run build
```

The live evaluation uses only the browser-safe Supabase configuration and synthetic
examples. It does not load an OpenAI key locally and does incur provider requests.
Eight server/validation tests cover bounds, types, unknown fields, max follow-ups,
refusal/malformed/failure handling, data minimization, origin/key checks and
concurrent-call limits. The Edge Function source/tests also passed a separate
strict TypeScript check against the Deno entrypoint API surface.

### Phase 3A verification — 5 October 2026

- Real provider: initial 19/20 exposed an unnecessary question for typo-heavy input.
  One narrow prompt correction plus everyday-terminology/missing-item cases yielded
  **22/22**. Clear/missing/vague inputs, multi-issue choice and its answer, off-topic,
  safety observations, rambling/poor wording, no-fabrication and prompt injection
  passed. The unchanged prompt was not rerun unnecessarily; browser sanity checks
  also passed. “Kitchen tap is leaking” goes straight to summary. “Something is
  leaking” → “Under the kitchen sink” needs one clarification and then summary.
- Browser: correction reruns understanding; multiple issues select only one;
  off-topic receives fixed redirection. Controlled failure retained wording,
  repeated Enter made one request, Retry recovered, and fallback reached safety,
  two-photo capture and Final Review. Danger/back and normal safety both passed.
- One disposable real submission used the requested bedroom/rain/wet-carpet text,
  two uploaded JPEG test fixtures and Skip video. SQL verified unchanged raw text,
  confirmed fields, two evidence rows, no video row and one review-start activity.
  The PM Dashboard received it without manual refresh; PM showed both private
  photos and the saved fields. Review moved it to Under review, visible to renter
  Case Detail/Cases/Inbox. Submitted Report retained its snapshot after refresh
  and PM review. No AI call exists in those read paths.
- 375×667 and 390×844 iframe viewports passed readable input/loading/summary,
  reachable edit/confirm/safety/capture/skip/review controls and zero horizontal
  body overflow. Keyboard Enter and file-picker uploads were exercised. These are
  desktop-browser viewport checks, not physical-phone/soft-keyboard certification.
  An automation inspection error occurred only in the temporary iframe harness;
  normal renter/PM app consoles were clean.
- Home/Cases/Inbox/Profile/Support (including reset-on-exit), Submitted Report,
  requested-evidence entry/back, PM Dashboard/Detail/private preview, request dialog
  and evidence-review confirmation/cancel passed. Existing data was not progressed
  by those latter checks. Four rollback SQL suites passed: PM workflow, renter
  requested evidence, PM evidence resolution and private Realtime authorization.
- Known prototype limitations retained: fixture renter/profile data, fixture Home
  recent case, inert legacy Final Review edit controls, scripted Other Questions,
  window-specific example capture overlays and simulated video. Renter Case Detail's
  fixture-based evidence count may say “No saved evidence” for a visitor report;
  real Submitted Report/PM photos are intact. This pre-existing issue was verified
  against HEAD and left outside Phase 3A.
- Existing security advisor findings are unchanged: `public.rls_auto_enable()`
  execution grants and disabled leaked-password protection. See prior phase notes.
- Final closeout: TypeScript, production build and all eight server/validation
  tests passed. All four rollback SQL suites passed again after cleanup. The single
  disposable case, its two evidence rows/Storage objects and activities were removed;
  counts returned to 8 cases, 13 evidence rows, 6 requests, 37 updates and 13 Storage
  objects, with zero orphans. Seeded data, PM linkage and deployed function remain.
  Temporary browser/CLI helpers were removed. `.env.local` remains ignored, nothing
  is staged, and no OpenAI credentials or provider call code enter the client bundle.

References: [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs),
[model snapshot](https://developers.openai.com/api/docs/models/gpt-4.1-mini), and
[Edge Function authorization headers](https://supabase.com/docs/guides/functions/auth-headers).

## Phase 2E — private PM Broadcast and renter polling

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

Local migration `20261003101822_pm_realtime_invalidation.sql` is already applied
live as `20261003101933_pm_realtime_invalidation`. These are the same migration;
do not reapply either. It adds one SELECT-only policy on realtime.messages,
a private trigger function with client EXECUTE revoked, and four table triggers.
It changes no domain/Storage policies, grants, PM linkage or business RPCs.
Notifications are best effort and cannot roll back business writes.

`supabase/tests/pm_realtime.sql` runs in a rollback transaction: linked PM can
read the intended private signal, anonymous/unlinked Auth cannot, topic mismatch
is denied, payload contains only the generated ID, and public domain publication
and client trigger-function execution remain absent. Case INSERT also creates
the existing initial activity, so the detail topic receives two signals.

Verification checkpoint (4 October 2026): new report appeared on the PM Dashboard
with one signal/one refetch; requested evidence produced four signals/one refetch.
Saved circle annotation appeared in PM without refresh. Resolution and approval
updated renter views automatically. Unchanged polling produced zero Storage reads
or blob churn; a delayed read remained serialized. Hidden renter and disconnected
PM recovered a missed disposable activity on visibility return/reconnect.
Final navigation checks covered renter Home/Cases/Inbox/Profile/Case Detail/
Submitted Report/Support/back and PM Dashboard/Detail/Completed presentation.
Both browser consoles were clean. A controlled failed poll retained the screen
and later polls recovered. PM navigation repeatedly left one current joined
channel; an aborted delayed Case A result never overwrote Case B. Reconnect left
one channel. Unmounting photo views revoked their blob URLs.

Tests used separate app clients in browser tabs, with temporary visibility controls
to model two visible devices and an SDK disconnect/reconnect for transport loss.
This is not physical cross-device/mobile-network certification. No test controls
are part of production source. PM channel authorization also passed rollback SQL
tests for linked PM, unlinked Auth and anonymous roles. A fresh unrelated anonymous
client could not read the visitor case/evidence, download a private photo, create a
signed URL or join the PM private channel.

Cleanup restored the intentional baseline: 7 cases, 10 evidence rows, 10 Storage
objects, 5 requests and 28 activities; zero orphan objects and no disposable case
remain. Sarah Chen's Auth link is unchanged. The Phase 2E, workflow, evidence
resolution and renter evidence SQL suites passed with fixtures rolled back.
Existing advisor findings remain: public.rls_auto_enable execution grants and
disabled leaked-password protection; neither was introduced or changed here.
Final `npx tsc --noEmit`, `npm run build`, and the post-cleanup Phase 2E SQL
authorization suite passed. Temporary pages/scripts and CLI cache were removed;
the diff contains no diagnostic logging or secret literals, and `.env.local`
remains ignored and unstaged. No commit, merge or deployment was performed.

References: [Realtime authorization](https://supabase.com/docs/guides/realtime/authorization)
and [Broadcast](https://supabase.com/docs/guides/realtime/broadcast).

## Phase 2D-C — PM evidence resolution

Local `20261002154900_pm_evidence_resolution.sql` is applied live as
`20261002155319_pm_evidence_resolution`. These identify the same migration; do not
reapply. No table/status, environment variable, dependency, RLS or Storage policy
was added. Existing PM Auth/profile linkage is retained.

`resolve_evidence_request(case_key, request_id)` uses an authenticated-only public
SECURITY INVOKER wrapper and a private SECURITY DEFINER function with empty
search_path and live PM-profile authorization. Anon/renter and unlinked Auth users
cannot resolve; generic request UPDATE remains denied. The case/request row locks
match existing write order. Only a submitted request with linked requested-photo
evidence on an Under review case can resolve. The transaction sets resolved_at,
records one `message` activity (`Requested evidence reviewed.`), and touches case
recency without changing case status. Resolved retries safely return already_applied
even after subsequent lifecycle progression.

`advance_case` now blocks approval for every requested or submitted request.
`request_case_evidence` likewise returns an existing unresolved request rather than
creating another. Multiple legacy unresolved requests cannot bypass the gate.
Once all resolve, normal workflow returns; approval requires its own explicit action.
Request history and all photos/annotations are retained. No AI or Realtime is used;
PM/renter refresh reads authoritative data.

Repeatable rollback suite: `supabase/tests/pm_evidence_resolution.sql` covers
authorization, invalid states, linked evidence, retry, unchanged case status,
exactly-one activity, multiple-request gating and workflow unlock.

### Phase 2D-C verification — 3 October 2026

- Browser acceptance passed on one disposable visitor case: original report/two
  photos → PM request → renter requested photo/circle annotation → PM review.
  Preview and confirmation Cancel did not resolve. Resolution kept Under review,
  retained all three photos and recorded exactly one review activity. Renter refresh
  showed Evidence reviewed without Action Required or Awaiting review.
- Controlled failure showed disabled Saving and recoverable Retry without false
  success. Four concurrent resolution calls returned one applied and three
  already_applied. Deliberately dropping their success response, then Retry, loaded
  authoritative resolved state. Double click and a stale second PM tab remained safe.
- Normal actions returned after resolution. A separate confirmed approval action
  produced Awaiting approval and exactly one approval activity. Request history,
  original description/evidence and requested-photo annotation remained unchanged.
- Lightweight Home/Cases/Inbox/Profile/Case Detail/Submitted Report/Support/back
  navigation passed, including Support reset. PM Dashboard/Detail and an existing
  Completed case passed. Normal renter/PM consoles had no warnings/errors. Existing
  fixture inconsistencies remain unchanged; cross-device refresh is manual.
- Final TypeScript, production build and resolution SQL suite passed. The sandbox
  blocked the first build's native dependency; the unrestricted build passed.
  SQL fixtures rolled back. Live grants deny anonymous PM RPC execution and generic
  request UPDATE; the SQL suite also rejects renter/unlinked Auth access. All six
  domain tables retain RLS and the four existing private Storage policies are unchanged.
- Removed only the disposable case, three evidence rows/Storage objects, one request
  and six activities. Retained baseline: six cases, seven evidence rows/objects,
  four requests and nineteen activities, with zero orphan Storage objects. Sarah's
  PM Auth/profile link and all intentional migrations remain. Temporary test pages,
  photo, cleanup script and CLI verification directory were removed. No new secrets,
  environment configuration, dependencies or debug logging are included.

## Phase 2C-C — Renter evidence response

Local `20261002050548_renter_evidence_response.sql` was applied once as live
`20261002051314_renter_evidence_response`. These are the same migration; do not
reapply. Existing Phase 2D-A/B migrations, PM Auth linkage, RLS and Storage policies
are retained. Existing `evidence_request_id`, `requested_photo` and
`evidence_submitted` schema values are reused.

`submit_requested_evidence(request_id, evidence_id, metadata)` is a public SECURITY
INVOKER wrapper around a private SECURITY DEFINER function with empty search_path.
Anon/authenticated may execute, but the function requires the same visitor session
header and case ownership as renter RLS. Seeded cases are not writable. Schema USAGE
for anon does not grant execution of PM functions; their existing authenticated-only
grants and PM-profile checks remain. Generic evidence-request UPDATE and direct
requested-photo INSERT remain denied.

The function locks case then request (matching PM write lock order), verifies the
uploaded object and annotation bounds, and atomically inserts one linked photo,
marks the request submitted with submitted_at, records one activity and touches
case recency. Case status and resolved_at are unchanged. A partial unique index
permits one evidence row per request. Exact ID/path/metadata retries return
already_submitted; a competing different photo is rejected.

The private path remains `<demo-session>/<case-id>/<evidence-id>.jpg`. Upload is
non-upserting. Retry checks the existing bytes by SHA-256 before finalizing; after
a committed response is lost it checks request state and recovers via the same RPC
without another upload. The UI freezes the photo/ID/annotations on first attempt.
Storage upload and database finalization are separate operations: leaving an
ambiguous failed attempt may leave an unlinked object for administrative cleanup.
Do not delete a possibly committed object merely because its response was lost.

Repeatable rollback suite: `supabase/tests/requested_evidence.sql`. It checks owner
validation, wrong-session/unauthorized denial, metadata/object validation, unchanged
case status, one row/event, exact retry and generic-update denial. No manual backend
step, new environment variable or dependency is required on this project.

### Phase 2C-C verification — closed 3 October 2026

- Real browser report → PM review/request → renter annotated photo → submission →
  PM read passed. One row/object/activity per request; canonical status remained
  Under review. Original Overview/Close-up remained separate and unchanged.
- Upload failure, post-upload finalization failure and committed/lost-response
  recovery passed. The same local identity/annotations survived Retry; four
  concurrent retries returned already_submitted without duplicates.
- A fresh unrelated anonymous session could not read case/request/evidence, download
  or sign private photos, upload into the case, or finalize/update the request.
  Owner fresh download and authenticated PM photo/annotation reads passed.
- Back/cancel, replacement, annotations and refresh passed. Exact 375×667 and
  390×844 iframe viewports had no horizontal overflow, reachable controls and correct
  portrait rendering. This is browser layout verification, not physical-device
  camera testing. Home/Cases/Inbox/Profile/Submitted Report/Support and case back
  navigation passed; Support reset on exit. PM Dashboard/Detail and Completed
  treatment passed. Normal renter/PM consoles were clean.
- Post-cleanup TypeScript, production build and requested-evidence SQL tests passed.
  SQL fixtures rolled back. Removed the single disposable case, four evidence rows
  and Storage objects, two requests and six activities, plus local diagnostic files.
  No disposable rows or orphan Storage objects remain. Retained data: four cases,
  two evidence rows/objects, one seeded requested item and eleven existing activities;
  PM Auth/profile linkage and intentional migrations/policies remain intact.

## Phase 2D-B — PM workflow writes

`20260929014629_pm_workflow_writes.sql` is applied live as
`20260929015506_pm_workflow_writes`. These are the same migration; do not reapply.
No Phase 2D-A migration, Auth link, RLS policy or Storage policy is replaced.

Canonical progression remains Submitted → Under review → Awaiting approval →
Arranging repair → Repair scheduled → Completed. Existing `review_case` handles
the first step. `advance_case(case_key, action)` accepts only `request_approval`,
`record_approval`, `schedule_repair`, `complete_repair`; callers cannot supply an
arbitrary target status. Each action verifies the live PM profile and source state,
locks the case and writes its status/activity in one transaction. Retry finds its
recorded event and returns `already_applied` without regressing later stages.
New allowed update types are `approval_requested` and `approval_recorded`; existing
`repair_scheduled` and `completed` types are reused. No external email is sent.

`request_case_evidence(case_key, request_id, instruction)` requires Under review
and trimmed instruction length 1–1000. It atomically inserts the request and an
`evidence_requested` activity, touches case recency but does not change its status.
The UI freezes a UUID/instruction per attempt for safe Retry. Reusing an ID with
different input is rejected. If a requested item already exists, it is returned
without another insert. A partial unique index on case_id WHERE status='requested'
prevents duplicates while retaining submitted/resolved history. Both RPCs take the
same case lock, so a competing request/approval action cannot bypass the pending
evidence gate. Historical exact-ID retries recover without creating a new request.

Public RPCs are SECURITY INVOKER wrappers around narrowly authorized private
functions with empty search_path. Only authenticated may execute, and the live
Sarah/property_manager association is checked inside. Browser table-write grants
remain unchanged: no direct case UPDATE/DELETE, request INSERT or activity INSERT.

Next Action is deterministic. Confirmation dialogs disable pending submissions,
retain ambiguous attempts for Retry and reload backend detail after confirmed writes.
Stale-state rejection refreshes the case. Existing renter reads derive Action Required
from requested evidence independently of canonical status. Request response/upload
and resolution were added in Phase 2C-C/2D-C. External email, AI, Realtime, PM Inbox
and PDF remain out of scope.

Repeatable rollback tests: `supabase/tests/pm_workflow.sql` plus the retained
`supabase/tests/pm_portal.sql`. These test role/claim authorization and database
invariants; browser/concurrent HTTP verification complements the SQL suite.

### Phase 2D-B verification — 1 October 2026

- Completed the disposable case through all six canonical statuses. The final
  completion response was deliberately hidden; Retry recovered the committed state.
  Exactly one activity existed per transition. PM showed Case complete with no CTA;
  renter refresh showed Completed. Description/photo/annotation hashes were unchanged.
- On the separate existing disposable case, review and evidence request left status
  Under review, with one requested row and one request activity. Double click and
  lost-response Retry retained the same request. PM showed Waiting for requested
  evidence; renter Detail/Cases/Inbox showed the actual instruction and Action required.
- Concurrent HTTP retries and duplicate active requests created no duplicates.
  Invalid jumps, anonymous writes and approval while evidence was pending were denied.
  A deliberately stale component view recovered by loading the authoritative waiting
  state. The rollback SQL suite passed, including unauthorized authenticated denial,
  wrong source states, exact-ID retries, history and direct-write privilege checks.
- TypeScript (`npx tsc --noEmit`) and production build passed. Fresh normal PM/renter
  browser tabs had no warnings/errors. Expected errors were confined to diagnostic
  rejection tests and older tabs opened while the local server was stopped.
- Renter Home/Cases/Inbox/Profile, Submitted Report/back navigation, Support reply
  and reset-on-exit, and reporting through confirmation/description/summary/safety
  to Overview capture passed. Existing renter fixture inconsistencies were preserved.
- Removed both disposable cases, four evidence rows, five Storage objects (including
  the unlinked upload), their nine activity rows and one request. Removed local test
  harnesses, test manifest and CLI cache. Preserved three seeded cases, the intentional
  visitor case, canonical request, two original stored photos and Sarah's Auth link.
- Migration was inspected, not reapplied. RPC grants and RLS remain restricted;
  no direct browser workflow table-write grants were added. No dependencies, secrets,
  staged environment files, production diagnostics, commit or deployment were added.

## Phase 2D-A — PM Portal

Migration `20260928070924_pm_portal_foundation.sql` is applied live as
`20260928071101_pm_portal_foundation`. The CLI and administrative tool assigned
different timestamps to the same migration; do not reapply it. Older migrations
and seeds were not changed. The existing confirmed Auth user is linked to the
canonical Sarah Chen/Apex Rentals profile through unique nullable `auth_user_id`.
Sarah's profile ID and all existing foreign keys are preserved. No password,
token, account email or generated Auth ID is stored in the migration/frontend.

For a **different** project only: apply migrations in order, create the intended
exhibition PM account administratively, then set Sarah's existing profile's
`auth_user_id` to that confirmed Auth user's UUID in SQL Editor. Do not replace
the profile or expose a browser profile-update permission. The current project
already has this association; no manual linking step is pending.

`pmSupabase` uses ordinary email/password Auth, local session persistence and
automatic token refresh. Its distinct storage key prevents it from changing the
anonymous renter client's requests. PM sends no demo-session header. The router
checks both session and the matching property_manager profile before mounting
case screens. RLS is the actual authorization boundary, independent of that UI.

Authorized PM can SELECT cases/profiles/properties. Existing child SELECT
policies follow visible cases, covering evidence, requests and updates. A new
Storage SELECT policy permits linked evidence objects in private `case-evidence`.
Downloads reuse the existing evidence service and revocable blob URLs; no public
URLs or bucket exposure. Existing anonymous seeded/session rules are unchanged.
No broad PM UPDATE, DELETE, upload or evidence-request write policy was added.
Unlinked authenticated accounts retain only the existing public/demo access.

`review_case(case_key)` is an authenticated-only SECURITY INVOKER RPC delegating
to a narrowly scoped private SECURITY DEFINER function with empty search_path.
It checks the live Auth/profile association, locks the case row, permits only
Submitted → Under review, and inserts `review_started` in the same transaction.
The existing timestamp trigger updates updated_at. Under review returns the
current row without another event; other states are rejected. Concurrent/retried
calls serialize on the row lock. Browser roles retain no direct case UPDATE or
activity INSERT privilege. The private helper cannot be reached through REST.

The single PM account is for the exhibition, not a multi-agency system. Renter
demo-session IDs remain caller-controlled and are not production authentication.
Evidence requests are read-only. No email is sent, no AI PM decision engine exists,
and landlord/contractor actions, PDF, PM Inbox and Realtime remain deferred.

Repeatable policy/RPC assertions are in `supabase/tests/pm_portal.sql`; run with
administrative SQL access. Test cases and transitions roll back. This validates
database roles/claims and complements browser Auth and private-download checks.
The Auth advisor also reports leaked-password protection disabled; configure it
in Auth settings if supported for this project. Existing `rls_auto_enable`
warnings remain documented below; this phase does not modify that function.

### Phase 2D-A verification — 29 September 2026

- PM sign-in, persisted session, direct dashboard/detail refresh, logout and
  signed-out route protection passed. Unlinked authenticated claims were denied
  by the SQL tests; a controlled missing-profile response verified the denied UI.
- Dashboard includes seeded and visitor cases without a fixed case count. Search,
  attention filtering, real relationships/timeline, safe empty evidence, preview
  and all four persisted annotation types passed. The 1280×800 and 1440×900 layouts
  had no horizontal overflow; Next action remained sticky.
- A disposable renter report with two photos was submitted, reviewed by PM and
  refreshed by its renter. Its report/photos/annotations remained intact. Repeated
  concurrent Review RPCs left exactly one `review_started` event and two photos.
- Fresh independent Node clients (no browser storage or PM Auth, HTTP cache
  bypassed) proved that another demo session cannot SELECT the case/evidence,
  download its private object or create a signed URL. Its owner could download it.
  A fresh uncached PM browser download also passed; the unrelated browser client
  had no Auth session and its uncached download/signing attempts were denied.
  The earlier same-browser photo result was cached/local access, not a fresh
  unauthorized Storage read. Private photo downloads now use `cache: "no-store"`
  to recheck authorization instead of reusing an HTTP cache entry. Previously
  downloaded bytes/blob URLs are local copies, not proof of current server access.
- Anonymous Review, unlinked-user Review and direct UPDATE/DELETE were denied.
  The rollback SQL suite, TypeScript and production build passed. Normal PM and
  renter browser consoles had no warnings/errors; negative-test HTTP errors were
  confined to the temporary verification page.
- Only the disposable report, its two evidence rows, two Storage objects and two
  activity events were removed. Three seeded cases, the earlier visitor case,
  its two photos, seven existing updates, the seeded request, Sarah's profile and
  Auth link were preserved. No migration was reapplied during closeout.

Phase 2A established the backend foundation without changing renter data sources.
The Phase 2A/2B sections below are historical verification records. Current write
capabilities and limitations are recorded in Phase 2C-B below. Earlier phase
sections are historical records, including statements about deferred evidence.

## Phase 2C-B — Real photo evidence

Migration `20260927060959_case_photo_evidence.sql` is applied to the current
project as `case_photo_evidence`, remote version `20260927062138`. Do not reapply
it there. For a fresh project, apply it after the schema, seed and Phase 2C-A
migration. No new environment variables or manual backend configuration remain.

The private `case-evidence` bucket accepts JPEGs up to 6 MB. Paths are
`<demo-session>/<case-id>/<evidence-id>.jpg`, with a UUID generated once per
selected photo. The existing evidence table stores `overview` / `close_up`,
`storage_path`, renter `created_by`, and `annotation_data`. No columns were added.
Unique indexes prevent repeated original capture roles per case and repeated
Storage paths. Requested evidence and video are outside this write path.

Files stay local until final submission. Native rear-camera selection is requested
with `accept="image/*" capture="environment"`; the gallery button has no capture
attribute for file/library selection. Browser image decoding handles orientation;
photos are conservatively resized to a maximum 2048px longest side, JPEG quality
0.9. Inputs over 20 MB or unsupported formats are rejected before case creation.
JPEG export drops EXIF/GPS and keeps annotation graphics out of the pixels.

Submission order is case confirmation, first photo upload/row confirmation,
second photo upload/row confirmation, then success. The Phase 2C-A case key and
report snapshot remain stable across Retry. Replacement is locked after the first
submission attempt; local files and annotations remain in memory. Retry skips
confirmed evidence IDs. Uploads never use upsert. If an upload reply is lost, the
service downloads the immutable object and compares size and SHA-256 bytes before
linking it. Lost row-insert replies are recovered by SELECT. Database uniqueness
also prevents duplicate original roles. No browser case UPDATE/DELETE or activity
INSERT permission was added; the existing submission trigger remains unchanged.

Evidence INSERT requires a case belonging to the current header session, the
correct ID-based path, an existing object, an original-photo role, the demo renter,
and bounded annotation JSON. Existing evidence SELECT follows the RLS-visible
parent case. Storage SELECT/INSERT require matching session and parent case;
there is no UPDATE/overwrite policy. DELETE permits only unlinked objects under
the same session's case. Linked photos and other sessions' objects cannot be
deleted. The bucket is not public. These policies reuse the existing
`x-fixlens-demo-session` pattern, which is caller-controlled exhibition isolation,
not production authentication or protection against a leaked session identifier.

Images are read through the shared client's private `download()` operation with
the session header and rendered using local blob URLs. No public or signed URLs
are stored. Reload performs new authorized reads; object URLs are revoked on
replacement/unmount, including download completion after cancellation. Failed
image reads expose Retry. SDK uploads lack a per-call abort signal; shared fetch
has a 90-second timeout, and the workflow stops subsequent work after unmount.

Annotation JSON is versioned: `{version:1,width,height,annotations:[...]}`. Circle,
Arrow and Draw use normalized 0–1 points; Text stores a position and up to 80
characters. SVG overlays use the photo's aspect ratio for consistent preview and
read-only report rendering. Undo/Redo is local pre-submission editing. Marks are
bounded to keep JSON small. The original unannotated, resized JPEG is separate.

Submitted Report reads only this case's saved evidence. Every seeded report with
no stored evidence shows the calm empty state; no bedroom fixture fallback remains.
The report fields and evidence blocks cannot flex-shrink when images expand.
Case Detail layouts, existing prototype counts, kitchen request simulation, Home,
Profile and scripted support remain unchanged. Video is explicitly labelled a
local demo, has no stored file/row and does not appear as persisted evidence.

Storage/DB writes are non-atomic. A failed/abandoned attempt can leave a case with
partial evidence or an unlinked file. Draft recovery after reload/exit remains
out of scope. Do not delete an object after an ambiguous row response. For an
administrative reset, record exact test IDs/paths, remove their evidence rows,
delete the objects through the Storage API, then remove their case/activity.
Never delete `storage.objects` metadata directly; never reset seeded cases.

Verification (27 September 2026): TypeScript and production build passed. Live
service tests covered a second-photo upload failure, repeated Retry, committed
upload/row replies deliberately hidden, and second-session isolation. Each test
case ended with two stored photo rows/files and one initial submitted event.
Negative tests rejected duplicate capture roles, seed-case uploads, other-session
mutations, overwrite/deletion of linked files, evidence UPDATE/DELETE and direct
activity INSERT. No additional test framework or dependency was installed.

Browser checks at 375×667, 390×844 and desktop 1280×900 covered native-picker
invocation, dismissal without a selected image, portrait preview, Retake, Final
Review and replacement cancellation, real submission, direct route/refresh,
both saved images and Circle/Arrow/Text/Draw overlays. Undo/Redo stays in preview;
Submitted Report has no editing controls. The mobile flex-shrink defect was fixed.
Normal console, seeded empty states and production-preview navigation passed.
Real iPhone/Android camera UI, HEIC decoding and software-keyboard behaviour need
physical-device checks after the owner deploys this branch; viewport testing does
not establish native Safari behaviour. No automatic deployment was performed.

Cleanup confirmed: all three disposable visitor cases, their six evidence rows,
three submitted events and six Storage objects were removed. The three seeded
cases, six seeded updates and one evidence request remain. The private bucket is
retained and empty. Temporary scripts/images and CLI cache were removed; diff and
secret checks passed, and `.env.local` is ignored and unstaged.

The security advisor still reports only the pre-existing `public.rls_auto_enable`
execution-grant warnings described below; this phase did not alter that function.

## Phase 2B-A — Cases list read integration

Cases now reads `cases` through `src/services/cases.ts`: a focused projection of
case_key, issue_type, location, status and updated_at, excluding null case keys,
ordered by updated_at descending then case_key ascending. No session filtering or
evidence-request query is added. Rows map to camelCase list items; lifecycle labels
and native date formatting are centralized in `src/data/casePresentation.ts`.
Completed cases appear in History; other lifecycle statuses appear in Active.

At the Phase 2B-A closeout, the kitchen Action Required badge/styling remained a
local visual fixture, independent of its backend under_review status. Case Detail, Home, Inbox, Profile,
Submitted Report, reporting and capture remain fixture-driven. Card URLs still use
case_key and open the existing demo detail routes. Only the three demo detail keys
are currently supported; future visitor routes remain out of scope. List timestamps
now reflect the backend and can differ from fixture dates on other screens.

Cases shows restrained loading text and a calm failure message with Retry. There
is no fixture fallback. Requests time out after 15 seconds and cancel on exit;
failed reads log a sanitized diagnostic. No writes, RLS/schema changes, new
dependencies, auth, uploads, or demo-session wiring were introduced.

Verification: TypeScript and production build passed. Browser checks covered live
Active/History records, stable-key routes, Back/Forward, direct entry and refresh,
plus unchanged fixture-screen/report/capture/support smoke checks. A controlled
503 read failure showed the calm error state and sanitized console diagnostic;
Retry performed a real read and restored the seeded cards. The temporary failure
page was removed. Normal success-path console and Git secret checks passed.

## Phase 2B-B — Case Detail read integration

Case Detail now uses `getCaseByKey(caseKey)` in the existing case service. It
reads the case with its handler and property/manager relationships, then its
updates ordered newest first with an ID tie-breaker. Focused camelCase types keep
database rows out of JSX. Current lifecycle comes from `cases.status`; explanatory
copy and activity labels are centralized. Completed layout selection uses status,
not the hot-water key. Unknown keys return to Cases after lookup; loading, timeout,
cancellation, sanitized errors and real Retry follow the list pattern.

The three layouts and activity expansion remain, showing only recorded history.
A small `shrink-0` sizing correction prevents the existing detail status cards
from collapsing and clipping their contents. Kitchen's banner, capture and local
acknowledgement remain a documented simulation, separate from live Under review.
No evidence-request reads/writes or session filtering were introduced.

Cases and Case Detail are live. Home, Submitted Report, Inbox, Profile and the
report workflow remain fixtures. Display references and evidence counts are still
prototype values; Submitted Report still shows the bedroom fixture even for other
case routes. These differences and fixture dates are intentional until later batches.

Final verification (16 September 2026): TypeScript and production build passed.
All three live details, recorded activity, unknown-key recovery, report links/back
destinations and top-level navigation passed browser checks. Report/capture through
simulated submission and Support Chat/reset also passed; normal-path console was
clean. The earlier controlled 503 test recovered via a real HTTP 200 Retry.
Temporary comparison/failure files were removed; diff and credential checks passed,
and `.env.local` remains ignored. Phase 2B-B is complete. The following section records the subsequent Phase 2B-C work.

## Phase 2B-C — Evidence requests and Inbox reads

Cases and Case Detail now read evidence_requests joined to cases to resolve case_key.
A batched request read serves the list; detail filters by its key. Centralized
requested/submitted/resolved rules mean only requested requires renter action.
Kitchen remains Under review with a separate Action Required badge and the live
instruction. Any active case with requests uses the same request presentation.
No case-key special case determines action, and historical updates cannot create it.

Inbox reads the six recorded case_updates with joined case context, ordered by
created_at descending then ID ascending. Titles are human-readable and messages
come from the backend; links use case_key. The latest item receives deterministic
visual emphasis, not a stored unread flag. Evidence-event action styling consults
current requests. Loading, cancellation, sanitized errors and Retry follow the
existing read pattern; failed request reads do not silently imply no action.

Capture/retake/preview remain simulated. Request-ID-scoped local acknowledgements
survive navigation and reset on refresh, explicitly say no submission occurred,
and leave live action/status unchanged. No writes, schema/RLS/seed changes, uploads,
session filtering, dependencies or authentication changes were introduced.
Home, Profile, Submitted Report and report creation remain fixture/local, including
the known non-bedroom Submitted Report content and conflicting property fixtures.

Verification (18 September 2026): TypeScript and production build passed. Browser
checks covered all three cases, six Inbox events and their case-key links, direct
Inbox/refresh and case URLs, Back/Forward, local requested-evidence capture,
Submitted Report return routes, Home/Profile/navigation, Support Chat/reset, and
report capture through simulated submission. Normal console had no warnings/errors.
Controlled Inbox and evidence-request failures in Cases/Case Detail showed calm
errors; Retry performed new HTTP 200 reads. Local response tests verified all three
request statuses and removal of historical Inbox action without any backend writes.
A stale local-acknowledgement edge case was guarded when request status changes.
Temporary failure pages were removed; Git diff, ignored environment and credential
checks passed. Phase 2B-C is complete; backend write integration has not started.

## Phase 2B-D — Submitted Report reads

Submitted Report reuses getCaseByKey and the mapped CaseDetail fields for its
case-key route: issue type, location, description, condition, safety response,
identity and created timestamp. Missing optional fields show Not provided. The
page remains read-only; loading, cancellation, sanitized error/Retry and unknown
case recovery follow the existing pattern. Kitchen Detail now has the same-style
report link; its container cannot shrink and clip the button.

Only Bedroom retains the existing prototype evidence imagery. Kitchen and Hot
Water show no evidence available; no evidence rows or uploads were fabricated.
Submitted Report currently reflects the stored case report fields; immutable
historical snapshot semantics are not yet separately modeled.

Cases, Case Detail, current evidence requests, Inbox and Submitted Report fields
are live. Home, Profile, report creation, Bedroom evidence imagery and requested
capture acknowledgements remain local/fixture. Existing detail evidence counts,
display references and conflicting property fixtures remain transitional.

Verification (18 September 2026): all three live reports, direct URLs/refresh,
correct detail return routes, browser Back/Forward and unknown-report recovery
passed. Controlled Kitchen report failure showed a calm error; Retry made a new
HTTP 200 request and restored Kitchen fields without Bedroom fallback. Report
creation through simulated submission, capture, Support Chat/reset and top-level
navigation passed regression checks. TypeScript and production build passed;
normal browser console was clean. Temporary failure injection was removed.
No backend writes, schema/RLS/seed changes, dependencies or credentials were added.
Phase 2B-D is complete; backend write integration has not started.

## Phase 2C-A — Real case creation and demo session

Visitor report submission now calls the typed createMaintenanceCase service.
The actual trimmed renter description is preserved through summary, Final Review
and INSERT. Issue type (Water leak), location (Bedroom window) and condition
(When it rains) remain deterministic prototype values; safety records the user's
safe-to-continue response. Canonical demo relationships live in demoBackend.ts.
No AI interpretation has been added.

The shared client sends x-fixlens-demo-session from the persisted
fixlens_demo_session_id localStorage value on every browser request. RLS permits
seeded cases plus the matching visitor session's cases and their child records.
This is exhibition-level isolation, NOT secure production authentication: the
header is caller-controlled. Review RLS and grants before public deployment.

Submit freezes the report, session and generated demo-<uuid> case key for that
workflow. Pending submission disables duplicate actions. Failure preserves the
review and shows a calm Retry. Retry queries the same key/session first, recovering
a committed INSERT with a lost response without another INSERT, UPDATE or upsert.
Only confirmed creation opens success; View case uses the returned case key.
A private database trigger creates one submitted activity in the same transaction.

Migration: supabase/migrations/20260925021524_demo_case_creation.sql, applied live
as demo_case_creation (remote migration version 20260925023411). The initial
migration and seed were not edited or reapplied. For a fresh project, apply this
migration after the initial schema and seed. Do not reapply it to the live project.
The CLI and administrative migration tool assigned different timestamps; this is
one migration, not two pending migrations.

Real: visitor cases, initial submitted activity, Cases/Detail/Inbox visibility,
Submitted Report fields and persistence after refresh. Evidence remains local:
no files uploaded, evidence rows created or storage bucket provisioned. New cases
show no saved evidence; the seeded Bedroom evidence fixture remains. Home/Profile,
scripted support, prototype capture/annotations and local requested-evidence
acknowledgements remain unchanged. PM writes, realtime, AI and production auth are
deferred. An unfinished report/Retry attempt is retained only while /report stays
mounted; draft recovery after leaving/reloading is not implemented.

Closeout verification (26 September 2026): TypeScript and production build passed.
Real browser submission, Cases/Detail refresh, visitor Submitted Report, Inbox
links, Back/Forward and separate-origin session isolation passed. A real rejected
INSERT left zero rows and retained Final Review/description/Retry. A subsequent
INSERT returned HTTP 201 before its response was deliberately hidden; Retry
recovered it through SELECT with no third POST. Instrumented comparisons confirmed
the same case key, session and payload throughout. Each test submission had exactly
one case and one submitted event, with zero evidence rows/requests. Pending Submit
was disabled. The ten negative INSERT-policy checks passed; catalog checks confirmed
no browser UPDATE/DELETE, activity INSERT or private-trigger EXECUTE privilege.

Seeded cases, Home/Profile, Support/reset, request Action Required/local capture,
report/capture and navigation regression checks passed. Normal-path consoles were
clean. The temporary harness and CLI cache were removed; the three exact test cases
and their cascading activity were cleaned administratively. Final counts returned
to 3 seeded cases, 6 updates, 1 evidence request and 0 evidence. Git/secret review
passed; .env.local remains ignored. Security advisor findings remain limited to the
pre-existing public.rls_auto_enable() warning described below. Phase 2C-A is complete;
Phase 2C-B and evidence upload have not started.

## Environment

Use a Supabase project with its Postgres database and Data API enabled. Install the
locked dependencies with `npm ci`. The existing `.env.local` needs these names:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

`.env.example` contains only these empty entries. For a new checkout, create a local
environment file using the project's URL and publishable key; do not overwrite an
already configured `.env.local`. Real environment files remain ignored by Git.
Never put secret/service-role keys or database passwords in frontend variables.
See Supabase's [API key guidance](https://supabase.com/docs/guides/api/api-keys).

`src/services/supabase.ts` exports separate renter and PM clients and fails clearly
if configuration is missing. Renter Auth persistence/refresh and URL session
detection stay disabled; its demo-session header controls visitor reads. The PM
client persists and refreshes its own Auth session without the renter header.

## Apply schema and seed

The live FixLens migration and seed have already been applied outside Codex and
were verified on 12 September 2026. Do not rerun the initial migration there.
For a new project only, use its SQL Editor administrative session:

1. Run the entire `supabase/migrations/20260911000000_initial_schema.sql` once.
2. Run the entire `supabase/seed.sql` after the migration succeeds.

Both files are transactional. The migration expects a fresh schema without these
six tables; do not drop existing tables to bypass a collision. Inspect the existing
schema first. Seed reruns insert missing fixed IDs only (`ON CONFLICT (id) DO
NOTHING`); they do not reset or overwrite edited records. No CLI is required.

The migration defines profiles, properties, cases, evidence_requests, evidence and
case_updates, foreign keys, domain checks, seven lookup indexes, and an automatic
cases.updated_at trigger. Case lifecycle has six statuses; evidence-request state
is independent. No production auth relationship is introduced.

## Canonical seed

Brad Lai is the renter; Sarah Chen of Apex Rentals is the property manager.
Their fixed UUIDs end in `0001` and `0002` respectively under prefix
`10000000-0000-4000-8000-`. Email and phone are intentionally null.

The canonical backend property is **12 Thornton St, Apt 4B, Melbourne VIC 3000**,
ID `20000000-0000-4000-8000-000000000001`. Conflicting frontend fixtures remain
unchanged until a later explicitly approved migration.

| case_key | UUID | Primary status |
| --- | --- | --- |
| bedroom-window-leak | 30000000-0000-4000-8000-000000000001 | awaiting_approval |
| hot-water | 30000000-0000-4000-8000-000000000002 | completed |
| kitchen-tap | 30000000-0000-4000-8000-000000000003 | under_review |

All three link to the canonical renter/property/manager and have null
demo_session_id. Kitchen has a separate requested evidence request. There are six
representative case updates, two per case. Evidence is intentionally empty.

## Temporary demo-development RLS

All six tables enable RLS. Existing policies preserve fixed seeded profile/property/case
reads. Visitor SELECT additionally requires demo_session_id to match the request
header. Child policies use the RLS-visible parent case, including submitted activity.
Seeded records remain public demo data; this is not user-level authentication.

Browser INSERT is granted only for required case columns. RLS requires a matching
session, valid demo case key, Submitted status, canonical renter/property/handler
and non-empty issue type/description. Browser roles cannot supply IDs/timestamps,
UPDATE/DELETE cases, or write case_updates/evidence/evidence_requests. The private
trigger has an empty search_path and no public/anon/authenticated EXECUTE grant.
**TODO: review grants and RLS before public showcase deployment.** See
[Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Verify

After applying both SQL files, verify counts in SQL Editor: profiles 2, properties
1, cases 3, evidence_requests 1, evidence 0, case_updates 6. Check relationships:

```sql
select c.case_key, c.status, c.demo_session_id, p.address,
       r.name as renter, m.name as handled_by
from public.cases c
join public.properties p on p.id = c.property_id
join public.profiles r on r.id = c.renter_id
join public.profiles m on m.id = c.handled_by
order by c.case_key;
```

Administrative SQL results alone do not verify browser-key RLS. From the repository
root, run this PowerShell diagnostic to load the shared frontend client through
Vite and test reads with the configured publishable key. It prints only counts and
error codes, never configuration values. It creates no source file or visible UI.

```powershell
@'
import { createServer } from "vite";
const server = await createServer({ configFile: false, server: { middlewareMode: true }, appType: "custom" });
try {
  const { supabase } = await server.ssrLoadModule("/src/services/supabase.ts");
  console.log("Shared client initialized");
  for (const [table, expected] of [["profiles", 2], ["properties", 1], ["cases", 3], ["evidence_requests", 1], ["evidence", 0], ["case_updates", 6]]) {
    const { count, error, status } = await supabase.from(table).select("id", { count: "exact", head: true }).abortSignal(AbortSignal.timeout(15000));
    const passed = !error && count === expected;
    console.log({ table, status, code: error?.code ?? null, count, expected, passed });
    if (!passed) process.exitCode = 1;
  }
} catch {
  console.log("Verification failed; configuration and error details suppressed.");
  process.exitCode = 1;
} finally {
  await server.close();
}
'@ | node --input-type=module
```

Live verification on 12 September 2026 initialized the existing shared client
using only VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY. All six reads
returned HTTP 200: profiles 2, properties 1, cases 3, evidence_requests 1,
evidence 0 and case_updates 6. Brad Lai, Sarah Chen/Apex Rentals, the canonical
property, three case keys/statuses, null seed session IDs and their relationships
matched the local SQL contract. The earlier PGRST205 result is resolved.

Read-only database catalog inspection confirmed the local domain constraints,
seven lookup indexes, cases.updated_at trigger, enabled RLS on all six tables,
and the six SELECT-only policies. Both anon and authenticated lack domain-table
INSERT/UPDATE/DELETE/TRUNCATE privileges. No write/delete test was performed and
no policy was weakened. No service-role credential was used by the frontend client.

The local .env.local remains ignored and untracked. The change-content scan found
no configured URL/key values or recognizable database-password/secret-key literals.
The demo session utility was tested in isolation; visible screens still do not
import it or the Supabase client.

Final closeout: `npx tsc --noEmit` and `npm run build` passed. Browser smoke
verification covered Home/Cases/Inbox/Profile, bedroom Case Detail and Submitted
Report with loaded image fixtures, scripted Support replies/reset-on-exit, and
report confirmation/description/summary/safety through simulated capture entry.
No console warnings/errors or regressions were observed. Application sources are
unchanged; production JS/CSS hashes match the preceding Phase 2A build. Temporary
checks ran inline and left no diagnostic source files. Phase 2A is complete;
Phase 2B has not started.

## Security review before public showcase

The security advisor reports that public.rls_auto_enable() is a SECURITY DEFINER
function executable by anon and authenticated. It is outside the local FixLens
domain migration and was not changed or invoked during closeout. Review its
purpose and execution grants before deployment, alongside the temporary demo RLS.
See the advisor guidance for [anonymous execution](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
and [authenticated execution](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
This scoped closeout is not a full security audit.

## Deferred infrastructure

The private `case-evidence` bucket and policies are now applied in Phase 2C-B.
No demo/Unsplash URLs were migrated. Requested-evidence writes now use the controlled
Phase 2C-C/2D-C RPCs. Video and real adaptive camera guidance remain deferred.

`getDemoSessionId()` in `src/utils/demoSession.ts` lazily creates and persists a UUID
under localStorage key `fixlens_demo_session_id`. The shared client sends it as the
request header and case creation stores it on the case. Clearing storage creates
a new identity, hiding previous visitor cases. Seeded cases retain a null session
ID. No session IDs are shown in the renter UI.

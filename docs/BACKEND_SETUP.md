# Supabase backend setup

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

`src/services/supabase.ts` exports one client and fails clearly if configuration is
missing. Auth persistence/refresh and URL session detection are disabled for this
phase. Current screens do not import the client.

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
No demo/Unsplash URLs were migrated. Video, requested-evidence writes and real
adaptive camera guidance remain deferred.

`getDemoSessionId()` in `src/utils/demoSession.ts` lazily creates and persists a UUID
under localStorage key `fixlens_demo_session_id`. The shared client sends it as the
request header and case creation stores it on the case. Clearing storage creates
a new identity, hiding previous visitor cases. Seeded cases retain a null session
ID. No session IDs are shown in the renter UI.

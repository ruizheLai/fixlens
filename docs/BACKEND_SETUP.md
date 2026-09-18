# Supabase backend foundation (Phase 2A)

Phase 2A established the backend foundation without changing renter data sources.

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

All six tables enable RLS. Six SELECT policies and explicit SELECT grants allow
anon/authenticated roles to read only the fixed seeded profiles/property/cases and
child records of those cases. Cases must also have null demo_session_id. These
records are publicly readable demo data; do not insert real personal information
into them. This is not user-level authorization.

Browser INSERT/UPDATE/DELETE privileges are revoked and no write policies exist.
Write/delete connectivity tests are intentionally deferred; do not widen domain
permissions to make a smoke test pass. The visitor creation path belongs to Phase
2C. **TODO: review grants and RLS before public showcase deployment.** See
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

The intended future bucket is `case-evidence`; creation and access policies are
deferred to Phase 2C alongside uploads. No demo/Unsplash URLs are migrated.

`getDemoSessionId()` in `src/utils/demoSession.ts` lazily creates and persists a UUID
under localStorage key `fixlens_demo_session_id`. It is unused by current screens,
does not filter or label existing cases, and is not authentication or authorization.
Later visitor-created cases may use it; seeded cases retain a null session ID.

# Batch 6A — Exhibition deployment approval packet

19 October 2026, Australia/Sydney. Target **FixLens**, `ycnilqoqtgjmptxzuhty`, Sydney (`ap-southeast-2`). **Preparation only: no live SQL, function deployment, frontend deployment, commit, push or merge performed.** User accepts current answer quality for exhibition; further prompt optimization/full paid evaluation cycles stop.

Subsequent approved execution is complete: migration `20261018135231`, support function v1, bounded hosted smoke passed. See [BATCH_6A_BACKEND_DEPLOYMENT_RESULT.md](./BATCH_6A_BACKEND_DEPLOYMENT_RESULT.md). The approval/preparation details below are historical; do not reapply or redeploy automatically. Frontend Preview/iPhone acceptance remains pending.

## Frozen scope and accepted limitations

The evaluated classifier, generator, structured schemas, authoritative answers and UI behavior are frozen. [BATCH_6A_EXHIBITION_FREEZE.json](./BATCH_6A_EXHIBITION_FREEZE.json) records SHA-256 fingerprints and the fixed defaults. Prior corpora and genuine provider results remain historical evidence; their quality HOLD recommendations are superseded by the user's exhibition acceptance, not by an improved score.

Known limitations remain: ordinary sink leak may over-trigger safety guidance (14); a manager-request answer may be vague/include ungrounded workflow wording (H04); combined photography/annotation may omit photography guidance (F08). Last genuine result: 43/44 predefined checks, 41/44 manual answer quality. No new model calls or answer tuning in release preparation.

One support-only operational change: expose `Retry-After` to browser JavaScript so a daily cooldown is not incorrectly reduced to the client's 60-second fallback. Shared Phase 3A/Vision CORS, prompts, deployment and configuration were not changed.

## Verified live state (read-only)

- Connected Supabase inventory confirms the existing healthy FixLens project and PostgreSQL 17.6.
- Nine migrations recorded, through `20261014093153_information_request_types`; support migration not recorded.
- `fixlens_support_private`, public budget wrapper and private budget operation are absent. No naming collision found; service_role has public schema USAGE.
- `answer-maintenance-question` is absent. Existing `analyze-maintenance-issue` remains ACTIVE version **3**; `analyze-capture-frame` ACTIVE version **4**. Both have JWT verification disabled with handler checks. No function was redeployed.
- The pinned `gpt-4.1-mini-2025-04-14` was available to the supplied same-project test credential in all three approved evaluations. Last pass: 47 successful provider calls. Metadata says retirement 14 January 2027. No model substitution or paid availability check today.

## Hosted configuration preflight

The initial preparation could not inspect secrets because CLI authentication was missing. **Subsequent hosted preflight passed on 19 October 2026:** CLI 2.121.0 authenticated through the normal secure browser flow; required secret names are present and both budget overrides absent. No values were displayed or changed. See [BATCH_6A_HOSTED_PREFLIGHT.md](./BATCH_6A_HOSTED_PREFLIGHT.md). Actual deployed RPC/transport and hosted/iPhone smoke remain post-deployment gates.

Before any deployment, an authorized operator must confirm in the existing project's Edge Function Secrets UI (names/config only; do not reveal secret values):

| Requirement | Expected state | Current assurance |
| --- | --- | --- |
| OPENAI_API_KEY | Existing server-only key; do not rotate or replace it | Hosted name present; recent model evaluation passed; no additional provider/quota probe |
| SUPABASE_URL | Existing project runtime URL | Hosted name present; new function runtime not yet exercised |
| SUPABASE_SERVICE_ROLE_KEY | Existing server-only legacy service-role key | Hosted name present; never put in frontend or replace with publishable key |
| SUPABASE_PUBLISHABLE_KEYS / SUPABASE_ANON_KEY | Runtime client keys | Both hosted names present; verify actual new function path in bounded smoke |
| SUPPORT_REQUESTS_PER_MINUTE | Absent (default 30) | Confirmed absent; effective 30 |
| SUPPORT_REQUESTS_PER_DAY | Absent (default 300) | Confirmed absent; effective 300 |
| Frontend configuration | VITE_SUPABASE_URL points to this project; VITE_SUPABASE_PUBLISHABLE_KEY matches runtime accepted key | Existing app uses these; no frontend secrets/config changed |

Supabase documents default/legacy runtime keys and server-only handling in [Environment variables](https://supabase.com/docs/guides/functions/secrets). Custom secrets are project-wide and affect existing functions immediately: **do not modify OPENAI_API_KEY, Phase 3A settings or CAPTURE_VISION_ENABLED**. Vision stays disabled. If a needed key/config is missing or incompatible, stop and request a separate narrowly scoped configuration approval. Do not enable Vision, loosen auth, or bypass budget checking.

The new RPC's hosted service-role mapping/ACLs cannot be functionally verified before it exists. Gate deployment completion on the catalog/denial checks and first successful support request below. No unresolved defect was found in local SQL/adapter review; secret/runtime confirmation remains an actual preflight dependency.

## SQL and permission review

Approved candidate: `supabase/migrations/20261018112420_support_request_budget.sql`.
SHA-256: `fd1be557188d758996f1bc980e7cd56dfd78c60060841db3c956a65fbbb1143e`.

- Additive transaction creates one private schema/singleton counter table, one private operation and one public wrapper; no case, evidence, Storage, Auth, PM or existing RLS changes.
- Private operation: SECURITY DEFINER owned by postgres, pinned `pg_catalog` search path, qualified object references, explicit `role=service_role` guard. Public wrapper: SECURITY INVOKER, same integer defaults/signature and JSON adapter contract.
- Explicit revoke from PUBLIC/anon/authenticated; service_role only gets private schema USAGE and both function EXECUTEs, no schema CREATE/counter-table reads or writes. Counter table RLS is enabled; counters contain no chat, case or persona identifiers.
- One row lock gives atomic reservations across independent instances. Clock computed after locking; fixed UTC minute/day windows, daily reset at 00:00 UTC. Denials do not increment. No administrative reset API.
- Config stays **30 requests/minute, 300/day globally**. One support request costs one reservation and at most two model calls (400 classifier + 450 answer output tokens). Failures and manual Retry consume a new admission. No automatic provider retries. This protects support cost, not per-visitor fairness or shared-account Phase 3A spend.
- Migration fails on pre-existing objects; never blindly rerun. Exact rollback removes public wrapper first, private function, table and schema without CASCADE. Prior native PostgreSQL 18.4 tests passed role/permission, 40-connection concurrency, UTC/reset/boundaries, failure/timeout and rollback tests. Migration/rollback hashes remain unchanged; those native tests were not rerun for the header-only release fix. Live target is PostgreSQL 17.6; confirm catalog and admission after apply.

## Graceful failure behavior

| Failure | Server result | User experience / provider safety |
| --- | --- | --- |
| Missing OpenAI key | 503 | Retain failed question and allow explicit Retry; no budget/provider call |
| Budget RPC unavailable, permission/config/timeout failure | 503 | Recoverable generic message; no OpenAI call |
| Global budget exhausted | 429 + Retry-After + JSON retryAfter | Browser can read actual cooldown; Retry disabled until window; no OpenAI call |
| OpenAI 429/5xx, refusal, invalid/incomplete output | Controlled 502, no raw provider details | Question retained, explicit Retry; no automatic retry or invented answer |
| Network/deadline error | Client-safe generic failure | 25-second server / 30-second client deadline; pending releases, retained Retry; exit aborts request |

Provider 429 is intentionally normalized as support 502; budget 429 has the explicit shared-budget cooldown. No real backend status/message or key is leaked. OpenAI outage cannot silently fall back to invented PM/case behavior.

## Exact deployment sequence — execute only after approval

1. Verify freeze hashes, target, current migration history/object absence and existing function versions again. Stop on drift/collision; do not repair/replay earlier migrations. Confirm the secret/config gates above. Record the before inventory.
2. Apply **only** the reviewed SQL using the connected Supabase migration tool:

```text
supabase.apply_migration
  project_id: ycnilqoqtgjmptxzuhty
  name: support_request_budget
  query: exact complete contents of
         E:\fixlens\supabase\migrations\20261018112420_support_request_budget.sql
```

This is one tool/API migration operation, not a shell command and not `db push`. It records the migration in live history. The tool may allocate a different timestamp from the local filename, as earlier project migrations already show; record the returned version/name and source hash. Do not rewrite unrelated history or later run broad `db push` to reconcile it. If response is lost, inspect objects/history before any retry.

3. Verify wrapper/operation owners, paths, definer flags, grants and no client counter access. Read-only catalog queries:

```sql
select n.nspname, p.proname, p.prosecdef, p.proconfig,
       pg_get_userbyid(p.proowner) as owner, p.proacl
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where p.proname='consume_support_budget';

select r.role_name,
  has_function_privilege(r.role_name,'public.consume_support_budget(integer,integer)','EXECUTE') as wrapper_execute,
  has_function_privilege(r.role_name,'fixlens_support_private.consume_support_budget(integer,integer)','EXECUTE') as private_execute,
  has_schema_privilege(r.role_name,'fixlens_support_private','USAGE') as private_usage,
  has_schema_privilege(r.role_name,'fixlens_support_private','CREATE') as private_create,
  has_table_privilege(r.role_name,'fixlens_support_private.request_budget','SELECT') as counter_select,
  has_table_privilege(r.role_name,'fixlens_support_private.request_budget','INSERT') as counter_insert,
  has_table_privilege(r.role_name,'fixlens_support_private.request_budget','UPDATE') as counter_update,
  has_table_privilege(r.role_name,'fixlens_support_private.request_budget','DELETE') as counter_delete
from (values ('anon'),('authenticated'),('service_role')) as r(role_name);
```

Expected service_role: wrapper/private EXECUTE and private USAGE true, all other listed privileges false. anon/authenticated all false. Check RLS enabled, public wrapper invoker and private operation definer with postgres owner, paths pinned. Verify direct anonymous/authenticated RPC invocation is denied (not merely an empty result). Use rollback-only, locally simulated role checks when an authenticated test token is unavailable; distinguish them from a real HTTP denial. A successful hosted support request verifies the actual server-key/PostgREST RPC path without revealing the key.

4. Deploy **only** `answer-maintenance-question`, after catalog gates pass. CLI alternative (requires operator login, never paste a PAT into chat):

```powershell
Set-Location E:\fixlens
npx --no-install supabase login
npx --no-install supabase secrets list --project-ref ycnilqoqtgjmptxzuhty
npx --no-install supabase functions deploy answer-maintenance-question --project-ref ycnilqoqtgjmptxzuhty --no-verify-jwt --use-api
```

Do not omit the function name or use `--prune`; doing so could touch existing functions. `--no-verify-jwt` is required for this exhibition's publishable-key renter requests; handler key/origin/budget checks stay enabled.

The connected MCP deployment tool is an alternative to CLI login:

```text
supabase.deploy_edge_function
  project_id: ycnilqoqtgjmptxzuhty
  name: answer-maintenance-question
  entrypoint_path: answer-maintenance-question/index.ts
  verify_jwt: false
  files: exact contents, with these relative names:
    answer-maintenance-question/index.ts
    answer-maintenance-question/handler.ts
    answer-maintenance-question/budget.ts
    answer-maintenance-question/provider.ts
    answer-maintenance-question/knowledge.ts
    _shared/support.ts
    analyze-maintenance-issue/cors.ts
```

The unchanged shared CORS file is a bundled dependency, **not a deployment of analyze-maintenance-issue**. There is no deno.json/import map for this function. Upload no .env/key files or evaluation scripts. No secret or rate-limit changes are planned.

5. Re-list migrations and functions; record the actual support version/hash/status. Confirm Report AI v3 and Vision v4/hash/config unchanged. Verify new function preflights and anonymous RPC denial; then run only the bounded smoke below after approval. Stop on a failed gate; no full evaluation cycle or automatic retries.
6. Frontend remains undeployed. Backend deployment does not publish this uncommitted frontend. Entry-point/iPhone acceptance needs the prepared frontend running locally or a separately authorized HTTPS Preview build. Do not deploy Production, commit, push or merge to obtain that Preview automatically. Local browser origin must be localhost/127.0.0.1 **5173**, not 5177 or a phone's LAN HTTP origin.

## Minimal hosted smoke checklist (not run)

Reuse entry-point checks as the three support requests; do not multiply paid calls unnecessarily:

- [ ] **Home → Other Questions → support:** ask “How do I report a leaking tap?”; HTTP 200, useful bounded maintenance answer, proper pending/scroll state. Shows server budget RPC/provider path works. No report submitted.
- [ ] **Floating Chat → support:** ask “Write me a poem.”; short maintenance redirect, no poem. Exit/reopen resets session; no duplicate sends or late responses after exit.
- [ ] **iPhone Safari on approved HTTPS Preview:** ask “Can I submit without photos if it is dangerous?”; no-approach advice, Continue without photos route, service limitation and appropriate escalation. Check touch targets, multi-line input, keyboard, scrolling, safe area and no horizontal overflow. This is the third support request.
- [ ] **Existing Report AI regression:** start normal report, confirm details, describe “The kitchen tap is leaking.”; existing real structured summary, no support-route interception/fallback. Stop before submitting/creating a case. Never redeploy/change Phase 3A for the check.
- [ ] **CORS/security, no provider use:** approved local, current trusted Preview and `https://fix-lens.app` OPTIONS give 204 and echo origin; required request headers allowed; unrelated origin/key rejected. Support exposes Retry-After; no wildcard origin. Check actual current Preview matches the frozen narrow FixLens/team pattern; do not broaden it for an unrelated domain.
- [ ] **Console/logs:** no new normal-path errors/warnings, secrets, raw questions or provider errors in application logs. Confirm no unexpected provider retry. Do not print keys/tokens in test evidence.

Approval requested for this bounded paid smoke separately from deployment: **at most three support POSTs (six provider calls maximum), plus one clear Report AI prompt (one expected provider call)**, no retries. Stop if any result fails. Request a small **US$0.10 estimated-usage allowance**; actual short-question usage should be lower, but this is not an invoice cap. No full corpus rerun. If Preview/iPhone access is unavailable, report it as pending rather than claiming verification.

Budget exhaustion/provider outage/DB failure were verified with local controlled transports; do not consume all 300 hosted reservations or change shared secrets to force these failures. Post-deployment catalog/HTTP checks must prove role isolation. Physical iPhone acceptance remains required before exhibition use.

## Expected impact

Adds only isolated counters/RPCs and one new endpoint. Support consumes its own global admission budget; chat/Case/Persona content is not stored in that table. Existing Report AI remains independently functional and does not consume this budget. PM/renter data, Auth, Storage, workflow and Vision configuration remain untouched. Quality limitations remain accepted; public publishable keys/CORS do not establish per-visitor fairness or prevent an attacker spoofing an Origin and exhausting the shared budget.

## Rollback — approval required, support only

If the migration transaction fails, it rolls back; inspect history/catalog before retrying. If function deployment/smoke fails, leave the additive budget schema in place while investigating, or execute the scoped rollback after approval. Never remove the shared OPENAI_API_KEY, change Phase 3A, enable Vision, or loosen grants as a workaround.

1. Stop the new endpoint only (CLI command below, or delete only this function through Dashboard). Confirm no support requests remain in flight before dropping dependencies.

```powershell
npx --no-install supabase functions delete answer-maintenance-question --project-ref ycnilqoqtgjmptxzuhty
```

2. Execute exact `supabase/maintenance/rollback_support_request_budget.sql` via an approved migration operation named `rollback_support_request_budget` in the same project, using its full contents. SHA-256: `1a8124d59b20f111f3a088d28156187133e333d47aea33e5b407dbdb45713dd9`. This records rollback as a new migration; do not falsify/delete older history. No CASCADE. If unexpected dependencies exist, rollback stops for review.
3. Confirm new schema/wrapper/private operation absent, Report AI v3/Vision v4 unchanged, no unrelated records/policies changed. Frontend support then shows a controlled unavailable/Retry state; no fictitious assistant response. Shared secrets and legitimate data stay intact.

## Current verification and approvals

**39 local tests passed**, including actual provider-HTTP 429/500/503 normalization with fake transport, no automatic retry/key leakage, missing-key 503, daily budget cooldown/header exposure, budget-before-provider checks and existing Phase 3A/disabled-Vision regressions. Frontend/server TypeScript and production build passed. No paid/provider requests made today for preparation. Behavior hashes match the evaluated frozen sources.

Approval required: (1) apply only the reviewed support budget migration, (2) deploy only the frozen support endpoint after ACL gates, (3) the bounded hosted smoke and US$0.10 allowance. Hosted secret/configuration preflight has passed; this is **not** a claim that the undeployed RPC transport or physical iPhone acceptance has passed. Frontend Preview/Production release, commit/push/merge and rollback execution are separate actions.

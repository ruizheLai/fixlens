# Batch 6A — Maintenance support assistant: local review packet

18 October 2026. Branch batch-6a, clean baseline 3aa83a2 including merged Batch 5B.
Current status: approved support migration deployed as 20261018135231 and support Edge Function v1
ACTIVE; bounded hosted verification passed. Frontend Preview/iPhone acceptance pending. See
BATCH_6A_BACKEND_DEPLOYMENT_RESULT.md. Earlier review/preflight sections below are historical.
No live configuration, case data, Auth/RLS, Phase 3A or Vision changes.

## Exhibition release decision — 19 October 2026

The user accepted the current documented answer-quality limitations for exhibition and stopped
further prompt optimization/full paid evaluation cycles. Frozen behavior and current operational
approval gates are in BATCH_6A_EXHIBITION_DEPLOYMENT.md and BATCH_6A_EXHIBITION_FREEZE.json.
Earlier quality HOLD recommendations below are historical. The sole subsequent runtime change is
support-only exposure of Retry-After for correct browser cooldown; 39 local tests, TypeScript/build
pass. Hosted secret/configuration preflight passed and is recorded in BATCH_6A_HOSTED_PREFLIGHT.md:
secure CLI login succeeded, required hosted
secret names are present, both limit overrides absent, effective defaults 30/minute and 300/day.
No secret value was printed or changed. Subsequent approved backend deployment is now complete;
see BATCH_6A_BACKEND_DEPLOYMENT_RESULT.md before taking any further live action.

## Final SQL security refinement — 18 October 2026

The SECURITY DEFINER operation is now private. The exposed RPC is a minimal SECURITY INVOKER
wrapper with the same integer parameters/defaults and JSON result, so the Edge budget adapter
requires no change. Limits, atomic counter body, UTC windows and fail-closed behavior are unchanged.

Exact diff from the previously reviewed SQL: [BATCH_6A_SQL_SECURITY_REFINEMENT.diff](BATCH_6A_SQL_SECURITY_REFINEMENT.diff).
The migration, exact rollback, native PostgreSQL test and this report were updated; no application
or Edge implementation changes were made in this refinement.

Reverification PASS on native PostgreSQL 18.4:
- Public wrapper is invoker, private operation is definer; both owned by postgres with pinned paths.
- anon, authenticated and an unrelated role lack EXECUTE on both functions and private schema USAGE.
  Actual calls to either function and counter reads/writes are rejected.
- service_role has private schema USAGE and both function EXECUTEs, but no schema CREATE,
  counter SELECT/UPDATE/DELETE or administrative counter access, even with BYPASSRLS.
- Accidentally granting only the wrapper still cannot cross the private boundary. Accidentally
  broadening both function grants and schema USAGE still fails the private service-role guard.
- 40 independent connections still admit exactly 30 reservations; denied calls do not increment.
- Default 300/day boundary, configured boundaries, UTC/Sydney-timezone reset, minute rollover,
  lock timeout, missing-counter failure and exact revised rollback all pass.
- Existing sentinel data remains intact after rollback, which uses no CASCADE.

The 6 handler/budget/provider tests also pass, including adapter payload compatibility and zero
provider calls when budget checking fails or is exhausted. git diff --check passes.
Frontend/model behavior was not changed or re-evaluated by this SQL-only refinement.
No live migration, function deployment, configuration change, commit, push or merge performed.

## Review artifacts

- Complete additive migration: ../supabase/migrations/20261018112420_support_request_budget.sql
- Complete rollback: ../supabase/maintenance/rollback_support_request_budget.sql
- New function: ../supabase/functions/answer-maintenance-question/
- Authoritative product knowledge: ../supabase/functions/answer-maintenance-question/knowledge.ts
- Shared contracts: ../supabase/functions/_shared/support.ts
- HTTP frontend client: ../src/services/support.ts
- Updated screen: ../src/screens/renter/SupportChatScreen.tsx
- Scoped support CSS: ../src/styles/reportVisual.css
- Local function configuration: ../supabase/config.toml
- Handler/provider/budget unit tests: ../supabase/functions/tests/support.test.ts
- Real native PostgreSQL tests: ../tests/supportBudget.test.mjs
- 22 semantic evaluation cases: ../tests/supportEvaluations.json
- Explicit evaluation runner: ../tests/runSupportEvaluations.mjs

## Existing flow and UI

Home Other questions and floating Chat already navigate to /support; routing unchanged.
Replaced fabricated notification and repair-time promises with domain-constrained support.
Identity: FixLens Assistant / Maintenance support. Requested opening and three shortcuts.
Shared Batch 5B bubbles, avatar, palette, multiline 16px composer, scoped visual-viewport hook.
Pending locks input/buttons and a controller ref prevents rapid repeated sends.
Error preserves the question in the conversation; Retry reuses the same question/history without
adding a duplicate user bubble. No automatic retries. 429 cooldown disables further requests.
Leaving unmounts/aborts; conversation resets on exit. No permanent chat storage.
Suggested questions remain available after ordinary boundary replies.

## Server architecture

Browser -> dedicated answer-maintenance-question -> durable budget RPC -> structured classifier.
Only valid in_scope maintenance questions proceed to separately instructed answer generation.
Question and bounded history are untrusted JSON in a user message, not privileged history roles.
Generation receives only the extracted maintenance question, not raw conversation history.
No tool calls, browsing, case retrieval, PM messaging or case/property database access.
Strict structured output + runtime validation on both model stages and frontend response.
Responses are plain text, rendered as React text; no raw HTML/Markdown execution.

Semantic classes: in_scope, out_of_scope, needs_clarification, safety_sensitive.
Mixed questions: generate only for the extracted maintenance portion, append a brief boundary.
Out-of-scope: fixed friendly boundary; no general generation.
Ambiguous: fixed clarification. Safety: fixed conservative escalation, no repairs/approach-for-photos,
000 only for immediate life-threatening emergencies in Australia; FixLens is not emergency dispatch.
Legal and actual case-specific facts use fixed limitation responses and tenancy/Cases directions.
No current case status, appointment, identity, contact or approval is invented.

Grounding covers actual report order, normal two-photo/safety no-photo flow, capture/annotation,
Final Review editing, canonical statuses, information requests, PM responsibilities and limitations.
No Vision-enabled claim, free editing submitted reports, repair times, PM email or fake notifications.

CORS imports existing reviewed Phase 3A origin helper WITHOUT modifying that function:
localhost/127.0.0.1:5173, https://fix-lens.app, narrow FixLens/team Preview pattern.
OPTIONS 204 before validation/provider. Reject untrusted/missing origins, wrong keys/methods/body.
Project publishable key is not renter authorization or abuse identity; public endpoints remain public.

## Durable budget and permission/security review

New schema fixlens_support_private fails on unexpected preexistence.
One fixed singleton counter row: minute/day start timestamps and minute/day counters only.
No messages, IP addresses, persona IDs, case IDs or personal details stored.
UTC minute/day boundaries computed from clock_timestamp AFTER obtaining FOR UPDATE lock.
One short atomic operation checks both limits and increments both only when admitted.
Denied calls do not increment; expired windows reset lazily on the next request.
Day reset is 00:00 UTC, independent of session timezone/DST. This is fixed-window, not rolling-window;
two adjacent minute windows can admit a boundary burst. Counter reservation is not held during AI work.

Server env defaults:
- SUPPORT_REQUESTS_PER_MINUTE = 30 (accepted configuration range 1..120)
- SUPPORT_REQUESTS_PER_DAY = 300 (accepted range 1..3000)
Invalid configuration fails closed. Values are sent only by the server's budget adapter, not clients.
No configuration has been changed live. Quiesce support traffic during future limit/version changes
to avoid old/new isolates enforcing different limits; counters are retained, not reset on deployment.

Private schema initially revokes all client/server grants; only USAGE is then granted to service_role,
not CREATE. Counter table revokes PUBLIC, anon, authenticated and service_role access, has RLS enabled
without client policies. No existing schema/table permissions are touched.
public.consume_support_budget(integer,integer) is a minimal SECURITY INVOKER SQL wrapper with
the unchanged defaults/signature/result. EXECUTE is granted only to service_role.
The atomic SECURITY DEFINER operation lives in fixlens_support_private.consume_support_budget,
owned by postgres and executable only by service_role. Both search paths are pinned to pg_catalog,
references are schema-qualified, and neither function uses dynamic SQL.
The private function retains its explicit current_setting('role') service_role guard, rejecting
unauthorized callers even if future grants on both functions/schema are accidentally broadened.
Service role cannot directly read/write/administer the counter table; only the fixed budget operation.
Only postgres/admin can inspect/repair counters. Client-provided session IDs have no special role.
Function lock timeout 2s; budget fetch timeout 4s; handler deadline 25s; client timeout 30s.
Budget failure (including missing row, lock/database failure or malformed response) -> 503,
with ZERO provider calls. Exhaustion -> recoverable 429 + Retry-After, no provider call.
A committed reservation with lost DB acknowledgement is conservatively spent; it is not refunded.
Provider failures/explicit Retry also consume admitted budget. No automatic provider retries.

Global budget protects support cost but NOT per-visitor fairness or distributed DDoS availability.
A visitor can exhaust the shared budget. Origin checks/project key are not secure visitor identity.
Limiter applies only to this support function, not Phase 3A, Vision or other account usage.

## Model-call/token/cost exposure

Same pinned model as existing Phase 3A: gpt-4.1-mini-2025-04-14; Phase 3A unchanged.
One admitted support request = at most TWO model calls:
- classifier max_output_tokens 400
- answer max_output_tokens 450, only when allowed, no tools/automatic repair/retry
Safety/legal/case-specific/off-topic/clarification paths use only classification.
300 reservations/day => at most 600 calls and 255,000 configured output tokens per budget day.
Question <=1200 characters; <=6 history turns, each <=1600; request stream <=48KB.
Serialized model envelopes capped at 30KB classifier / 16KB generation (including schema/escaping).
Text limits also apply before those envelopes. Final displayed answer <=1600 characters.

Conservative PLANNING allowance: 48,000 input tokens for a full two-call request
(46KB serialized envelopes plus allowance for provider framing; NOT measured token usage).
For 300 reservations this is 14.4M input + 0.255M output tokens. At listed standard
GPT-4.1-mini pricing ($0.40/M input, $1.60/M output), that planning envelope is about
USD $6.17 per 300 reservations before tax/other costs. Ordinary short questions should be much lower.
This is not a guaranteed billing cap: exact tokenizer usage was not measured, prices/account terms
can change, calls can straddle midnight, and unrelated functions use separate budgets.
Raising daily limits scales this exposure proportionately; provider account spend controls remain useful.

Official pricing/model reference checked:
https://developers.openai.com/api/docs/models/gpt-4.1-mini
Current documentation labels this model deprecated. The pin was preserved for architecture consistency;
confirm account availability/lifecycle during approved provider evaluation before exhibition release.
No model substitution or Phase 3A change was made.

## Verification results

PASS:
- Frontend npx tsc --noEmit.
- New Edge function TypeScript dependency graph with local Deno declaration shim.
  This is not a Supabase/Deno runtime deployment test.
- npm run build.
- 40 Node tests: new handler/adapter/provider tests plus Phase 3A, disabled Vision,
  report/safety, ownership/Home, information requests and PM annotation regressions.
- Separate native PostgreSQL 18.4 suite: exact migration and exact rollback, role/ACL guard,
  bypassrls service-role direct-access denial, invalid configuration, default daily boundary,
  smaller configurable boundaries, UTC/timezone resets, minute rollover, no denied increments,
  40 independent connections racing for 30 slots, lock timeout, missing row, existing sentinel intact.
- git diff --check.
- Browser fixture (actual screen/client/handler; fake provider and budget responses):
  suggested/free-text sends, pending disables, normal boundary, suggestions after boundary,
  one retained user bubble on Retry, 502 recovery, 429 cooldown/recovery, reset-on-exit.
  Aggregate fixture counters: 6 budget checks, 5 classifier invocations, 3 answer invocations.
- Browser widths 375,390,768,1440: no page/content horizontal overflow.
  Composer 16px, 120px max height/internal scrolling, Enter newline, visible focus.
- Actual Home and floating entry both open /support. Back returns Home. Normal console clean.
- Bundle scan finds no OPENAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY, OpenAI URL,
  classifier instructions or classifier schema name in frontend assets.
- No application dependencies added. Temporary test packages/data/server fixtures removed.

REAL-PROVIDER FOLLOW-UP (18 October 2026):
- One approved 22-case local-handler OpenAI pass completed: 26 calls, estimated US$0.0060112.
- Expected classification accepted in 16/22 cases. Release HOLD: dangerous/no-photo guidance omission,
  ordinary-question/context false rejections, and narrower answer-quality defects remain.
- Full outputs, manual safety/factual/injection review, latency/usage and proposed minimal fixes:
  BATCH_6A_REAL_PROVIDER_EVALUATION.md and BATCH_6A_REAL_PROVIDER_RESULTS.json.
- No paid rerun, prompt change, deployment or live SQL operation performed for this evaluation.
- Subsequent focused local prompt/FAQ/precedence fixes passed local regressions and an approved
  36-case real-provider pass (39 calls, estimated US$0.0139788). All predefined scope checks passed,
  but manual answer review failed cases 21/H05/H14. Release remains HOLD; see
  BATCH_6A_FOCUSED_PROVIDER_EVALUATION.md and BATCH_6A_FOCUSED_PROVIDER_RESULTS.json.
- Final completeness fixes for 21/H05/H14 are now prepared with 38 local tests passing; see
  BATCH_6A_FINAL_COMPLETENESS_REFINEMENT.md. The separately approved 44-case pass completed:
  47 calls, estimated US$0.0202620; 43/44 predefined checks, 41/44 manual answer quality.
  Previous failures resolved, but 14/H04/F08 now fail. Release remains HOLD; see
  BATCH_6A_FINAL_PROVIDER_EVALUATION.md and BATCH_6A_FINAL_PROVIDER_RESULTS.json.

NOT YET VERIFIED:
- Hosted RPC service-role mapping/CORS/provider availability and full Preview end-to-end.
- Physical iPhone Safari keyboard/safe-area/touch acceptance.
No broad PM workflow write or report submission was repeated for this isolated support batch.

The earlier local UI handler fixture did NOT run real OpenAI; the separately approved provider
evaluation above used the actual local handler/provider without deploying the function.
Current exhibition decision accepts the documented answer-quality limitations; security/runtime
gates and physical acceptance in the exhibition deployment packet still apply.

## Reproduce local checks

npm install --prefix .tmp-support --no-save embedded-postgres@18.4.0-beta.17
node --test tests/supportBudget.test.mjs
node --experimental-strip-types --test supabase/functions/tests/support.test.ts
npx tsc --noEmit
npm run build

The budget test binds 127.0.0.1:55439 only, uses random disposable credentials, creates isolated
roles/database objects, uses independent native connections and stops/cleans its database.
It never reads .env.local or a live database URL. Native process permissions may be required.

## Separate approval required before any live operation

1. Review the complete migration, permissions, this cost envelope and rollback.
2. Explicitly approve applying ONLY 20261018112420_support_request_budget.sql to the existing FixLens
   project ycnilqoqtgjmptxzuhty and deploying ONLY answer-maintenance-question.
   Recheck migration history and object collisions before applying once.
3. Verify actual service-role RPC behavior and anon/authenticated denial live.
4. Confirm existing server-only OPENAI_API_KEY and SUPABASE_SERVICE_ROLE_KEY availability;
   defaults 30/minute and 300/day require no new limit overrides. No key copied to client/.env.local.
5. Review the completed local 22-case real-provider findings and proposed focused fixes.
   Obtain fresh paid-call approval for targeted reevaluation after fixes. Hosted endpoint verification
   remains separate and requires SUPPORT_LIVE_EVAL_APPROVED=true; no automatic retries.
6. Verify approved Preview/local:5173 CORS and responsive behavior, then physical iPhone Safari.
7. Commit/Preview/Production actions require subsequent user instruction; nothing automatic.

Rollback after approval: stop support traffic/function first, then execute the prepared exact rollback
transaction. Revoke/drop the public wrapper first, revoke private EXECUTE/schema USAGE and drop the
private definer, then remove the counter table/schema. No CASCADE. Only the new functions/table/schema
are removed. Existing application data and
policies remain untouched. A function left running after rollback fails closed (budget 503).
Migration is not blindly rerunnable; recheck history rather than replaying it.

Screenshot:
C:/Users/17526/.codex/visualizations/2026/09/09/01a085cf-9013-7470-bd0d-880215d8126e/batch6a-support.jpg

Recommended commit: feat: add scoped maintenance support assistant and durable budget

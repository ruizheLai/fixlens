# Batch 6A — Controlled backend deployment result

19 October 2026, Australia/Sydney. Project **FixLens — ycnilqoqtgjmptxzuhty**. **Backend deployed and verified; frontend Preview/iPhone acceptance pending.**

## Approved migration and objects

Applied the exact reviewed `supabase/migrations/20261018112420_support_request_budget.sql` once through the migration API. Source SHA-256 `fd1be557188d758996f1bc980e7cd56dfd78c60060841db3c956a65fbbb1143e` matched before apply and still matches the freeze manifest.

Live migration history assigned **20261018135231 — support_request_budget**. This maps to the approved local filename above; earlier nine entries were not repaired/replayed. Do not run broad `db push` to reconcile the timestamp difference automatically.

Verified live:

- `fixlens_support_private` and singleton `request_budget` exist, owned by postgres, table RLS enabled, table ACL only postgres.
- Private `consume_support_budget(integer,integer)` is SECURITY DEFINER, postgres owner, `search_path=pg_catalog`, lock timeout 2s, statement timeout 3s.
- Public wrapper is SECURITY INVOKER, postgres owner, pinned search path and defaults **30, 300**.
- service_role has only the required private schema USAGE and function EXECUTEs; no private schema CREATE or counter SELECT/INSERT/UPDATE/DELETE. PUBLIC/client execution grants are absent. Owner/admin retains expected administrative privileges.
- anon/authenticated actual `SET LOCAL ROLE` calls to public/private operations and counter reads were denied. Roles tested in a rollback-only transaction; no Auth user/session was created or modified.
- Public anonymous HTTP RPC returned **401 / SQLSTATE 42501**, permission denied.
- Invalid service-role limits rejected with `invalid_parameter_value`; valid default reservation succeeded inside a transaction that was rolled back.

Before/after existing-object fingerprints and counts match:

| Baseline | Before | After |
| --- | --- | --- |
| Cases | 20 | 20 |
| Auth users | 1 | 1 |
| Storage objects | 35 | 35 |
| Storage buckets | 1 | 1 |
| public/auth/storage relation ACL/RLS fingerprint | dff402cc2d842e4a157f7b1def99752d | same |
| Existing policy-definition fingerprint | 4c671ac93fea9e7ff6129eac6deacbee | same |
| Existing function-definition fingerprint, excluding new budget RPC | 23c4e24a282a62129829f859e41e5e8a | same |

No Case, Auth, existing RLS, Storage, PM or workflow object was changed. A read-only baseline query initially needed an explicit catalog `char` cast; it was corrected before migration and was not a migration/permission failure.

## Function deployment

Only **answer-maintenance-question**, **version 1**, ACTIVE, deployed using the reviewed named-function CLI command with `--no-verify-jwt --use-api`. Bundle hash reported by Supabase: `ff5ae15ee05848bf8ea39a8439661a2ac3db456d163d04862a0c8a1dcf8778ab`.

No prompt, model, runtime source, secret or budget-limit changes. Hosted preflight confirmed required secrets present and overrides absent; effective configuration stays **30 requests/minute and 300/day**, fixed UTC windows. Runtime admission through the actual hosted service-role/PostgREST path succeeded. No client OpenAI/service-role credential exposure.

Existing functions unchanged:

- Report AI `analyze-maintenance-issue`: **v3**, ACTIVE, hash `371ebdeecda47d90d9d3be802137c4ec93044cb7d675b4c55a78dbc5d18a0d53`.
- Vision `analyze-capture-frame`: **v4**, ACTIVE, hash `290ae9aecdacd7ce9894fb35a4b4dc19b5beac4f8d59b6ca99be0a0fa0b92a59`. No Vision invocation/configuration change.

## Hosted runtime smoke

All below used synthetic inputs and the existing frontend publishable key; no case/report was submitted. [Sanitized HTTP evidence](./BATCH_6A_BACKEND_SMOKE_RESULTS.json) contains complete responses, status/latency/CORS headers and fixture notes, without request credential values.

| Check | Result |
| --- | --- |
| “How do I report a leaking tap?” | 200, in_scope; report details, Overview/Close-up, no risky repairs, Case Detail follow-up |
| “Write me a poem.” | 200, out_of_scope; fixed short maintenance boundary, no poem |
| “Can I submit without photos if it is dangerous?” | 200, safety_sensitive; no approach/DIY, tenancy/emergency guidance, Continue without photos, Safety Report Review, no emergency-service/notification claim |
| Existing Report AI: “The kitchen tap is leaking.” | 200, sufficient; issue leaking tap, location kitchen, summary “The kitchen tap is leaking.”, no follow-up |
| Approved origins OPTIONS | 204; exact localhost/127.0.0.1:5173, production fix-lens.app and representative narrow FixLens/team Preview pattern |
| Unrelated origin OPTIONS/POST | 403, no allowed-origin echo |
| Wrong client key | 401 |
| Invalid client budget-override payload | 400; no client override accepted |
| Minute boundary | 429, `Retry-After: 19`, matching JSON retryAfter=19 and exposed header |
| Unavailable budget counter | 503, controlled temporarily-unavailable/retain-question/Retry message |

The normal response included: “Provide two photos: an Overview showing the tap in context and a Close-up capturing the visible leak detail.” The unrelated response was “I'm here to help with rental maintenance, reporting issues, photo evidence and case updates. You can ask me about those topics.” The safety response included no-approach advice and the existing no-photo reporting path; no provider workaround or UI fallback was used.

Model availability is established by successful hosted provider-backed responses using the frozen `gpt-4.1-mini-2025-04-14` code, plus the successful existing Report AI call. Previously reported model retirement remains 14 January 2027; no model change is part of this release.

## Controlled budget fixtures and cleanup

Only the **new support counter** was used for fault fixtures. Limits/secrets/permissions were never changed, and no 300-request exhaustion test was attempted.

1. Minute-count fixture temporarily seeded the current-minute boundary at 30 while actual day_count stayed 3. HTTP returned 429 with readable Retry-After. Guarded cleanup restored the original minute_count=2 and day_count=3 without overwriting concurrent admissions.
2. Initial rollback-only table-lock attempt could not be observed because management SQL calls serialized. The transaction rolled back and **no HTTP request was sent for that attempt**.
3. A missing-counter fixture briefly removed only the newly created singleton (guarded on day_count=3), confirmed hosted 503, then restored its exact saved timestamps/counts. This was fault-test cleanup, not migration rollback. No schema/function/grant changes were used for failure injection.

Final state: exactly one counter row, minute_count=2, day_count=3, no remaining exclusive test locks. UTC minute timestamp is allowed to be stale until the next reservation normalizes its window. Exactly **three real support admissions** persisted. Invalid/denied/429/503 checks produced no additional admission or provider call. No test Case, Auth account, evidence or Storage object was created, so no legitimate data cleanup was necessary.

## Provider calls, logs and cost limitation

Observed successful paths imply **five provider calls**: support classification×3 + generated maintenance answer×1 + Report AI×1. No retries/full evaluation. Counter and hosted HTTP logs corroborate three successful support requests and one Report AI request, plus expected controlled error responses.

**Metered token usage and actual billed cost are unavailable from the frozen hosted response/log contract.** Provider usage is not emitted, and no OpenAI admin/billing credential was requested or used. Do not present token estimates as measured usage. Conservative serialized-envelope/output-cap planning for the smoke is **US$0.0652016**, below the previously proposed US$0.10 smoke allowance; actual usage is expected lower but not claimed. No code was changed/redeployed to add usage logging.

Read-only log queries over the test window confirmed support 200/204 and intentional 400/401/403/429/503 statuses, Report AI 200, and no function error/warning-level entries in returned aggregation. No raw provider error, private credential or user data appeared in HTTP evidence. Platform log coverage of individual rejected requests can differ from the complete local HTTP ledger; no log polling loop was used.

## Final review and next action

Frozen behavior, SQL and rollback remain byte-identical to the reviewed manifest. Known accepted quality limitations are unchanged. No destructive migration rollback, secret changes, Phase 3A/Vision changes, authentication changes, commit/push/merge, frontend deployment or unrelated development occurred.

No critical backend failure remains. Warnings/limits: billed token usage is not observable here; actual browser navigation/current Preview and physical iPhone Safari have not been verified; migration API allocated a different live timestamp, recorded above.

Next action: review the uncommitted frontend diff and authorize a **Vercel Preview only**. Use the existing project URL/publishable key, an origin matching the frozen FixLens/team policy, then verify Home Other Questions, Floating Chat, reset/Retry/cooldown, iPhone keyboard/safe-area/scrolling, and normal Report AI. Do not deploy Production or push/commit automatically to obtain the Preview.

# Batch 6A — Hosted preflight

19 October 2026, Australia/Sydney. **PASSED for deployment preparation. Nothing applied or deployed.**

Subsequent approved backend deployment completed; see [deployment result](./BATCH_6A_BACKEND_DEPLOYMENT_RESULT.md). This document preserves the pre-deployment snapshot and is not an instruction to repeat deployment.

## Secure CLI authentication and configuration

Supabase CLI 2.121.0 authenticated through its normal browser/one-time verification flow using text mode (`--agent no --output-format text`); automatic JSON mode cannot prompt. No access token, password or secret value was printed, copied into the repository or put in `.env.local`. The normal CLI login remains available; temporary CLI project-cache files were removed from the worktree.

Authenticated, read-only `secrets list --project-ref ycnilqoqtgjmptxzuhty --output json --agent no` was captured in process memory and reduced to name-presence results. Raw inventory/value fields were not displayed or saved.

| Hosted secret/config name | Result | Effect |
| --- | --- | --- |
| OPENAI_API_KEY | Present | Project-wide hosted secret available to the new Edge Function |
| SUPABASE_SERVICE_ROLE_KEY | Present | Server-only budget adapter credential available |
| SUPABASE_URL | Present | Project API URL available |
| SUPABASE_PUBLISHABLE_KEYS | Present | Hosted accepted-client-key dictionary available |
| SUPABASE_ANON_KEY | Present | Existing legacy fallback available |
| SUPPORT_REQUESTS_PER_MINUTE | Absent | Frozen code default **30** applies |
| SUPPORT_REQUESTS_PER_DAY | Absent | Frozen code default **300** applies |

No secret or override was added, replaced, deleted or revealed. These are global support request limits, not model-call limits and not per-visitor allowances. Runtime startup/use cannot be observed until the function is deployed; secret-name existence does not prove current provider quota. The existing model already passed the recent approved real-provider evaluation; no further paid key/model probe was run.

## Live project and migration checks

- Correct existing project `ycnilqoqtgjmptxzuhty`, name FixLens, ACTIVE_HEALTHY, Sydney, PostgreSQL 17.6.
- Nine existing migration records remain, last `20261014093153_information_request_types`. No support budget migration recorded.
- Support private schema, counter table, public RPC and private operation all absent. No collision found. service_role has existing public-schema USAGE.
- `answer-maintenance-question` absent; Report AI remains ACTIVE v3, Vision ACTIVE v4, both unchanged.
- Every file in `BATCH_6A_EXHIBITION_FREEZE.json` matches its reviewed SHA-256, including the final private-definer/public-invoker architecture and exact rollback.

Migration: `supabase/migrations/20261018112420_support_request_budget.sql`

SHA-256: `fd1be557188d758996f1bc980e7cd56dfd78c60060841db3c956a65fbbb1143e`

Rollback: `supabase/maintenance/rollback_support_request_budget.sql`

SHA-256: `1a8124d59b20f111f3a088d28156187133e333d47aea33e5b407dbdb45713dd9`

No credential/configuration/content inconsistency found. Planned ACLs remain explicitly service-role-only; **actual new RPC grants/transport cannot be tested before migration** and remain mandatory post-apply checks, not an unresolved observed permission defect.

## Function deployment configuration

- Name `answer-maintenance-question`; entrypoint `answer-maintenance-question/index.ts`.
- `verify_jwt=false` intentionally matches publishable-key exhibition clients; handler still enforces trusted origins, project client key and budget-before-provider.
- Existing global `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, URL and client-key runtime variables are used; no secret upload/change is needed.
- Pin `gpt-4.1-mini-2025-04-14`, existing schemas/prompts/answers unchanged. At most two calls, output caps 400/450, existing timeouts and controlled failure handling unchanged.
- Bundle only this function and its seven reviewed source/dependency files listed in the deployment packet. Including the unchanged Report AI CORS dependency does not redeploy Report AI.
- Do not change `CAPTURE_VISION_ENABLED`, Report AI, existing functions, database objects, Auth or frontend configuration.

## Exact next deployment operations — separate approval still required

1. Recheck inventory for drift immediately before execution. Apply only this file with the migration API (which records history):

```text
supabase.apply_migration
  project_id: ycnilqoqtgjmptxzuhty
  name: support_request_budget
  query: exact full contents of E:\fixlens\supabase\migrations\20261018112420_support_request_budget.sql
```

Record actual returned history version/name/source hash. Do not use broad `db push` or replay/repair unrelated migration history. If the response is lost, inspect history and objects before retrying.

2. Run the exact owner/path/ACL/RLS and client-denial checks from [BATCH_6A_EXHIBITION_DEPLOYMENT.md](./BATCH_6A_EXHIBITION_DEPLOYMENT.md). Stop on mismatch; do not weaken grants or bypass the budget.

3. Deploy only the named function:

```powershell
Set-Location E:\fixlens
npx --no-install supabase functions deploy answer-maintenance-question --project-ref ycnilqoqtgjmptxzuhty --no-verify-jwt --use-api
```

No login/secret change is presently required. Do not omit the function name or use `--prune`. The connected MCP deployment alternative and precise bundle file names remain in the deployment packet.

4. Record actual deployed support version; confirm Report AI v3/Vision v4 untouched. Execute only separately approved bounded hosted smoke tests, including the actual service-role RPC path and physical iPhone checks. No paid/provider smoke has been run in this preflight. The earlier full-evaluation approvals are consumed. The deployment packet proposes up to three support requests and one Report AI prompt with a US$0.10 allowance, requiring explicit approval.

Rollback remains support-endpoint deletion, drain in-flight support requests, then the exact scoped rollback file through an approved rollback migration. Shared secrets, existing data/permissions/functions remain intact. Frontend deployment, commit/push/merge and any live SQL/function action were not authorized by this preflight request and were not performed.

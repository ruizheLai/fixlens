# Batch 6A — Frontend Preview preparation

19 October 2026, Australia/Sydney. **Branch batch-6a verified. Ready for manual commit/push and Preview acceptance; no Git mutation or deployment performed.**

## Complete worktree review

Reviewed tracked diff (three modified files) plus all 32 untracked Batch 6A files, including frozen runtime/contracts, SQL/rollback, tests, synthetic evaluation evidence and current deployment documentation. The original 35 candidates total approximately 599 KB. This preparation adds only this document and the explicit staging allowlist: **37 recommended files total**. Nothing is staged currently.

- Frontend: `src/screens/renter/SupportChatScreen.tsx`, `src/services/support.ts`, `src/styles/reportVisual.css`. Existing unsupported repair-timeline/PM-notified fixture replies were replaced in Batch 6A with the approved real support endpoint and controlled messages; no further UX/prompt changes in this preparation.
- Shared contract: `supabase/functions/_shared/support.ts` must be committed because both frontend modules import it. It contains types, bounded validators and safe copy, not keys or provider clients. No server-only module is imported by the frontend.
- Backend source/config/SQL must accompany this batch as the audited source of the **already-deployed** support v1 and migration. Committing these files is not an instruction to replay migration or redeploy. Live migration `20261018135231` maps to reviewed local `20261018112420_support_request_budget.sql`; previous history mismatch remains documented. Never blindly run db push.
- Permanent synthetic test datasets/results and review documents are intentional repository artifacts, not temporary fixtures. Temporary key files, local database/test infrastructure, raw checkpoints, CLI caches, node_modules and dist are excluded.
- No App/router, Report AI, Camera, Annotation, PM, package/dependency, Vite or Vercel configuration changes are present. Existing Home Other questions and floating chat both route to `/support`; Support Back returns Home and unmount resets the conversation/aborts an in-flight request. Existing SPA rewrite already supports direct `/support` URLs.

Accepted exhibition limitations and frozen behavior remain in `BATCH_6A_EXHIBITION_FREEZE.json`; all source/SQL hashes still match. Backend v1, Report AI v3 and Vision v4 were verified in the previous deployment task. No migrations, function deployments, hosted requests or paid evaluations were run in this preparation.

## Frontend wiring and bundle safety

- Client invokes `${VITE_SUPABASE_URL}/functions/v1/answer-maintenance-question`, with existing public `VITE_SUPABASE_PUBLISHABLE_KEY`, JSON body and AbortSignal deadline. Current local configuration points to `ycnilqoqtgjmptxzuhty` and uses a public client key. No private values were printed.
- Request payload contains only the question and at most six history turns. There is no case retrieval, PM write, email, camera upload or provider call in this service.
- Loading prevents duplicate sends. Error retains the attempted question/history; Retry resends it without another user bubble. A server-budget 429 reads exposed Retry-After, clamps it to the supported maximum and displays/disables until cooldown. Exit aborts pending work. Shared report input/viewport components are reused without editing their implementation.
- Rebuilt all six emitted HTML/JS/CSS files and scanned for OpenAI/private Supabase key patterns, service-role JWTs, OpenAI/service-role environment references and direct OpenAI API URLs: **zero matches**. The deployed support URL path is present. Proposal files were scanned for private key/token patterns, with no matches. Public Supabase configuration is expected in the bundle.
- `.env.local` and `.tmp-*` remain ignored. Git index is empty: no temporary credentials, secrets or fixtures are staged. Do not use git add -A, git add . or force-add ignored files.

## Preview origin and publication

The frozen/deployed CORS rule allows HTTPS origins whose hostname matches:

```text
^fixlens-[a-z0-9](?:[a-z0-9-]*[a-z0-9])?-brad-s-team2\.vercel\.app$
```

Planned branch alias `https://fixlens-git-batch-6a-brad-s-team2.vercel.app` passes the actual `isTrustedOrigin` implementation; unrelated Vercel origins are rejected. Prior hosted smoke also verified the representative FixLens/team Preview pattern. **This alias is a validated planned origin, not a claim it has been published.** The exact new deployment URL is not yet supplied, so its actual Origin/CORS/browser behavior remains an acceptance gate.

After manual publication, copy the actual `window.location.origin` and check it against the deployed rule, then check OPTIONS echo/headers in Network. A different project/team/custom Preview domain must not be assumed allowed. Report a mismatch before requesting any backend change; do not broaden the frozen rule automatically.

Use the existing public Supabase URL/key in the Vercel **Preview** environment and Vite `npm run build` → `dist`. No OpenAI or service-role key belongs in Vercel frontend variables. Do not deploy Production. Do not add a Supabase migration/function deployment hook to the build.

## Checks completed

- `npx tsc --noEmit`: passed.
- `npm run build`: passed, 161 modules; no build errors. Bundle credential/provider scan passed.
- **60 automated tests passed**, in two non-overlapping suites: 36 support/evaluation-observer/report/camera/annotation tests and 24 Report AI/disabled-Vision/information-request/PM annotation regressions. Provider transport was mocked; **zero paid calls**. These do not replace browser/mobile acceptance or certify all PM end-to-end workflows.
- Shared contract/provider/backend frozen hashes match the deployed review manifest. No runtime code was edited during this preparation.
- git diff whitespace check passed; existing LF→CRLF Git notice is not a compilation error. No changes are staged; review new files with status as well as git diff, because ordinary git diff omits untracked files.

Commands used:

```powershell
npx tsc --noEmit
npm run build
node --experimental-strip-types --test supabase/functions/tests/support.test.ts tests/supportProviderEvaluation.test.mjs tests/reportSafety.test.ts tests/reportDraft.test.ts tests/annotationEditing.test.ts tests/camera.test.ts
node --experimental-strip-types --test supabase/functions/tests/issueUnderstanding.test.ts supabase/functions/tests/captureFraming.test.ts tests/pmAnnotations.test.mjs tests/informationRequests.test.ts
```

Native PostgreSQL concurrency tests were previously run for the unchanged migration and not repeated; no live database test/migration or Supabase deployment was required here. No model evaluation runner was executed.

## Exact manual staging recommendation

`docs/BATCH_6A_STAGING_FILES.txt` is the complete explicit 37-file allowlist: the three tracked changes, all 32 reviewed new Batch 6A source/test/evidence files, and these two preparation artifacts. Its paths are relative to the repo root. No globs or ignored files are included.

**For the user to execute manually after review; not executed by Codex:**

```powershell
Set-Location E:\fixlens
git branch --show-current
git status --short
$batch6AFiles = Get-Content -LiteralPath docs/BATCH_6A_STAGING_FILES.txt
git add -- $batch6AFiles
git diff --cached --check
git diff --cached --name-status
git diff --cached --stat
```

Confirm exactly the allowlisted files are staged and inspect the cached diff, particularly the new untracked runtime/SQL/shared-contract files. If any .env/.tmp/credential artifact or unrelated file appears, stop before commit. Do not reapply the committed SQL or redeploy backend functions.

Recommended commit message:

```text
feat: add exhibition maintenance support assistant
```

Manual commit/push, only when the user chooses:

```powershell
git commit -m "feat: add exhibition maintenance support assistant"
git push origin batch-6a
```

Check the Vercel deployment is **Preview** for batch-6a, not Production. No merge or automatic deployment was performed here. Publishing makes the Preview acceptance possible; it does not imply acceptance has passed.

## Preview acceptance — pending publication, not yet checked

- [ ] Actual Preview origin is allowed; OPTIONS returns 204 with the correct echo, apikey/content-type allowed, no CORS errors.
- [ ] Home → Other questions opens FixLens Assistant / Maintenance support.
- [ ] Floating Chat from an existing renter screen opens the same `/support` Assistant.
- [ ] Suggested questions work; bounded maintenance question receives a real server answer with normal pending state.
- [ ] Clearly unrelated question receives the maintenance boundary; no unrelated content.
- [ ] Unsafe-photo question receives no-approach/no-photo guidance and service limitations.
- [ ] Loading disables duplicate sends; Retry retains the failed question and does not duplicate the user bubble. Use local browser request interception for a controlled error where possible; do not alter shared secrets or backend code.
- [ ] Controlled 429 displays actual cooldown and disables Retry until expiry. Use browser response interception for UI acceptance; do not consume the 300/day budget or modify live counters again. Real hosted 429/Retry-After already passed backend smoke.
- [ ] Back/exit/reopen resets conversation and prevents a late reply from the previous visit.
- [ ] Physical iPhone Safari: keyboard, multiline input, conversation scrolling, safe area, touch controls and no horizontal overflow. Responsive desktop emulation alone is insufficient.
- [ ] Existing Report AI remains functional; Camera/Annotation/PM visual/route spot checks remain consistent with the baseline. Do not create disposable backend data unless separately needed/authorized.
- [ ] No unexpected console warnings/errors; intentional intercepted failure noise distinguished from success-path problems.

Actual browser/physical-device and provider-backed Preview requests have not been performed in this preparation. After publication, use only the small functional acceptance set above, not the full paid corpus. The known exhibition answer limitations remain accepted; no further optimization or evaluation cycle is planned.

**Next action:** user reviews/stages/commits/pushes batch-6a manually, then provides the actual Vercel Preview URL for acceptance. No additional backend work is required to publish this prepared frontend.

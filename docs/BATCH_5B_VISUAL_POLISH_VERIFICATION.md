# Batch 5B — Report experience and PM visual polish

18 October 2026. Visual changes only; ready for review, physical acceptance pending.

## Baseline

- Continued existing branch batch-5b (request called it batch5B); no branch created/renamed.
- Clean starting worktree at cf943c8, identical to local main. Batch 5A, 5A.1 and 5A.2 commits present (9c667fb, 07b764b, 516d95a).
- Remote fetch was not performed; baseline comparison is against local main.
- Before screenshots captured for chat, property confirmation, summary, danger, Final Review, Safety Review, written request, PM Dashboard, PM Detail and request dialog. Controlled local fixtures, no production data changes.

## Files

Created:
- src/styles/reportVisual.css
- docs/BATCH_5B_VISUAL_POLISH_VERIFICATION.md

Modified:
- src/App.tsx: load scoped report CSS.
- src/styles/renterVisual.css: expose existing palette through fixlens-visual; existing renter layout selectors unchanged.
- src/components/chat/AssistantBubble.tsx, UserBubble.tsx: presentation class hooks only.
- src/features/report/ReportWorkflow.tsx: scoped chat/header/card/composer hooks; accessible icon-only Back label.
- src/features/report/FinalReportReview.tsx, SafetyReportReview.tsx: scoped review/card/field hooks.
- src/screens/renter/SubmissionSuccessScreen.tsx: scoped success presentation.
- src/features/evidence/WrittenDetailsWorkflow.tsx, RequestedEvidenceWorkflow.tsx: scoped non-camera request presentation and instruction cards.
- src/features/pm/PMPortal.tsx: inherit shared palette.
- src/features/pm/pm.css: denser consistent operational styling.
- src/screens/pm/PMCaseDetail.tsx: presentation-only request-state data attribute.

## Presentation

Reuse existing canvas #FAFBFC, white surface, border #E7EAF0, text #111827, secondary #6B7280, blue #2563EB, subtle blue #EFF6FF and existing semantic action/safety/status tokens. No duplicate theme or dependencies.

Report: restrained user bubbles, consistent assistant avatar alignment, readable wrapping, stable card indentation, white information cards, clearer metadata labels and issue emphasis, 12px controls, visible focus and safe-area-aware header/composer padding. Property identity/contact values unchanged.

Composer implementation untouched: 16px textarea, auto-growth to 120px, internal scrolling, Enter/newline and existing visual-viewport hook preserved. Send has a 44px target and clear disabled presentation. No microphone added.

Review: consistent detail cards, photo controls, supporting text, error alerts and Submit. Native edit/view dialogs, cancellation, replacement callbacks, normal two-photo eligibility and safety no-photo logic unchanged. Success remains reachable only after existing persistence logic succeeds.

Requests: photo and written instructions share white cards with red request border; primary response actions remain blue. Capture and annotation return branches remain outside report styling. Existing read-only submitted/resolved gallery remains unchanged.

PM: shared palette, stronger case-title hierarchy, compact table spacing, subtle hover/focus, aligned search/filters, readable field grids/written responses, preserved sticky Next Action, 44px mobile/modal/evidence controls and selected request choices. Existing table scroll remains internal on narrow screens. Evidence stays 108x144 with full uncropped viewer and normalized annotations.

Request history: Requested uses a red edge, Submitted blue, Resolved green, alongside explicit lifecycle text. Canonical status presentation stays distinct: Submitted informational/neutral, Under review blue, Awaiting approval amber, repair stages informational, Completed green. Renter Action required remains red; PM waiting/review attention remains amber. Safety retains explicit renter-reported danger wording and separate safety palette.

## Verification

- npx tsc --noEmit: pass.
- npm run build: pass.
- 22 existing tests pass across report draft/rendering/safety, contact display, Home identity/ownership, information requests, PM annotation viewer, annotation editing and metadata validation.
- No standalone PM workflow UI test suite exists; PM UI checked in browser fixtures.
- git diff --check: pass.
- Renter fixtures at 375x667, 390x844 and 768x900: no page or content-scroller horizontal overflow across chat, confirmation, summary, danger, reviews, written response and requested photo review.
- PM fixtures at 390, 768, 1024 and 1440px: no page/dialog horizontal overflow; internal table scrolling only at 390/768, none at 1024/1440.
- Property Confirm advances correctly; textarea verified 16px, 120px max height, overflow auto and Enter inserts newline.
- Controlled provider-response fixture exercised actual understanding hook/conversation logic: missing-location follow-up, answer, structured summary, confirmation, danger choice, return to safety question, normal choice and capture entry.
- Final Review edit Cancel preserves original detail; full-photo dialog opens and Escape dismisses. Retry remains enabled; pending Submit disabled.
- PM search and Completed filter return expected rows; request radio choices, instructions, disabled/enabled Send, native modal focus and Escape work.
- PM evidence thumbnail measured 108x144; full-image viewer opens and Escape dismisses. Annotation viewer tests pass.
- Fresh fixture success path and fresh actual /report page console clean. Actual page loads authoritative demo address, persona and Brad Lai/Apex Rentals.
- During implementation, a temporary HMR reload/fixture syntax failure and a test-harness root-remount warning occurred; corrected and fresh sessions rechecked. A redundant Back aria-label on the danger return link was caught and removed.
- Final diff contains presentation classes/CSS and one icon-only label only. No services, provider payloads, camera/annotation files, data models, auth, polling, schema, RLS or workflow transitions changed.
- Temporary fixtures removed. No secrets or .env.local added/staged; no commit, push, merge or deployment.

## Before/after references

Screenshots stored outside the repository:
C:/Users/17526/.codex/visualizations/2026/09/09/01a085cf-9013-7470-bd0d-880215d8126e/

- batch5b-before-{chat,property,summary,danger,final,safetyreview,written}.jpg
- batch5b-after-{chat,property,summary,danger,final,safetyreview,written,photo}.jpg
- batch5b-before-desktop-{pm,pmdetail,modal}.jpg
- batch5b-after-desktop-{pm,pmdetail,modal}.jpg

PM evidence mock was added for separate viewer verification after the initial empty-evidence baseline; it is not a claim of changed live evidence.

## Limits and manual acceptance

Browser fixtures substituted backend reads/provider responses/private image download; no paid AI evaluation, live submission, workflow write, request resolution or upload was repeated for this CSS-only batch. Backend permissions, retry/idempotency, ownership and invalidation are unchanged, not newly certified by these fixture checks.

Physical iPhone Safari remains required; desktop emulation cannot certify keyboard obstruction or hardware safe-area behaviour. No remaining defect found in tested layouts.

Before acceptance:
- [ ] iPhone Safari on an HTTPS Preview: property confirmation, keyboard open/close, multiline follow-up and scrolling; header/composer not obstructed.
- [ ] Normal report: capture/annotate both photos, Final Review Edit/Cancel/Save and replacement/cancel, submission/retry.
- [ ] Safety report: explicit danger, tenancy contact guidance, continue without photos and Safety Review.
- [ ] Photo/written request: response, refresh and read-only submitted/resolved views.
- [ ] Desktop PM: search/filter, row click and Enter activation, sticky Next Action, uncropped annotated evidence and request dialogs.
- [ ] Authorized existing renter/PM acceptance: transitions, response resolution, polling/invalidation; use designated disposable data only.

Next manual action: review the local app/diff and screenshots, then manually prepare a Preview for physical iPhone Safari acceptance before approving a commit.

Recommended commit: style: polish report experience and PM portal

# Batch 5A.2 — Action Required styling verification

Verified 18 October 2026. Frontend styling only; no live records were changed.

## Audit and change

- Shared StatusPill action variant: dedicated action tokens instead of safety danger tokens.
- Renter visual scope: removed Home-only red override; replaced the older amber action badge and attention-card border with shared red tokens.
- Home: white action card now uses the shared border token.
- Cases Active: actionable case borders and badges use shared red tokens; History remains Completed green.
- Kitchen/request Case Detail: action banner and Your Action instruction use shared red; response button stays blue.
- Inbox: replaced separate pink/red palette with shared badge, dot and border tokens on a white row.
- PM Dashboard: explicit renter Action required badge uses red tokens. Evidence awaiting review and generic PM attention remain amber.
- Bedroom/no-request and Hot Water/completed detail variants: audited; no outstanding-action style to replace.
- WrittenDetailsWorkflow, RequestedEvidenceWorkflow and RequestedEvidenceGallery: audited; no separate Action Required badge or amber renter-action style. Neutral instructions, blue response actions and submitted/resolved labels remain unchanged.
- PM Case Detail and PMWorkflowActions: audited; neutral request lifecycle labels and PM work/waiting messages remain unchanged.
- Request eligibility, Inbox action flags, routing, polling and lifecycle helpers remain unchanged.

Shared tokens in src/index.css: --color-action-text #B91C1C,
--color-action-bg #FEF2F2, --color-action-border #FECACA.

## Verification

- 13 relevant tests passed: information requests, Home identity/ownership/multiple requests, contact display, report draft/rendering and safety.
- TypeScript and production build passed.
- Browser fixtures rendered the actual shared components and screen JSX, substituting only read hooks/callbacks. No database writes.
- Same owned requested case checked across Home, Cases, request Case Detail, Inbox and PM Dashboard: consistent red action accents, white cards and blue response CTA.
- Photo and written request affordances checked; Home response callback retained case/request IDs and detail photo callback retained request ID.
- Written submitted/resolved fixture states across all five screens: no Action required indicator. PM submitted state retains amber Evidence awaiting review.
- Multiple outstanding cases retain the Home additional-cases link and two Cases action badges.
- Canonical Awaiting approval remains amber, Under review blue, Completed green. Immediate danger retains its own existing safety palette and explicit label.
- All five screens at 375, 390, 1024 and 1440px: no page-level horizontal overflow. PM table retains its existing internal horizontal scrolling.
- Fixture and actual Supabase-backed Cases page console checks: no application warnings/errors. One temporary fixture callback incorrectly serialized a React event; corrected in the harness and rechecked cleanly.
- git diff --check passed; no backend/service/model/routing changes.

Limits: lifecycle presentation used local fixtures and existing eligibility tests, not new live request writes or upload tests. Physical iPhone safe-area/device checks were not performed; existing safe-area CSS was unchanged. No remaining action-colour inconsistency found in the audited frontend.

Temporary harness and audit output removed after verification. No commit, push, merge or deployment.

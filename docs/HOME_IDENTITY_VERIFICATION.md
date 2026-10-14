# Batch 2 — Home data consistency and demo identity

Verified across 14–15 October 2026 on Polish.
**PREPARED — FINAL PREVIEW VERIFICATION PENDING.**
No frontend deployment, commit, push, merge, schema migration or PM rename performed.

## Implementation

- The stale Home Recent Case was fixture JSX, not an incorrect Supabase status.
  Home now calls the existing getCases service and canonical StatusPill mapping.
  It prefers the latest updated_at among this session's visitor cases; visible
  shared seeds are fallback only. Equal timestamps use case key ordering.
  Date/time formatting uses existing case helpers and the actual database timestamp.
- Home uses one useAuthoritativeRead and one existing renter invalidation hook
  (15 seconds plus focus/online/visibility refresh). Reads serialize and queue
  revalidation rather than overlap. There is no separate Home cache, timer engine
  or public Realtime subscription.
- canRespondToRequest / actionableRequests centralize owner, case-key, under_review
  and requested-state eligibility. Home, Cases, Inbox and the existing case route
  share this rule. Overview, Close-up, written and legacy type presentation remains
  in the Batch 1.1 helper. The response URL selects a request inside the existing
  case route; it does not create a second response workflow.
- Submitted/resolved requests produce no Home action. With none eligible, the
  entire section is absent. One case is prominent; the additional-case count links
  to Cases. A combined Action Required/Recent card avoids duplicate case cards and
  retains View case details. Stale reads that fail refresh suppress action CTAs.
- demoPersona version 1 deterministically derives a friendly first name, middle
  initial and surname from the stored session ID. Profile, Home and confirmation
  use the current session; PM and renter case mapping use the case's persisted
  session. Arrays/algorithm must retain their order to preserve existing labels.
  The pool has 106,470 name combinations (63 first names × 65 surnames × 26
  middle initials); collisions remain possible.
  Names are display labels, never security principals or unique account IDs.
- Emails use example.com; phone is Not provided (Demo). No visitor PII is collected,
  and no email/SMS is sent. No renter authentication was added.
- Session-backed existing visitor cases also derive their corresponding persona.
  Their renter_id remains the existing exhibition anchor profile. No case/owner
  record is rewritten and no new profile is created. Consumers of raw renter_id
  alone still see that anchor; the shared mapper is required for exhibition labels.
- Null-session shared seeds retain the authoritative historical renter identity
  and are marked Shared demo. Their existing requests remain readable but cannot
  be answered by an unrelated visitor. Their ownership is never assigned to the
  currently open browser.
- getDemoProperty reads property 20000000-0000-4000-8000-000000000001 and its current
  manager relation. Profile and confirmation show the same Thornton Street address
  as case records and PM detail. Confirmation waits for that read; failures offer
  Retry rather than an alternative fixture address. The nonfunctional Edit button
  was removed without adding an editor. Report session identity is frozen for the
  workflow; submission rejects a changed session rather than changing the renter.
- Renter case subtitles show the corresponding tenant and property. The support
  contact reply now refers to Profile instead of naming a hardcoded PM; its
  conversation, timers and reset behavior are unchanged.

## Verification

Before continuation, implementation and the initial nine tests passed. Two live
origin-isolated renter sessions were created, confirmed in Profile/report, and
seen by the authenticated PM as Spencer M. Morgan and Jamie I. Roberts. Home
automatically reflected PM requests and handled multiple actionable cases.

Continuation finished:

- Existing interrupted Close-up Gallery preview → review → actual submission.
  Home removed that action and selected the remaining Overview request correctly.
- Overview Home CTA opened its existing requested-photo workflow. The remaining
  immutable upload used the actual submitRequestedPhoto service with a generated
  disposable JPEG; the slow Gallery bridge was not repeated.
- Written Home CTA opened the existing form. Exact leading/trailing whitespace
  and multiline response persisted and were visible in PM detail.
- All three typed requests passed Requested → Submitted → Resolved. Case status
  stayed under_review during each request lifecycle. Home action section disappeared
  at submission and remained absent after resolution.
- The first disposable case progressed through the unchanged allowed PM actions
  to Completed. Home, Cases and Case Detail agreed. Its latest update was
  2026-10-14T13:08:18.403258Z (15 October, 12:08 AM in Sydney), matching Home.
  Recent selection changed to that case; navigation opened its correct detail.
- A controlled real-Home harness dispatched focus events and delayed HTTP reads.
  Authoritative revalidation succeeded without a page refresh; maximum concurrent
  Data API reads remained one. Normal live Home also updated through existing polling.
  Instrumentation was temporary, never part of production source.
- Two anonymous session clients denied cross-session case reads and both photo /
  written submissions. A fresh unrelated session could not download private test
  evidence or generate signed access; the PM could freshly download it.
  A role-scoped live read returned zero foreign cases/requests/evidence and three
  visible shared seeds. A foreign direct case URL recovered to Cases.
- Existing PM Auth remained authorized. Dashboard and detail showed each persisted
  session's correct fictional tenant, exact response text and authoritative property.
- At 375×667 and 390×844, controlled pending-action Home layouts, live Profile and
  report confirmation were checked for readable wrapping, reachable controls,
  duplicate-card handling, bottom navigation/support placement and horizontal overflow.
  A longer case title/instruction wrapped within the card. Profile values use
  anywhere wrapping for generated names/email. PM checks passed at 1440px.
- Normal renter/PM consoles were clean. Expected denials occurred only in the
  disposable security runner. No AI provider evaluation was performed.
- TypeScript and production build PASS. Nine focused/existing tests PASS:
  homeIdentity.test.ts (four tests), informationRequests.test.ts (three) and
  pmAnnotations.test.mjs (two). No dependencies changed.

## PM display-name deployment review — NOT applied

Prepared script: supabase/maintenance/batch_2_pm_display_name.sql.
Target project: FixLens, ycnilqoqtgjmptxzuhty.
Target profile: 10000000-0000-4000-8000-000000000002.
Existing linked Auth user: 1c727326-27cd-4012-9201-c585817c9a7d.

The transaction locks and checks that exact existing profile, role, agency, Auth
link and expected old/new name. It updates only name from Sarah Chen to Brad Lai.
Repeating after success makes no further update; unexpected state aborts.
The profiles table has no user-defined update trigger in the inspected live state.

No credentials, Auth ID, profile ID, role, permissions, policies, case assignment,
renter/property row or historical activity row changes. Existing created_by and
requested_by references remain the same IDs. Stored timeline text is not rewritten;
future joins to the PM profile naturally show its current display name.

Current branch reads this name dynamically in PM header/greeting, handler/assignee,
renter Profile, report confirmation and renter case handler. Reload those pages
after an approved update (the PM header reads its profile at authorization/mount).
The approved live update now displays Brad Lai. An older deployed frontend can retain hardcoded renter labels until
the reviewed Batch 2 frontend is released; this is a display rollout consideration,
not a change to authentication or RPC contracts.

Owner approval received and the exact guarded script applied on 15 October 2026.
One existing PM profile changed, and only its name changed. Before/after content
digests match for cases, activities, requests, evidence, properties and Storage;
all row counts remain unchanged (12 cases, 60 activities, 8 requests, 22 evidence,
22 objects, 2 profiles, 1 property; zero Storage orphans). The other renter profile
is unchanged. PM fields excluding name, Auth user digest (excluding routine sign-in
timestamps), policies and table grants also match. A repeat has zero eligible rows.
Refreshed local PM Dashboard/header, Case Detail handler, renter Profile and report
confirmation show Brad Lai / Apex Rentals. Existing PM session and protected workflow
access work; /pm/login redirects the authenticated session to Dashboard. No workflow
writes were made. Console warning/error checks were empty. A fresh password sign-in
was not repeated; final Preview/device verification remains pending. No frontend
deployment, commit or additional SQL/migration was performed.
Do not run an indiscriminate migration push: Batch 1.1 is already recorded remotely
as 20261014093153, while its local filename is 20261014081934_information_request_types.sql.

## Disposable data and cleanup

Disposable case IDs, verified by session and exact description as well as ID:

- 75d86ecf-bc97-4b4e-91de-cb535521c123
- 10cdb99a-b1d4-4b87-81fb-ed629a495458
- 827b58c1-d9c4-4dd2-aa9d-619d2b335bd9

Cleanup is limited to these three cases, three requests (one written response),
19 activities, two evidence rows and two uploaded objects. Evidence rows are
detached first, files deleted through the Storage API while ownership remains,
and cases deleted last with their cascading requests/activities.

| Records | Pre-test baseline | Before cleanup | After cleanup |
| --- | ---: | ---: | ---: |
| profiles | 2 | 2 | 2 |
| properties | 1 | 1 | 1 |
| cases | 12 | 15 | 12 |
| evidence_requests | 8 | 11 | 8 |
| evidence | 22 | 24 | 22 |
| case_updates | 60 | 79 | 60 |
| Storage objects | 22 | 24 | 22 |

Cleanup PASS: all seven table/catalog content hashes exactly match the saved
pre-test baseline, including profiles and properties. Counts match the final
column above; zero orphan Storage objects remain. Both original browser sessions
were restored, test manifests removed, and temporary verification tabs closed.
The .tmp-batch2 directory (HTML, SVG and instrumentation) was removed. No Batch 2
screenshots were retained. Permanent tests and source files remain.
The feature diff has no staged secrets; .env.local remains ignored and unstaged.

## Files and scope

Created:
- src/utils/demoPersona.ts
- src/data/homeCases.ts
- src/data/caseIdentity.ts
- src/services/demoProperty.ts
- tests/homeIdentity.test.ts
- supabase/maintenance/batch_2_pm_display_name.sql
- docs/HOME_IDENTITY_VERIFICATION.md

Modified:
- src/App.tsx
- src/data/evidenceRequestPresentation.ts
- src/features/report/ReportWorkflow.tsx
- src/screens/renter/HomeScreen.tsx
- src/screens/renter/ProfileScreen.tsx
- src/screens/renter/CasesScreen.tsx
- src/screens/renter/SupportChatScreen.tsx (PM contact reference only)
- src/screens/renter/cases/BedroomCaseDetailScreen.tsx
- src/screens/renter/cases/KitchenCaseDetailScreen.tsx
- src/screens/renter/cases/HotWaterCaseDetailScreen.tsx
- src/services/cases.ts
- src/services/inbox.ts
- src/services/pm.ts
- src/types/case.ts
- README.md
- docs/ARCHITECTURE.md

No changes to migrations, RLS/Auth, PM workflow RPCs, AI, camera/Vision,
annotations, video, Final Review editing, danger flow, global colors or floating
button design. No second response workflow or global state library.

Physical iPhone Safari Preview verification remains a manual release check.
Suggested commit: Make Home authoritative and unify session demo identities.
Next action: review and explicitly approve only the prepared PM name-update script.

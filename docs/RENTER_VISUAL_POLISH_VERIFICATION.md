# Batch 5A — Renter visual polish, first iteration

Prepared on `polish/batch-5a-renter-visual` from approved main `8410149`.
Origin was fetched and matched local main before implementation. No commit, push,
merge or deployment was performed. No dependencies were added.

## Visual system and scope

Existing semantic tokens are overridden only inside `.renter-visual`, applied to
Home, Cases, Case Detail (including loading/error) and Profile. Global `index.css`
and the existing desktop PhoneShell remain unchanged. The shared renter NavBar
also updates Inbox navigation; Inbox content and Support Chat are not restyled.

| Token | Value |
| --- | --- |
| Canvas / card | #FAFBFC / #FFFFFF |
| Border / subtle divider | #E7EAF0 / #F0F2F5 |
| Text / secondary / decorative muted | #111827 / #6B7280 / #9CA3AF |
| Blue / hover / subtle blue | #2563EB / #1D4ED8 / #EFF6FF |
| Ordinary request border | #F2D59B |
| Success text | #15803D |
| Card / small action radius | 18px / 12px |

Existing amber labels/surfaces and red danger treatment remain distinct. Primary
Home action keeps a restrained shadow; other cards use borders. Page gutters are
20px, content separation 24px and card gaps 12px. Existing Instrument Sans and
Inter fonts are retained. Case-detail body text is 14px; section labels are 12px;
metadata uses readable secondary grey rather than decorative muted grey.

Lightweight shared classes cover cards, sections, headers, metadata, status badges
and scroll areas. No new component library or data-layer refactor was introduced.

## Page decisions

- Home: aligned branding/header gutters, clearer welcome/action spacing, dominant
  solid blue Report action, quieter matching secondary actions and white bordered
  Recent/Action cards. Ordinary action badges/borders use amber; response CTAs
  remain blue with separate Case Detail targets. Selection, timestamps, combined
  Recent/Action behavior and multiple-case handling are unchanged.
- Cases: Active and History share card treatment, title weight and metadata;
  History cards now have the same 12px separation. Long titles wrap. Existing
  ordering, filtering and live reads are unchanged.
- Case Detail: consistent surfaces/sections, larger body text, readable activity
  and progress metadata, amber request instructions and clear blue response CTA.
  Completed cards no longer fade their entire contents. Safety remains red with
  its zero-photo explanation. Evidence containment/annotations are unchanged.
- Profile: restrained identity card, consistent information groups and readable
  labels. Existing persona/contact helpers and authoritative property/Brad Lai ·
  Apex Rentals data remain untouched. No invented phone number or contact fallback.
- Navigation: same four destinations/callbacks and active logic; 22px icons, 11px
  labels, 48px targets, readable inactive grey, `aria-current`, focus rings and
  safe-area-aware height (64px at zero inset).
- Support: the existing `/support` utility sits in a reserved header area on
  Cases, Case Detail and Profile. This removes its overlap with scrolling actions
  without an arbitrary bottom offset or a permanent extra footer. Header text has
  a matching reserved trailing column. Home hides the duplicate floating entry
  because Other questions is always present and reaches the same destination.
  Inbox retains its existing floating placement. Vercel overlays are untouched.

## Verification

- TypeScript: PASS. Production build: PASS. Existing focused tests: 49/49 PASS
  (Home/persona/contact/request eligibility, report/safety rendering, evidence
  metadata, historical PM/renter annotations, camera lifecycle and Vision guard).
- Browser: actual Home/Cases/Inbox/Profile navigation, live seeded Cases/Case
  Detail, authoritative Profile identity/property/PM name, report entry and both
  support entry points passed. Case Detail → Submitted Report → Back returned to
  the same case. Report and Submitted Report have no `.renter-visual` ancestor;
  loaded PM login also remains outside the scope. Normal console: no warnings/errors.
- Isolated temporary fixtures: photo and written response callbacks retain case
  and request IDs; card target remains distinct from response target. Requested
  states remain actionable; Submitted/Resolved are not. Multiple actionable cases,
  combined Recent/Action, empty Cases, submitted/resolved written information,
  completed treatment and safety zero-photo explanations were checked. No fixture
  data was persisted and no database/Storage writes were necessary.
- Responsive: Home, Cases, Case Detail and Profile checked at 375×667, 390×844,
  768×1024, 1024×768 and 1440×900 (20 combinations), including long titles and
  a long persona-name fixture. No horizontal overflow or title/support overlap.
  Desktop retains the existing 390px renter shell. Controls meet practical 44px
  height; navigation is 48px, utility 48px and small footer controls 44×44.
- Keyboard Tab produced visible 2px focus rings. Profile footer actions scroll
  above navigation. Representative text contrast ratios: secondary/white 4.83:1,
  secondary/canvas 4.67:1, white/blue CTA 5.17:1, amber label/surface 6.84:1 and
  success/white 5.02:1. Status always includes text, not colour alone.
- No service/model/status/eligibility/Auth/RLS changes. Camera, annotation files,
  AI, report submission and PM implementation are absent from the diff.

Before/after screenshots are outside the repository in the task visualization
folder, using `batch5a-before-*` and `batch5a-after-*` names: Home (with/without
Action Required), Cases (Active/History), Case Detail and Profile. Additional
`batch5a-375-*` images record narrow long-content layouts. Action screenshots use
matching disposable local fixture content, not modified seeded records.

## Limits and deferred work

This is desktop-browser responsive verification, not physical iPhone Safari or
screen-reader certification. Hardware safe areas, increased system text size and
final Preview appearance should receive manual acceptance. Authenticated PM case
visibility, live response uploads and server isolation tests were not repeated:
those services/policies are unchanged. Existing prototype data and non-functional
Profile placeholder actions are intentionally retained.

Batch 5B: Report Chat, Camera, Annotation Editor/direct text/draw, safety branch,
Final Review and PM Portal visual work. None started here. Inbox/Support content
also retains its existing presentation.

## Files and cleanup

Created: `src/styles/renterVisual.css`, this document.
Modified: `src/App.tsx`; `src/screens/renter/HomeScreen.tsx`, `CasesScreen.tsx`,
`ProfileScreen.tsx`, and the three `cases/*CaseDetailScreen.tsx` files;
`src/components/navigation/NavBar.tsx`, `FloatingChatBtn.tsx`;
`src/components/common/ScreenHeader.tsx`, `SectionLabel.tsx`;
`src/components/case/StatusPill.tsx`, `CaseActivity.tsx`, `ProgressTracker.tsx`,
`RequestedEvidenceGallery.tsx`.

Temporary fixture sources/HTML were removed. `.env.local` remains ignored and
unstaged. No secrets, diagnostics, permanent fake data or backend changes were
introduced. Git diff/check reviewed; no changes are staged.

Git note: Windows' existing local `Polish` reflog file conflicts with the requested
`polish/...` reflog directory. The requested branch was created using a per-command
`core.logAllRefUpdates=false` override, preserving the old branch/reflog and leaving
Git configuration unchanged. A later manual commit on this machine may need the
same override until that local naming collision is resolved.

Recommended commit: `style: unify renter app visual presentation`.
Next manual action: review the diff and screenshots, then manually publish an
approved Preview and check it on iPhone Safari. If committing before Preview, use
`git -c core.logAllRefUpdates=false commit` with the reviewed message, or resolve
the legacy local reflog naming collision first. No automatic commit/deploy.

BATCH 5A — FIRST VISUAL ITERATION READY FOR REVIEW

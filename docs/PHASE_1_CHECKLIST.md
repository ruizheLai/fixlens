# Phase 1 behaviour baseline

Batch A preserves the current prototype, including its limitations. Check at the
same viewport before/after; keep the fixed 390 × 844 renter shell and current fonts.

## Regression checklist

- [x] Home: unchanged wordmark, greeting, bell → Inbox, Report an issue, My cases,
  Other questions, recent bedroom case, and floating support button.
- [x] Bottom navigation: Home / Cases / Inbox / Profile open the same screens and
  retain their active-tab styling. Inbox notifications open the corresponding case.
- [x] Report: Confirm enables description entry; empty text does not advance;
  Enter/send displays the typed description and the scripted bedroom-leak summary.
- [x] Looks right → safety: No, safe to continue → capture introduction;
  Yes, there may be danger → escalation card; Go back → safety choices.
- [x] Start guided capture → overview. The reporting conversation remains mounted
  but hidden during capture; closing capture restores it without repeating confirmation.
- [x] Overview and close-up: guidance/ready timing, help/dismiss, shutter → preview,
  Retake → corresponding capture, Use photo → next step.
- [x] Preview: Circle / Arrow / Text / Draw select and deselect; overview annotation
  tip, fixed overlays, and existing undo/redo placeholders remain unchanged.
- [x] Video: recording timer runs and automatically opens preview after four seconds;
  Retake → video capture; Use video → evidence-completed reporting view.
- [x] Final Review: Review report expands the existing fields/evidence; Submit report
  → success; View case → existing bedroom case; Back to home → Home.
- [x] Cases: bedroom awaiting approval, kitchen action required, quieter completed
  hot-water case; detail content and progress retain their hierarchy.
- [x] Activity: bedroom View full activity / Hide activity and hot-water View previous
  activity / Hide previous activity work.
- [x] Submitted Report: read-only fields, evidence rows expand/collapse, no editable
  final-review controls; back returns to the originating bedroom/hot-water case.
- [x] Kitchen: Add requested evidence → close-up → preview; Retake works; Use photo
  → kitchen evidence-submitted state and added activity; state survives page navigation.
- [x] Support: Other questions and floating button open Support; chips and nonempty
  free text append scripted responses; empty input does nothing. Exit and reopen resets
  messages and restores chips.
- [x] Explicit back destinations: reporting/support → Home; case details → Cases;
  main capture close → reporting; kitchen capture close → kitchen; submitted report →
  originating case. Refresh resets in-memory prototype state.
- [x] TypeScript, production build, browser console, and before/after UI comparison pass.

## Known limitations — preserve in Batch A

- Reporting and Profile show conflicting renter contact/property fixtures.
- Typed description does not drive the hardcoded issue summary or final report.
- Submission opens an existing case; no new case is created.
- Submitted Report always shows the bedroom fixture, even when opened from hot water.
- Kitchen evidence is one boolean; detail changes while Cases/Inbox stay unchanged.
- UI status badges and progress indices are inconsistent representations; action-required
  presentation is not a primary case lifecycle status.
- Evidence uses fixed external image URLs; camera readiness and video are simulated.
  Annotation selection changes tool styling, not stored geometry; video does not play.
- Edit/Replace, microphone, gallery/flash, undo/redo, and Profile controls include inert
  placeholders. Support replies are scripted and do not actually notify a PM.
- Existing timer cleanup limitations (including video completion after leaving capture)
  are deferred; Batch A does not change timers or workflow ownership.

## Verification record

Verified 10 September 2026 against the original prototype served alongside Batch A.
- TypeScript (`tsc --noEmit`) and production build (`npm run build`) passed.
- Browser walkthrough covered the checklist, both safety branches, retakes, submission,
  all case variants, additional evidence, support reset, and back destinations.
- Compared DOM and viewport screenshots before/after; settled screens matched.
  Timer/transition captures were compared after settling; no behaviour differences found.
- Both browser consoles had no warnings or errors. Capture/workflow function parity
  was also checked; existing placeholder controls and timer logic remain unchanged.
- App.tsx: 1,955 → 1,714 lines. Brand assets, CSS, and dependencies unchanged.

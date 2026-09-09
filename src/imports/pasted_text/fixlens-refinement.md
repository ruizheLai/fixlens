Refine the existing FixLens prototype as a final completion and consistency pass.

IMPORTANT:
- Preserve the current overall visual style, colours, typography, component language, HMW1 reporting flow and HMW2 case-status flow.
- Do not redesign the prototype from scratch.
- Do not change the current post-submission case status logic.
- Do not add new major product features.
- This iteration should mainly complete navigation, top-level page styling, Profile, Submitted Report, and the Chat entry pattern.

--------------------------------------------------
1. CHANGE BOTTOM NAVIGATION TO 4 TABS
--------------------------------------------------

Remove Chat from the bottom navigation.

The bottom navigation should now contain only:

- Home
- Cases
- Inbox
- Profile

Keep the same visual style and spacing as the current navigation.

Make all four destinations functional:
- Home → Home
- Cases → My Cases
- Inbox → Inbox
- Profile → Profile

Do not leave any dead navigation items.

--------------------------------------------------
2. MAKE CHAT A FLOATING ENTRY
--------------------------------------------------

Replace the previous Chat bottom-navigation item with a floating Chat / Help button.

Use a compact circular floating action button with a chat-bubble or assistant icon.

Placement:
- bottom-right
- around 16–20 px from the right edge
- positioned above the bottom navigation
- approximately 48–56 px diameter

Do not make it visually larger than the primary Report Issue action.

The floating Chat button should open the existing General Support Chat, NOT the Report Issue flow.

General Support Chat starts with:

“What can I help you with today?”

Quick question examples:
- What counts as urgent?
- How long might maintenance take?
- Why do I need to upload photos?
- How do I contact my property manager?

The user should also be able to type their own question.

“Other questions” from the Home screen should open the same General Support Chat.

IMPORTANT:
The floating Chat button should appear only where appropriate.

Show it on top-level browsing screens such as:
- Home
- My Cases
- Inbox
- Profile

It may also appear on Case Detail if it does not compete with important actions.

Hide it on:
- Report Issue chat
- General Support Chat itself
- AR capture
- photo/video preview
- annotation screens
- final report review
- report submission success
- Submitted Report

Do not let it overlap the bottom navigation or important primary CTAs.

--------------------------------------------------
3. TOP-LEVEL PAGE HEADER STYLE
--------------------------------------------------

Refine the top-level pages so the status bar and title area use one continuous white background.

Use this hierarchy:

- iOS status bar on white
- page title area directly below on the same white background
- no separate boxed navigation strip
- no unnecessary divider directly below the title
- left-aligned page title
- comfortable horizontal and vertical padding
- then transition naturally into the main neutral page content background

The top area should feel like one clean white header region rather than two stacked bars.

Do not remove the page title.

keep navigation-style headers with a back button where appropriate.

--------------------------------------------------
4. CREATE PROFILE SCREEN
--------------------------------------------------

Make the Profile tab fully functional.

Create a lightweight renter Profile screen consistent with the existing FixLens design.

Suggested content:

Profile

Brad Lai

MY DETAILS
- Name
- Email
- Phone

RENTAL PROPERTY
- Property address
- Property manager
  Sarah Chen · Apex Rentals

PREFERENCES
- Notifications

SUPPORT
- Help & FAQs
- Contact property manager

Optional footer links:
- Privacy
- Terms

Keep this screen simple and visually consistent with the rest of FixLens.

Do not add:
- payments
- tenancy document management
- password/security settings
- billing
- unrelated account-management features

This page only needs to feel complete enough for the bottom navigation destination.

--------------------------------------------------
5. CREATE “VIEW SUBMITTED REPORT”
--------------------------------------------------

Make every existing “View submitted report” action functional.

Create a reusable read-only Submitted Report screen.

For the Bedroom Window Leak example, show:

Submitted Report

Issue type
Water leak

Location
Bedroom window

Condition
When it rains

Brief description
Water is leaking from the top of the bedroom window and dripping down the wall.

Safety
No immediate danger reported

Evidence
- Overview photo
- Close-up photo with annotation
- Short video

The Submitted Report represents the exact report that was already submitted.

Important:
- It must be read-only.
- Do not show Edit.
- Do not show Replace.
- Do not show Submit.
- Do not route back to the editable Final Review screen.

Tapping an evidence item can open a larger evidence preview.

Use a back button returning to the relevant Case Detail.

Reuse the same submitted-report layout for other cases with their corresponding case information.

--------------------------------------------------
6. UPDATE CASE DETAIL COPY
--------------------------------------------------

Wherever the property manager is shown, use:

Handled by
Property manager
Sarah Chen · Apex Rentals

Keep the current case-status structure unchanged.

Do NOT change:
- Submitted
- Under review
- Awaiting approval
- Arranging repair
- Repair scheduled
- Completed

Do not change the current post-submission demo status.

--------------------------------------------------
7. KEEP COMPLETED CASE LIGHTWEIGHT
--------------------------------------------------

Preserve the current lighter completed-case treatment.

Completed Case should:
- not show the full main progress tracker unless absolutely necessary
- show “Repair completed” as the visible latest activity
- keep earlier activity collapsed under something like:
  “View previous activity”
- feel quieter than an active case

Do not expand the completed case again.

--------------------------------------------------
8. ROUTING CONSISTENCY
--------------------------------------------------

Ensure these routes work:

Home:
- Report an issue → Report Issue flow
- My Cases → My Cases
- Other questions → General Support Chat
- Recent Case → relevant Case Detail

Bottom navigation:
- Home → Home
- Cases → My Cases
- Inbox → Inbox
- Profile → Profile

Floating Chat:
- → General Support Chat

Case Detail:
- View submitted report → Submitted Report
- Back → previous Cases / Home context where appropriate

Submitted Report:
- Back → relevant Case Detail

Report submission success:
- Keep the current post-submission status logic unchanged
- View case should still open the relevant submitted case rather than returning to Home

--------------------------------------------------
9. GENERAL SUPPORT CHAT
--------------------------------------------------

General Support Chat is a separate support experience from Report Issue.

Do not mix:
- maintenance reporting conversation
and
- general questions chat

The General Support Chat should feel lightweight and helpful.

It can include:
“What can I help you with today?”

Quick questions:
- What counts as urgent?
- How long might maintenance take?
- Why do I need to upload photos?
- How do I contact my property manager?

Allow free text input.

The General Support Chat does not need its own bottom-navigation tab anymore.

--------------------------------------------------
10. PRESERVE EXISTING CAPTURE AND REVIEW WORK
--------------------------------------------------

Do not redesign the current:
- AR guided capture
- photo annotation
- video capture
- final report review

Keep the recent capture refinements unless a change is required for navigation consistency.

Do not reintroduce previous layout issues.

--------------------------------------------------
11. FINAL CONSISTENCY CHECK
--------------------------------------------------

Perform a final consistency pass across the prototype:

- consistent page-title spacing
- consistent white top-level header treatment
- consistent bottom navigation
- no dead buttons
- no dead Profile route
- no dead “View submitted report” buttons
- no Chat item remaining in bottom navigation
- floating Chat does not overlap important actions
- active/inactive navigation states are correct
- top-level screens feel visually related
- detail screens remain clearly distinct from top-level destinations

Do not introduce new major features.

This should be a final completion and consistency pass, not a redesign.
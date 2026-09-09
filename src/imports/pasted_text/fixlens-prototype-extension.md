Extend the existing FixLens prototype to support the second design challenge:

“How might we help renters understand the status, responsibility, and next steps of their maintenance case after submission?”

IMPORTANT:
- Build on the EXISTING FixLens prototype.
- Preserve the current visual language, typography, spacing, colours, card styles and bottom navigation.
- Do not rebuild the existing reporting flow.
- Do not redesign FixLens into a full property-management platform.
- This iteration should focus on the RENTER experience after a maintenance report has been submitted.
- Keep the experience lightweight, calm, clear and trustworthy.

CORE INFORMATION PRINCIPLE

For every active maintenance case, help the renter quickly answer four questions:

1. What is happening now?
2. Who is currently handling the case?
3. What happens next?
4. Do I need to do anything?

These should be more important than showing every internal administrative step.

--------------------------------------------------
1. UPDATE HOME PAGE INTERACTIONS
--------------------------------------------------

Keep the existing Home screen.

Make the following items interactive:

- “My Cases” → opens the My Cases screen.
- Recent Case card → opens that Case Detail screen.
- Inbox tab → opens Inbox.
- Cases tab → opens My Cases.

For the recent case, use:

Bedroom window leak
Status: Awaiting landlord approval
Updated 2 hours ago

Show the status clearly, but keep the Home card compact.

--------------------------------------------------
2. MY CASES SCREEN
--------------------------------------------------

Create a “My Cases” screen using the existing FixLens mobile visual style.

Header:
My Cases

Organise cases into two sections:

ACTIVE

Case 1:
Bedroom window leak
Bedroom
Awaiting landlord approval
Updated 2h ago
No action required

Case 2:
Kitchen tap leak
Kitchen
More information needed
Action required

Use compact cards.

Each active case card should show:
- issue title
- location
- current status
- latest update time
- action-required indicator only when relevant

Do not overload cards with the full timeline.

HISTORY

Example:
Hot water issue
Completed
12 Aug

Past cases can use visually quieter cards.

Tapping a case opens Case Detail.

--------------------------------------------------
3. CASE DETAIL — MAIN HMW2 SCREEN
--------------------------------------------------

Create a high-fidelity Case Detail screen for:

Bedroom window leak
Case #FL-1024

The screen should prioritise CURRENT INFORMATION rather than immediately showing a long timeline.

At the top show:

CURRENT STATUS
Awaiting landlord approval

Short explanation:
“Your property manager has reviewed the report and requested approval from the landlord.”

Then clearly show:

HANDLED BY
Property manager

Use wording that makes it clear the renter should continue communicating through the property manager.

Do NOT simply say “With landlord”, because this may incorrectly suggest that the renter needs to contact the landlord directly.

Then show:

YOUR ACTION
No action required

Supporting text:
“We’ll let you know when something changes.”

Then:

WHAT HAPPENS NEXT?
“Once approval is received, your property manager will begin arranging the repair.”

These four pieces of information should be visually prominent and understandable within a few seconds.

--------------------------------------------------
4. CASE PROGRESS
--------------------------------------------------

Below the current-state information, show a simple renter-facing progress tracker.

Use these six main stages:

1. Submitted
2. Under review
3. Awaiting approval
4. Arranging repair
5. Repair scheduled
6. Completed

For this example:

Submitted ✓
Under review ✓
Awaiting approval ● CURRENT
Arranging repair ○
Repair scheduled ○
Completed ○

Do not expose unnecessary internal administrative stages.

Do not use excessive detail such as every phone call, quote request, email, contractor contact or landlord conversation as separate main stages.

--------------------------------------------------
5. LATEST ACTIVITY / CASE HISTORY
--------------------------------------------------

Below the progress tracker, provide a compact “Latest activity” section.

Example:

TODAY

3:20 PM
Approval requested
Your property manager sent the repair request to the landlord.

1:45 PM
Report reviewed
The property manager has enough information to continue.

YESTERDAY

10:30 AM
Report submitted
Your report and evidence were received.

Provide:
“View full activity”

The activity history is secondary to the current status.

The renter should not need to read the entire history to understand what is happening now.

--------------------------------------------------
6. EVIDENCE / REPORT ACCESS
--------------------------------------------------

On Case Detail, include a secondary section such as:

Your report

- Issue summary
- 2 photos
- 1 video
- Safety information

Provide:
“View submitted report”

This should reuse information collected during the existing HMW1 reporting flow.

Do not recreate or edit the report by default.

--------------------------------------------------
7. INBOX
--------------------------------------------------

Create an Inbox screen.

The Inbox represents:
“What changed?”

My Cases represents:
“What is the current state?”

Do not make them duplicates.

Header:
Inbox

Example notifications:

TODAY

Approval requested
Bedroom window leak
“Your property manager is waiting for landlord approval.”
2h ago

Report reviewed
Bedroom window leak
“Your report has been reviewed. No additional information is needed.”
4h ago

YESTERDAY

More information requested
Kitchen tap leak
“One clearer photo is needed.”
Action required

Use clear distinction between:
- informational update
- action required

Tapping a notification should open the relevant Case Detail screen.

--------------------------------------------------
8. ACTION REQUIRED CASE STATE
--------------------------------------------------

Create an alternate Case Detail state for:

Kitchen tap leak

At the top, prioritise:

ACTION REQUIRED

“Your property manager needs one clearer photo showing the area beneath the tap.”

Primary CTA:
Add requested evidence

Then show:

Current status:
More information needed

Handled by:
Property manager

Your action:
Upload one additional photo

What happens next:
“Once the new evidence is submitted, the property manager can continue reviewing the case.”

Do NOT include “More information needed” as a permanent stage in the main six-stage timeline.

Treat it as a temporary exception / action state.

If possible, connect “Add requested evidence” to a lightweight version of the existing guided capture experience.

After evidence is submitted, return to Case Detail and update the case state.

--------------------------------------------------
9. COMPLETED CASE STATE
--------------------------------------------------

Create a completed state for a historical case:

Hot water issue
Completed

Show:

STATUS
Completed

Final update:
“Repair completed on 12 Aug.”

Your action:
No action required

Include:
- completed progress timeline
- report history
- key case activity

Keep this visually quieter than an active case.

--------------------------------------------------
10. NAVIGATION
--------------------------------------------------

Make the bottom navigation functional:

Home
Cases
Chat
Inbox
Profile

For this HMW2 prototype, fully develop:
- Home
- Cases
- Inbox

Chat can continue to use the existing reporting / questions experience.

Profile does not need additional functionality yet.

--------------------------------------------------
DESIGN PRINCIPLES
--------------------------------------------------

1. CURRENT STATE FIRST
The most important information should be what is happening now.

2. ACTION CLARITY
Always make it obvious whether the renter needs to do something.

Prefer:
“No action required”

or:
“Action required — Add one photo”

Avoid vague labels such as:
“Pending”

3. RESPONSIBILITY CLARITY
Separate process status from who is handling the case.

Example:

Status:
Awaiting landlord approval

Handled by:
Property manager

Do not treat these as the same thing.

4. NEXT-STEP VISIBILITY
Explain what is likely to happen next without promising exact timing.

5. SIMPLE RENTER-FACING LANGUAGE
Avoid internal property-management terminology where possible.

6. CASE CONTINUITY
The original report, evidence, updates and follow-up actions should all feel like parts of ONE continuous maintenance case.

7. DO NOT EXPAND THE SCOPE
Do not add:
- contractor marketplace
- payments
- quote comparison
- landlord portal
- contractor portal
- scheduling system
- live chat with every stakeholder
- automatic repair diagnosis
- AI urgency scoring

--------------------------------------------------
PRIMARY PROTOTYPE JOURNEY
--------------------------------------------------

Create this clickable journey:

Home
→ My Cases
→ Bedroom Window Leak
→ Case Detail
→ View progress / latest activity

Also support:

Home
→ Recent Case
→ Case Detail

and:

Home
→ Inbox
→ “Approval requested”
→ Bedroom Window Leak Case Detail

and one secondary branch:

Inbox
→ “More information requested”
→ Kitchen Tap Leak Case Detail
→ Add requested evidence

Keep the experience consistent with the existing FixLens prototype and make it feel like the natural post-submission continuation of the HMW1 reporting journey.
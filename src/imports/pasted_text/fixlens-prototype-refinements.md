Refine the existing FixLens prototype. Preserve the current overall visual style, layout system, colour palette, typography and component language. Do not rebuild the product from scratch.

This iteration focuses on detailed interaction and UI refinements.

IMPORTANT:
- Keep the existing HMW1 and HMW2 structure.
- Do not redesign the information architecture.
- Do not add major new features.
- Only refine the current experience based on the following changes.

--------------------------------------------------
1. FIX ROUTING
--------------------------------------------------

1. Fix “View case” routing after report submission.
After the user submits a report and sees the success screen, “View case” should open the newly created case detail screen for that report, not return to Home.

2. Fix Chat routing from Home.
On the Home screen:
- “Report an issue” should continue to open the reporting flow.
- “Chat” in the bottom navigation should open a separate general support / questions chat.
- “Other questions” should also open this separate support chat.
This support chat should NOT open the reporting conversation.

The general support chat can start with:
“What can I help you with today?”

It can include a few quick question chips such as:
- What counts as urgent?
- How long does maintenance usually take?
- Why do I need to upload photos?
- How do I contact my property manager?

--------------------------------------------------
2. COMPLETED CASE REFINEMENT
--------------------------------------------------

Refine the completed case state to feel lighter and less visually heavy.

For completed cases:
- De-emphasise the progress section.
- If progress is not essential, it can be removed entirely from the completed case screen.
- In the case activity section, show only the key final update by default:
  “Repair completed”
- Older activities should be collapsed under something like:
  “View previous activity”

The completed case should feel quieter and more resolved than active cases.

--------------------------------------------------
3. CASE DETAIL COPY REFINEMENT
--------------------------------------------------

Update the “Handled by” copy to the following format:

Handled by
Property manager
Sarah Chen · Apex Rentals

Use this format wherever the assigned property manager is shown in the case detail screen.

--------------------------------------------------
4. CAPTURE SCREEN REFINEMENT
--------------------------------------------------

Refine the guided capture screens for Overview, Close-up and Video.

Apply these changes consistently across the capture flow unless otherwise noted.

4A. Top title hierarchy
Make the capture type more prominent in the top centre area.
For example:
Overview — 1 of 3
Close-up — 2 of 3
Video — 3 of 3

This should be visually clearer and more central than before.

4B. Temporary guidance tip
When entering each capture screen, show a floating guidance tip above the bottom control area.
It should:
- appear automatically
- stay visible for around 5 seconds
- disappear automatically
- also be dismissible manually with a small close icon

On the right top help (?) button:
- tapping it should show this guidance tip again

For the Overview capture, the guidance tip can say something like:
“Capture an overview of the issue. Try to include the whole window, surrounding wall, and nearby affected area.”

For the Close-up capture, the guidance tip can say something like:
“Move closer and clearly show the affected area.”

For the Video capture, the guidance tip can say something like:
“Record a short video showing the issue and surrounding context.”

4C. Bottom control area
Add two secondary controls on either side of the shutter button:
- left: Gallery / photo library icon
- right: Flash icon

The shutter button remains in the centre.

Apply this to Overview, Close-up and Video capture screens.

--------------------------------------------------
5. POST-CAPTURE IMAGE REVIEW / ANNOTATION SCREEN REFINEMENT
--------------------------------------------------

Refine the image preview screen shown after taking a photo.

Use a full-screen image presentation similar to the capture screen, rather than a smaller image in a framed card.

5A. Top controls
Keep:
- top left: Retake

Change top right to:
- Redo (undo last annotation or last edit)
- Resume (re-enter drawing / annotation mode or continue editing)

Use clear iconography such as two arrow-style actions.

5B. Bottom controls
Keep:
- Use photo

Remove the two existing extra buttons if they are no longer needed.

To the left of “Use photo”, replace the old buttons with a lightweight annotation toolbar including tools such as:
- Text
- Circle
- Arrow
- maybe one simple drawing tool if needed

This annotation area should feel compact and secondary to “Use photo”.

5C. Annotation onboarding tip
When entering the annotation preview for the Overview photo ONLY, show a temporary guidance tip similar to the capture screen:
- appears automatically
- stays around 5 seconds
- dismissible
- can be reopened if relevant

Example copy:
“You can add simple annotations to help explain the issue more clearly.”

This tip should appear only for the Overview annotation screen, not for later Close-up annotation screens.

5D. Close-up preview
Apply the same full-screen image review / annotation layout to the Close-up screen, but without the onboarding tip.

--------------------------------------------------
6. REVIEW REPORT IMPROVEMENT
--------------------------------------------------

Improve the final Review Report experience after capture is completed.

The report review should allow the user to edit or replace existing content more clearly.

For each section in the Review Report, make it obvious that it can be edited.

The user should be able to:
- edit issue type if needed
- edit location
- edit occurs / condition
- edit brief description
- edit safety response if needed
- replace the overview photo
- replace the close-up photo
- replace the video
- edit existing annotation content

Use clear edit affordances such as:
- small “Edit” actions
- replace buttons
- tappable cards
- inline edit affordances

Do not rebuild the review flow; just make the editability of existing content clearer and more functional.

Keep:
“Ready for initial review”
and the primary CTA:
“Submit report”

--------------------------------------------------
7. DESIGN / INTERACTION PRINCIPLES
--------------------------------------------------

Maintain the current FixLens product tone:
- calm
- clear
- supportive
- lightweight
- trustworthy

AR capture should still feel like:
a normal phone camera with lightweight guidance layered on top.

Do not add unnecessary complexity or new product areas.

This iteration is about improving:
- routing clarity
- capture usability
- annotation usability
- report editability
- completed-case visual hierarchy

Preserve the rest of the current prototype unless needed for these refinements.
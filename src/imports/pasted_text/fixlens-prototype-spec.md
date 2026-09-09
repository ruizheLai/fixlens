Create a high-fidelity mobile prototype for “FixLens”, based closely on the attached low-fidelity user journey.

FixLens is a guided rental maintenance reporting companion. Its purpose is to help renters create a minimum sufficient maintenance report with low effort, then later allow them to track the case.

IMPORTANT:
- Preserve the information architecture and user flow shown in the attached low-fidelity prototype.
- Do not redesign the UX from scratch.
- Do not add unnecessary features.
- Do not introduce diagnosis, AI confidence scores, repair recommendations, contractor booking, payments, or complex property-management functionality.
- The experience should feel lightweight, calm, trustworthy and supportive rather than technical or futuristic.
- Mobile-first design for a modern iPhone-sized screen.
- Use a coherent design system and reusable components.

VISUAL DIRECTION:
- Clean contemporary utility/service app
- Calm, trustworthy and approachable
- Generous whitespace
- Clear information hierarchy
- Soft neutral backgrounds with a restrained blue accent
- Rounded cards, but avoid excessive card nesting
- Simple line icons
- Accessible text sizes and contrast
- Avoid an overly playful chatbot aesthetic
- Avoid looking like a generic SaaS dashboard
- AR screens should feel like a normal phone camera with subtle guidance layered on top, not a sci-fi scanner

MAIN FLOW:

1. HOME
Greeting: “Hi, Brad! What can we help you with today?”
Primary actions:
- Report an issue
- My cases
- Other questions

Below this, show one recent case with:
- Issue title
- Current status
- Latest update

Bottom navigation:
Home / Cases / Chat / Inbox / Profile

For this prototype, the primary interaction is “Report an issue”.

2. REPORT CHAT — CONFIRM DETAILS
Open a conversational FixLens Assistant screen.

Assistant:
“Let’s start by confirming your property and contact details.”

Show a structured card containing:
- Name
- Rental property address
- Contact details
- Property manager

Actions:
- Confirm
- Edit

Keep the interaction lightweight and do not make the chatbot dominate the whole visual experience.

3. DESCRIBE ISSUE
Assistant:
“Now describe the issue in your own words. Tell me what’s happening, where it is, and when it occurs if you know.”

Provide a normal chat input supporting text and voice.

Example renter message:
“There is water leaking from the top of my bedroom window when it rains. It started yesterday and keeps dripping down the wall.”

4. ISSUE SUMMARY
The assistant structures the renter’s description without diagnosing the cause.

Show a summary card:

Issue type: Water leak
Location: Bedroom window
Occurs: When it rains
Brief description: Water is leaking from the top of the bedroom window and dripping down the wall.

Provide:
- Edit
- Continue

Do not infer technical causes.

5. SAFETY CHECK
Ask only one lightweight safety question:

“Is there any immediate danger to you or anyone else?”

Options:
- No, safe to continue
- Yes, there may be danger

Small helper text may give examples such as fire, exposed electricity, major flooding or an unsafe area.

If “Yes” is selected, show an urgent safety message advising the renter not to approach the affected area and to contact the property manager / emergency maintenance contact, or emergency services for a life-threatening emergency.

The main prototype path selects “No, safe to continue”.

6. CAPTURE EXPECTATION
Return to the conversational screen.

Assistant:
“Great. Next, I’ll guide you through capturing the evidence.”

Show a compact capture plan:
- 1 overview photo — show the whole area
- 1 close-up photo — show the affected area
- 1 short video — show the issue and surrounding context

Primary button:
“Start guided capture”

Keep this reassuring and lightweight.

7. GUIDED AR OVERVIEW CAPTURE
Transition into a full-screen camera interface.

This should look primarily like a normal camera, with lightweight AR guidance layered on top.

Title:
“Overview — 1 of 3”

Guidance:
“Step back to include the whole window and surrounding wall.”

Use subtle:
- framing guides
- directional cues
- simple live feedback such as “Good framing”

Do NOT create a full room scan or 3D model.

Include:
- shutter button
- close
- help

8. PHOTO PREVIEW + ANNOTATION
After capturing, freeze the image and show a preview.

Actions:
- Retake
- Edit
- Use photo

Edit allows:
- freehand circle
- arrow
- short text annotation
- undo

Example annotation:
circle the leak location and label it “Leak point”.

This preview acts as the review for each captured image, so do not create a separate capture-review page.

9. GUIDED CLOSE-UP CAPTURE
Camera screen:
“Close-up — 2 of 3”

Guidance:
“Move closer and clearly show the affected area.”

Use a lightweight target/frame around the relevant area.

After capture, use the same Retake / Edit / Use photo interaction.

10. VIDEO CAPTURE
Camera screen:
“Video — 3 of 3”

Instruction:
“Record a short video showing the issue and surrounding context.”

Use minimal camera guidance.
Do not overload the video screen with AR.

Allow preview / retake / use video.

11. FINAL REPORT REVIEW
Return to the FixLens Assistant.

Assistant:
“Let’s review your report before you submit.”

Show one structured report summary containing:
- Issue type
- Location
- Brief description
- Safety: No immediate danger reported
- Overview photo thumbnail
- Close-up photo + annotation thumbnail
- Short video thumbnail

Allow individual items to be edited or replaced.

Show:
“Ready for initial review”

Primary CTA:
“Submit report”

Do not use percentages or AI confidence scores.

12. SUCCESS
After submission:
“Report submitted”

Explain briefly:
“Your property manager can now review your report. You can follow future updates in My Cases.”

Actions:
- View case
- Back to home

INTERACTION PRINCIPLES:
- Minimum sufficient evidence, not maximum data collection
- Ask only information relevant to this maintenance issue
- Reduce renter effort and uncertainty
- User remains in control of all submitted information
- AI structures information but does not diagnose the fault
- AR is only a lightweight capture guidance mechanism
- Each screen should have one obvious primary action

Build the screens as one connected interactive prototype.
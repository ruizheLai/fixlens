# FixLens Product Specification

## 1. Product Overview

FixLens is a guided rental maintenance reporting companion.

It supports renters before, during, and after the submission of a maintenance report.

The system helps renters:

- explain an issue without needing technical vocabulary,
- understand what evidence is useful,
- capture decision-relevant visual evidence,
- submit a structured maintenance report,
- see what is happening after submission,
- understand who currently owns the case,
- understand what they need to do next.

FixLens also provides a lightweight property manager interface for reviewing reports and maintaining case continuity.

---

## 2. Research-Informed Problems

### Primary Problem

Renters do not know what decision-relevant evidence is required for different maintenance issues.

This may lead to:

- insufficient photos,
- missing spatial context,
- unnecessary back-and-forth,
- difficulty describing issues,
- uncertainty about what information matters.

### Secondary Problem

Renters lack visibility into the status, responsibility, and next steps of a maintenance case after submission.

Maintenance information may move between multiple people, channels, and systems, making the case feel fragmented.

---

## 3. How Might We Questions

### HMW1

> How might we help renters identify and provide the decision-relevant evidence needed for a maintenance issue?

### HMW2

> How might we help renters understand the status, responsibility, and next steps of their maintenance case after submission?

---

## 4. Product Concept

> A guided maintenance reporting companion that helps renters create a minimum sufficient report, then keeps the case status visible throughout the maintenance process.

FixLens combines three related ideas:

### Evidence Coach

Helps renters understand what information and evidence to provide.

### Decision-Ready Report

Transforms the renter's description and evidence into a structured maintenance report.

### Maintenance Companion

Keeps the maintenance case visible after submission.

These are connected through one continuous maintenance case.

---

## 5. Users

### Renter

Primary user.

Needs to:

- report an issue,
- describe what is happening,
- capture evidence,
- review the report,
- submit,
- track the case,
- respond to additional evidence requests.

### Property Manager

Secondary user.

Needs to:

- review submitted information,
- understand the issue quickly,
- access evidence,
- update case status,
- request more information,
- communicate what happens next.

---

## 6. Renter Information Architecture

Bottom navigation:

- Home
- Cases
- Inbox
- Profile

General Support Chat is accessible through a floating Chat button.

It is not a bottom-navigation tab.

---

## 7. Home

Home contains:

- FixLens wordmark
- notification entry
- greeting
- Report an Issue
- My Cases
- Other Questions
- Recent Case
- floating support Chat button
- bottom navigation

“Report an Issue” is the primary action.

---

## 8. Reporting Flow

### Step 1 — Start

Home  
→ Report an Issue

This opens FixLens Assistant.

### Step 2 — Confirm User and Property Details

Show known renter and property details in a confirmation card.

Allow confirmation or editing.

Do not repeatedly ask for already-known information conversationally.

### Step 3 — Free Description

Prompt:

> Briefly describe what is happening.

This is the main free-text input point in the reporting flow.

The renter should be able to write naturally.

Example:

> Water comes in through the bottom of my bedroom window whenever there is heavy rain and the carpet underneath gets wet.

---

## 9. AI Issue Understanding

The AI analyses the renter's free-text description.

Expected structured information may include:

```json
{
  "inScope": true,
  "issueType": "Water leak",
  "location": "Bedroom window",
  "description": "Water enters through the bottom of the bedroom window during heavy rain and wets the carpet below.",
  "condition": "Occurs during heavy rain",
  "safetyConcern": null
}
```

The exact schema may evolve during implementation.

The user should see a human-readable summary rather than raw structured data.

Example:

### Here's what I understood

**Issue**  
Water leak

**Location**  
Bedroom window

**Description**  
Water enters through the bottom of the bedroom window during heavy rain and wets the carpet below.

The renter should be able to confirm or correct the summary before continuing.

---

## 10. Off-Topic Reporting Input

If the renter enters unrelated content while reporting, FixLens should briefly redirect them.

Example:

> I’m here to help you report maintenance issues in your rental property. Please describe the issue you want to report.

Do not continue unrelated conversation.

---

## 11. Missing Information

Principle:

> Only ask what is still missing.

Avoid fixed questionnaires where possible.

If the initial description already contains sufficient information, continue directly.

If important information is missing, use a small number of short follow-up questions.

Phase 3A uses zero follow-ups when the issue and location are clear. Ask one
essential question at a time and never more than two per interpretation. Optional
detail such as duration or severity must not block the report.

---

## 12. Safety Check

Ask one lightweight safety question:

> Is there any immediate danger to you or anyone else?

Helper examples:

- fire
- exposed electricity
- major flooding
- unsafe area

Options:

- No, safe to continue
- Yes, there may be danger

If danger may exist:

- tell the renter not to approach the hazard,
- recommend appropriate PM or emergency maintenance escalation,
- recommend emergency services when there is an immediate threat to life,
- do not provide technical repair instructions.

---

## 13. Capture Expectation

Before opening the camera, explain what will normally be captured.

Typical flow:

- 1 overview photo
- 1 close-up photo
- 1 short video where useful

Estimated time:

approximately 2–3 minutes.

---

## 14. Adaptive Guided Capture

The live camera uses a lightweight guidance overlay.

The implementation is not intended to perform full spatial scanning or 3D mapping.

A camera frame may be analysed periodically.

Suggested interval:

approximately every 2–5 seconds.

The goal is to visibly demonstrate that guidance changes based on the observed camera condition.

---

## 15. Local Camera Analysis

Simple local analysis may detect:

### Brightness

Possible guidance:

> Try a brighter angle.

### Movement

Possible guidance:

> Hold steady.

### Blur

Possible guidance:

> Hold steady for a clearer image.

These checks do not need AI if local image analysis is sufficient.

---

## 16. Vision Analysis

AI-assisted visual analysis may determine:

- whether the expected target is visible,
- whether useful surrounding context is visible,
- whether framing is too tight,
- whether framing is too loose,
- whether evidence appears useful for the current capture step.

Example internal output:

```json
{
  "targetVisible": true,
  "framing": "too_tight",
  "context": "insufficient",
  "quality": "acceptable"
}
```

Application rules convert this result into user-facing guidance.

Example:

> Move a little further back.

---

## 17. Guidance Rule Engine

Suggested rule priority:

1. Poor lighting
2. Excessive movement or blur
3. Poor framing
4. Issue-specific guidance
5. Good frame

Only one primary guidance message should be visible at a time.

Guidance should remain stable long enough to read.

Avoid rapid state changes.

---

## 18. Capture Types

### Overview

Goal:

Show the relevant fixture or object plus surrounding spatial context.

For a bedroom window leak this may include:

- the whole window,
- surrounding wall,
- nearby floor area where relevant.

Possible guidance:

- Move a little further back
- Include the whole window
- Show some surrounding wall
- Good overview

### Close-Up

Goal:

Show the affected area clearly.

Possible guidance:

- Move closer
- Hold steady
- Keep the affected area in frame
- Good detail

### Video

Goal:

Show movement, leakage, noise, or behaviour that a still image cannot explain.

Possible guidance:

- Pan slowly
- Keep the affected area visible
- Hold steady

Real video upload is lower priority than still-image capture for the exhibition build.

---

## 19. Evidence Archetypes

The exhibition version does not require a complete maintenance evidence ontology.

Initial archetypes may include:

### Water / Leak

Suggested:

- overview
- leak or damage close-up
- optional short video

### Door / Window

Suggested:

- whole fixture
- affected area
- movement video when relevant

### Appliance

Suggested:

- whole appliance
- control panel or visible error state
- optional behaviour video

### Fixture Damage

Suggested:

- spatial overview
- damage close-up

### General Visible Damage

Suggested:

- overview
- close-up

Fallback:

- overview
- close-up
- optional video

---

## 20. Post-Capture Review

After each photo capture, provide:

- Retake
- Undo
- Redo
- annotation tools
- Use Photo

Annotation tools may include:

- Circle
- Arrow
- Text
- Draw

Annotation is optional.

The first relevant capture may display:

> You can add simple annotations to help explain the issue more clearly.

Do not repeat this guidance unnecessarily.

---

## 21. Evidence Review

After guided capture, return to FixLens Assistant.

Suggested transition:

> Great — your evidence has been captured.

Show an evidence-completed card.

Then:

> Your report is ready to review.

CTA:

> Review Report

Do not ask for the original description or safety answer again.

---

## 22. Final Report Review

The renter should be able to review:

- issue type
- location
- condition/context
- description
- safety response
- overview photo
- close-up photo
- short video where applicable
- annotations

Allow editing or replacing evidence before submission.

Use:

> Ready for initial review

Do not use AI confidence or completeness percentages.

---

## 23. Submission

Submitting creates a maintenance case in the backend.

Submission success should provide:

- confirmation
- case ID
- View Case CTA

---

## 24. Case Statuses

Primary lifecycle:

1. Submitted
2. Under review
3. Awaiting approval
4. Arranging repair
5. Repair scheduled
6. Completed

Exceptions:

- More information needed
- Action required

Exceptions should not become permanent timeline stages.

---

## 25. Case Detail

Case Detail prioritizes:

### Current Status

What is happening now?

### Handled By

Who currently owns the case?

Example:

Property manager  
Sarah Chen · Apex Rentals

### Your Action

Examples:

> No action required.

or:

> Additional evidence requested.

### What Happens Next

Explain the expected next step.

### Progress

Show the primary lifecycle.

### Activity

Historical events remain secondary.

### Submitted Report

Allow the renter to open a read-only snapshot of the submitted report.

---

## 26. Submitted Report

The submitted report is read-only.

It may contain:

- issue type
- location
- condition/context
- description
- safety
- overview
- close-up
- video where available
- annotations

Do not show:

- Edit
- Replace
- Submit

The report represents what was submitted at that point in time.

---

## 27. My Cases

Tabs:

- Active
- History

Case cards show:

- issue
- location
- current status
- last updated
- action-required indicator where relevant

---

## 28. Inbox

Cases answer:

> What is the current state?

Inbox answers:

> What changed?

Possible events:

- Report reviewed
- Approval requested
- Repair scheduled
- More evidence requested
- Additional evidence received

---

## 29. Additional Evidence

The PM may request additional evidence.

Example:

> Please provide a closer photo of the lower-left corner of the window frame.

The renter sees:

**Action Required**

CTA:

> Add Requested Evidence

This opens a targeted guided capture flow.

After submission:

- the request becomes Submitted,
- the Case Activity records the new evidence,
- the PM can review it.

---

## 30. Property Manager Portal

The portal is intentionally simple.

### Case List

Show:

- issue
- renter
- property
- date submitted
- current status

### Case Detail

Show:

- structured issue summary
- renter/property context
- description
- safety information
- evidence gallery
- activity
- current status

PM actions:

- Update Status
- Request More Evidence
- Add Renter-Facing Update

Optional:

- Export Structured Report

---

## 31. General Support Chat

Opened through:

- floating Chat button
- Other Questions

Suggested opening:

> What can I help you with today?

Example prompts:

- What counts as urgent?
- How long might maintenance take?
- Why do I need to upload photos?
- How do I contact my property manager?

Users may also type freely.

---

## 32. Support Chat Domain

Allowed topics:

- reporting process
- FixLens usage
- evidence explanation
- case status
- evidence requests
- what happens after submission
- general maintenance-reporting workflow

Not supported:

- unrelated general knowledge
- legal advice
- professional diagnosis
- DIY repair instructions
- guaranteed timelines
- guaranteed prices

Off-topic questions should receive a brief redirect.

---

## 33. Profile

Keep Profile lightweight.

### My Details

- Name
- Email
- Phone

### Rental Property

- address
- property manager

### Preferences

- Notifications

### Support

- Help & FAQs
- Contact Property Manager

Optional:

- Privacy
- Terms

Do not expand Profile into a general tenancy management system.

---

## 34. Completed Cases

Completed cases should be visually quieter than active cases.

Show:

- Completed status
- Repair completed activity

Previous activity may be collapsed under:

> View Previous Activity

---

## 35. Product Boundary

FixLens assists reporting, evidence collection, and communication.

It does not claim to:

- diagnose maintenance issues,
- determine technical repair solutions,
- guarantee faster repairs,
- decide legal responsibility,
- guarantee urgency classifications,
- replace professional assessment.

# FixLens Development Instructions

## Project

FixLens is a guided rental maintenance reporting companion.

It helps renters:

1. describe a maintenance issue in their own words,
2. provide decision-relevant evidence through guided capture,
3. submit a structured maintenance report,
4. understand the current status, responsibility, and next steps after submission.

FixLens also includes a lightweight property manager portal for receiving reports, reviewing evidence, updating case status, and requesting additional information.

The current objective is to build an exhibition-ready functional vertical slice, not a production-ready commercial property-management platform.

---

## Core Product Concept

FixLens addresses two primary problems:

1. Renters do not know what decision-relevant evidence is required for different maintenance issues.
2. Renters lack visibility into the status, responsibility, and next steps of a maintenance case after submission.

Core concept:

> A guided maintenance reporting companion that helps renters create a minimum sufficient report, then keeps the case status visible throughout the maintenance process.

---

## Current Stack

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS

Planned:

- lightweight backend and database
- evidence/file storage
- AI text analysis
- AI-assisted visual analysis
- lightweight property manager web portal

Supabase is the preferred backend direction unless intentionally changed later.

The AI provider should remain replaceable where practical.

---

## Development Goal

Build a real end-to-end exhibition demo.

The preferred vertical slice is:

Renter describes an issue  
→ AI understands and structures the issue  
→ renter captures guided evidence  
→ report is submitted  
→ property manager receives it  
→ property manager updates the case or requests more evidence  
→ renter sees the update and responds.

The goal is depth rather than breadth.

Do not attempt to implement every possible rental-maintenance workflow.

---

## Preserve the Existing UX

The current high-fidelity FixLens prototype is the visual and interaction baseline.

Do not redesign established screens or flows unless explicitly requested.

Preserve:

- information architecture
- bottom navigation
- reporting flow
- capture sequence
- case tracking model
- status model
- branding
- visual hierarchy

Visual direction:

- minimal
- calm
- trustworthy
- modern
- professional
- quietly polished

Avoid:

- excessive gradients
- glassmorphism
- heavy shadows
- unnecessary decorative effects
- excessive animation
- generic SaaS dashboard styling
- large visual redesigns without explicit approval

---

## Main Renter Navigation

Bottom navigation:

- Home
- Cases
- Inbox
- Profile

Chat is not a bottom-navigation item.

General Support Chat is opened through:

- the floating Chat button
- “Other Questions” on Home

---

## Main Reporting Flow

Home  
→ Report an Issue  
→ FixLens Assistant  
→ Confirm renter/property details  
→ User describes issue  
→ AI structures issue  
→ Safety check  
→ Capture expectation  
→ Guided evidence capture  
→ Evidence review  
→ Final report review  
→ Submit  
→ Submission success  
→ Case Detail

Principle:

> Only ask what is still missing.

Do not ask users to repeat information already provided in their initial description.

---

## AI Reporting Assistant

The reporting assistant uses real AI, but its role is deliberately narrow.

The main free-text input point in the reporting flow is when the renter is asked to briefly describe the issue.

AI responsibilities:

- determine whether the input is related to rental maintenance
- identify the issue type
- identify the location
- produce a concise structured description
- extract useful contextual information
- detect a possible safety concern
- identify important missing information when necessary
- redirect off-topic input back to maintenance reporting

Prefer structured model output over uncontrolled free-form text.

Example internal output:

```json
{
  "inScope": true,
  "issueType": "Water leak",
  "location": "Bedroom window",
  "description": "Water enters through the lower bedroom window frame during heavy rain and wets the carpet below.",
  "condition": "Occurs during heavy rain",
  "safetyConcern": null
}
```

The user should see a human-readable summary, not the raw JSON.

AI should support the application flow rather than control it.

---

## Reporting Assistant Boundaries

If the renter enters unrelated content during reporting, briefly redirect them.

Example:

> I’m here to help you report maintenance issues in your rental property. Please describe the issue you want to report.

Do not allow the reporting flow to become a general-purpose chatbot.

---

## General Support Chat

General Support Chat may accept free-text input.

It may answer questions related to:

- FixLens
- reporting maintenance issues
- evidence requirements
- case status
- additional evidence requests
- what happens after submission
- how the maintenance reporting process works

It must not behave as a general-purpose assistant.

Off-topic requests should receive a short redirect.

Do not provide:

- legal conclusions or legal advice
- professional technical diagnosis
- dangerous DIY repair instructions
- guaranteed repair timelines
- guaranteed prices or cost estimates
- unsupported claims about responsibility

For dangerous situations, prioritize safe escalation rather than repair advice.

---

## Safety

The normal reporting flow uses one lightweight safety question:

> Is there any immediate danger to you or anyone else?

Examples may include:

- fire
- exposed electricity
- major flooding
- unsafe areas

If immediate danger may exist:

- advise the user not to approach or interact with the hazard,
- recommend appropriate property-management or emergency escalation,
- recommend emergency services when there is an immediate threat to life,
- do not provide technical repair instructions.

---

## Adaptive Guided Capture

Preferred terminology:

- adaptive guided capture
- AI-assisted visual guidance
- AR-style camera overlay

Do not describe the implementation as full spatial AR unless genuine spatial tracking is later implemented.

Typical evidence sequence:

1. Overview photo
2. Close-up photo
3. Short video when relevant

The exhibition build does not require continuous computer vision.

A camera frame may be analysed approximately every 2–5 seconds.

---

## Local Camera Analysis

Use simple local analysis where practical for:

- brightness
- camera movement
- blur/sharpness
- stability

Example guidance:

- Try a brighter angle
- Hold steady
- Hold steady for a clearer image

These checks do not need AI if a simple local implementation is sufficient.

---

## Vision Analysis

Occasional vision analysis may determine:

- whether the expected subject is visible
- whether enough surrounding context is visible
- whether framing is too tight or too loose
- whether the image appears useful for the current evidence step

Example outputs:

- Move a little further back
- Include the whole window
- Move closer to the affected area
- Good frame

Physical distance estimation is not required.

Target size and framing within the image may be used as a practical proxy for distance.

---

## Capture Guidance Rule Priority

Keep the rule engine small and predictable.

Suggested priority:

1. Poor lighting
2. Excessive movement or blur
3. Poor framing
4. Issue-specific evidence guidance
5. Good frame

Only show one primary guidance message at a time.

Do not allow guidance to rapidly switch between states.

Use simple timing, debouncing, or hysteresis so feedback remains readable and stable.

---

## Evidence Guidance Scope

The exhibition version does not need intelligent guidance for every possible maintenance issue.

Initial archetypes may include:

- water / leak
- door / window
- appliance
- fixture damage
- general visible damage

Unknown issues should use a generic fallback:

- overview
- close-up
- optional short video

Do not claim that FixLens can diagnose or perfectly guide every maintenance issue.

---

## Annotation

Photo annotation may include:

- Circle
- Arrow
- Text
- Draw
- Undo
- Redo

Annotation should happen after capture, not during the live camera view.

Annotation is optional.

Store annotation geometry using normalized coordinates rather than screen pixels.

Example:

```json
{
  "x": 0.45,
  "y": 0.62,
  "width": 0.2,
  "height": 0.12
}
```

This allows annotations to render correctly at different image sizes.

---

## Report Readiness

Use:

> Ready for initial review

Do not use:

- AI confidence percentages
- evidence completeness percentages
- diagnostic confidence
- guaranteed sufficiency scores

FixLens assists evidence preparation but does not guarantee that evidence is complete or diagnostically correct.

---

## Case Status Model

Primary renter-facing statuses:

1. Submitted
2. Under review
3. Awaiting approval
4. Arranging repair
5. Repair scheduled
6. Completed

Exceptions:

- More information needed
- Action required

Exceptions are not permanent timeline stages.

---

## Status and Responsibility

Status and responsibility must remain separate.

Example:

**Status**  
Awaiting approval

**Handled by**  
Property manager  
Sarah Chen · Apex Rentals

Do not imply the renter needs to contact the landlord directly simply because landlord approval is pending.

---

## Case Detail Priorities

Case Detail should quickly answer:

1. What is happening now?
2. Who is handling the case?
3. What happens next?
4. Do I need to do anything?

Historical activity is secondary.

---

## Additional Evidence Requests

Evidence requests are separate from the main case status.

Suggested lifecycle:

REQUESTED  
→ SUBMITTED  
→ RESOLVED

Example:

Case status:

> Awaiting approval

Evidence request:

> Action required — Please provide a clearer photo of the lower-left window frame.

Submitting additional evidence should not automatically overwrite the main case lifecycle.

---

## Property Manager Portal

The PM portal should remain intentionally lightweight.

Core functionality:

- view submitted cases
- open a structured case
- review renter information
- review submitted evidence
- update case status
- request additional evidence
- add renter-facing updates
- review newly submitted evidence

Optional:

- export a structured report

Do not turn the portal into a full property-management system.

Out of scope:

- accounting
- rent collection
- billing
- lease management
- contractor marketplace
- quote comparison
- complex landlord dashboards
- payment processing

---

## Notifications

In-app updates are sufficient for the exhibition version.

PM actions may produce:

- Inbox updates
- notification badges
- in-app toast messages
- realtime UI updates

Production mobile push infrastructure is not required.

---

## Authentication

Production authentication is not required for the exhibition build.

Use predefined demo identities where appropriate.

Example renter:

Brad Lai

Example property manager:

Sarah Chen  
Apex Rentals

Do not prioritize:

- public registration
- email verification
- password recovery
- MFA
- organization provisioning

unless the scope explicitly changes.

---

## Product Boundaries

FixLens assists reporting, evidence collection, and case communication.

It does not claim to:

- diagnose the technical cause of an issue
- determine a professional repair solution
- guarantee faster repairs
- determine legal responsibility
- replace professional assessment
- guarantee urgency classifications

---

## Development Principles

When modifying the codebase:

1. Make small, testable changes.
2. Preserve existing working behaviour.
3. Do not perform large refactors without a clear reason.
4. Reuse existing components and design tokens.
5. Prefer simple implementations over production-scale architecture.
6. Keep exhibition reliability in mind.
7. Avoid unnecessary dependencies.
8. Run the application after meaningful changes.
9. Keep renter and PM data models consistent.
10. Do not silently change established UX decisions.
11. Separate AI interpretation from application state/control.
12. Prefer graceful fallback behaviour over technically ambitious but fragile behaviour.

---

## Development Priority

Suggested order:

1. Clean standalone development baseline
2. Application architecture and shared types
3. Backend and case model
4. AI issue extraction
5. Real report submission
6. PM portal
7. Real camera capture
8. Evidence storage
9. Adaptive visual guidance
10. Additional evidence request loop
11. Annotation persistence
12. General Support Chat
13. Realtime updates
14. Exhibition reset mode
15. Deployment and device testing

---

## Success Definition

FixLens is successful as an exhibition prototype when a visitor can experience a believable end-to-end maintenance case where the important parts of the system are genuinely functional rather than completely scripted.

The goal is not feature breadth.

The goal is a narrow, coherent, convincing system.
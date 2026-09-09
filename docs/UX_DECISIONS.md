# FixLens UX Decisions

This document records major UX decisions that should remain stable unless intentionally revisited.

---

## 1. Product Focus

FixLens is not a generic property-management app.

Its focus is:

- better maintenance reporting,
- better evidence collection,
- better post-submission visibility.

Avoid expanding into unrelated rental-management functionality.

---

## 2. Minimum Sufficient Report

The goal is not to collect as much information as possible.

The goal is to help renters create a:

> minimum sufficient report

Only collect information that contributes meaningfully to initial maintenance decision-making.

---

## 3. Only Ask What Is Missing

Do not force every renter through the same questionnaire.

If the renter already provided information in the initial description, do not ask for it again.

Principle:

> Only ask what is still missing.

---

## 4. AI Supports the Flow

AI should understand language and structure information.

AI should not control the entire UX.

Preferred architecture:

User input  
→ AI interpretation  
→ structured output  
→ application rules  
→ next UI state.

This keeps behaviour predictable.

---

## 5. Reporting Chat Has Limited Free Input

The reporting flow is not intended to be a long open-ended chatbot conversation.

The main free-text moment is:

> Briefly describe what is happening.

AI then structures that description.

Follow-up questions should be short and purposeful.

---

## 6. Off-Topic Reporting Messages

If the renter goes off-topic during reporting, FixLens should redirect them.

Do not allow the reporting assistant to drift into unrelated conversation.

---

## 7. General Support Chat Is Separate

Reporting Assistant and General Support Chat serve different purposes.

### Reporting Assistant

Creates a maintenance report.

### General Support Chat

Answers FixLens and maintenance-reporting questions.

This is why Chat is a floating entry rather than a bottom-navigation tab.

---

## 8. Bottom Navigation

Final navigation:

- Home
- Cases
- Inbox
- Profile

Do not add Chat back into the bottom navigation.

---

## 9. Home Hierarchy

Primary action:

> Report an Issue

Secondary actions:

- My Cases
- Other Questions

Recent Case provides continuity.

Do not overload Home with additional features.

---

## 10. Brand Header

Home uses a simple white top header containing:

- FixLens wordmark
- notification entry

Greeting content sits below on the normal page background.

Do not turn the entire upper half of the Home page into one large white header.

---

## 11. Safety Should Be Lightweight

Do not build a long risk questionnaire.

Use one main question:

> Is there any immediate danger to you or anyone else?

Safety escalation should be clear but should not dominate ordinary reporting.

---

## 12. Guided Capture Is Selective

Not every issue requires advanced visual capture.

Use guided visual capture where it is useful.

Do not assume camera guidance is the solution for every maintenance issue.

---

## 13. Use “Adaptive Guided Capture”

Preferred descriptions:

- adaptive guided capture
- AI-assisted visual guidance
- AR-style camera overlay

Avoid claiming full AR unless spatial tracking or anchoring is genuinely implemented.

---

## 14. Camera Guidance Should Feel Stable

The goal is not maximum technical responsiveness.

The goal is understandable adaptive feedback.

Periodic frame analysis is acceptable.

Guidance should not constantly jump between states.

Use simple rule priority and timing.

---

## 15. Distance Can Be a Framing Proxy

The UI may display:

> Move a little further back.

The implementation does not need true physical distance estimation.

Target size and framing within the image are acceptable proxies.

---

## 16. Evidence Rules Are Issue-Specific

Different maintenance issues require different evidence.

Do not create one rigid universal capture flow.

However, the exhibition version only needs a small number of evidence archetypes.

Fallback:

- overview
- close-up
- optional video

---

## 17. Annotation Happens After Capture

Do not clutter the live camera interface with annotation.

Flow:

Capture  
→ Preview  
→ Optional Annotation  
→ Use Photo.

---

## 18. Annotation Is Optional

Do not require renters to annotate every image.

Annotation should only be used when it improves communication.

---

## 19. Readiness Wording

Use:

> Ready for initial review

Do not use:

- percentage complete
- AI confidence
- evidence score
- diagnosis confidence

The system cannot guarantee that the report is sufficient.

---

## 20. Status and Responsibility Are Separate

Never conflate:

> What stage is the case in?

with:

> Who is handling it?

Example:

**Status**  
Awaiting landlord approval

**Handled by**  
Property manager

This prevents renters from incorrectly assuming they need to contact the landlord directly.

---

## 21. Main Case Detail Questions

Case Detail must answer:

1. What is happening now?
2. Who is handling the case?
3. What happens next?
4. Do I need to do anything?

These are more important than the complete history.

---

## 22. History Is Secondary

Activity history should support understanding, not dominate the interface.

Current state comes first.

Historical activity comes later.

---

## 23. Case Exceptions Are Not Timeline Stages

“More information needed” and “Action required” are exception states.

They should not become permanent main progress stages.

---

## 24. Evidence Requests Are Separate Objects

A PM evidence request should have its own lifecycle.

Suggested lifecycle:

REQUESTED  
→ SUBMITTED  
→ RESOLVED

Do not overwrite the main case lifecycle with an evidence request.

---

## 25. Submitted Report Is Read-Only

After submission, the renter should be able to view exactly what was submitted.

Do not reopen the editable Final Review screen.

Submitted Report is a snapshot.

---

## 26. Completed Cases Are Quieter

Completed cases do not need the same visual emphasis as active cases.

Show completion clearly but reduce historical timeline prominence.

---

## 27. Inbox Means “What Changed”

Cases:

> What is the current state?

Inbox:

> What changed?

Do not duplicate the full Case interface inside Inbox.

---

## 28. PM Portal Is Lightweight

The PM portal exists to demonstrate the receiving side of the maintenance case.

It is not intended to reproduce a complete property-management platform.

Required PM actions:

- receive
- review
- update
- request evidence

---

## 29. Do Not Promise Faster Repairs

FixLens may reduce unclear reporting and unnecessary evidence requests.

However, delays may still result from:

- landlord approval
- quotes
- contractor availability
- workload
- scheduling
- external factors

Do not claim FixLens guarantees faster repairs.

---

## 30. Do Not Diagnose

FixLens should describe observable conditions.

Prefer:

> Water is entering through the lower window frame during rain.

Avoid unsupported statements such as:

> The waterproof seal has failed.

unless supported by a qualified source.

---

## 31. Support Chat Has Boundaries

FixLens may explain:

- how to report,
- why evidence is useful,
- what a status means,
- how the app works.

It should not provide:

- legal conclusions,
- professional repair advice,
- dangerous DIY instructions,
- guaranteed outcomes.

---

## 32. No Production Authentication for Exhibition

Use demo identities.

Do not spend exhibition-development time on:

- registration
- email verification
- password recovery
- multi-agency organization management

unless the scope intentionally changes.

---

## 33. In-App Notifications Are Enough

The exhibition build does not require native push notifications.

Backend or realtime updates reflected in Inbox are sufficient.

---

## 34. Keep the UI Quietly Polished

The UI should remain simple.

Visual refinement should come from:

- hierarchy
- spacing
- typography
- surface treatment
- state styling
- subtle motion

Not excessive decoration.

---

## 35. Innovation Is Primarily Interaction-Level

FixLens does not need unconventional navigation or experimental visual styling.

Its innovation is primarily in:

- guided evidence capture
- adaptive visual guidance
- AI-assisted issue structuring
- continuous maintenance case visibility
- renter ↔ property manager evidence loop

The rest of the interface can remain familiar and conventional.
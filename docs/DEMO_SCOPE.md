# FixLens Exhibition Demo Scope

## 1. Objective

Current Phase 2C-C slice adds a real one-photo response to a PM evidence request on
a visitor-owned case. The renter sees the real instruction, selects/captures a photo,
optionally annotates, reviews and submits. Private storage, request linkage and one
activity persist; the case status stays unchanged. Renter sees Evidence submitted /
Awaiting review, while PM sees the associated photo and annotations read-only.
Original report evidence remains separate. Retry safely recovers partial and lost
responses. Native picker is used; no adaptive/live camera or video persistence.
Draft recovery after reload, PM resolution and Realtime remain deferred. Seeded
cases remain read-only for renter writes; demonstrate the loop with a new visitor case.

Retained Phase 2D-B PM slice: one existing exhibition Auth account is linked to
Sarah Chen. Protected desktop routes read all live cases and private original
photos/annotations. PM can record each canonical lifecycle step through Completed,
with atomic activity, visible on renter refresh. Under review allows an evidence
request without changing case status; pending evidence pauses approval progression.
Approval/scheduling are manual exhibition records. Request resolution remains
deferred. Renter demo sessions remain anonymous exhibition isolation.
No external email, AI PM decisions, landlord/contractor integrations, PDF, PM Inbox or Realtime are part of this
slice. The sections below describe the broader exhibition goal.

Build a convincing, functional end-to-end vertical slice of FixLens for exhibition.

The demo should demonstrate that the product concept can exist as a functioning system.

The goal is not to build a production-ready commercial platform.

Priority:

> Depth over breadth.

A small number of flows should work convincingly from end to end.

---

## 2. Target Exhibition Journey

Ideal visitor journey:

1. Open the FixLens renter app.
2. Start Report an Issue.
3. Describe a maintenance issue naturally.
4. AI structures the description.
5. Continue to guided capture.
6. Camera guidance reacts to the visual situation.
7. Capture evidence.
8. Review and submit.
9. The case reaches the backend.
10. The PM portal receives the case.
11. The PM reviews the evidence.
12. The PM updates the status or requests additional evidence.
13. The renter sees the change.
14. The renter responds to the evidence request.
15. The PM receives the new evidence.

This is the primary demonstration loop.

---

## 3. Recommended Primary Demo Scenario

Primary polished scenario:

> Bedroom window leak

Example renter description:

> Water comes through the bottom of my bedroom window whenever there is heavy rain and the carpet underneath gets wet.

This scenario demonstrates:

- natural-language AI understanding
- issue-type extraction
- location extraction
- spatial context
- close-up visual evidence
- optional video
- adaptive framing guidance
- PM evidence review
- additional evidence request

Other maintenance issues may use fallback behaviour and do not need the same level of optimisation.

---

## 4. REAL — Should Actually Work

### Renter UI

The following should genuinely work:

- Home
- Cases
- Inbox
- Profile
- Report Issue flow
- Case Detail
- Submitted Report

### AI Issue Understanding

The renter enters natural language.

AI returns structured output including:

- in-scope classification
- issue type
- location
- concise description
- relevant context
- possible safety flag

The displayed summary should genuinely depend on the user's input.

### Off-Topic Detection

If the user enters unrelated content during reporting:

- classify it as off-topic,
- redirect them to maintenance reporting.

### Support Chat

Free-text support questions should receive generated answers when they are within the FixLens domain.

Unrelated requests should be redirected.

### Camera

Use the real device camera.

Still-image capture should genuinely work.

### Evidence Storage

Captured evidence should be connected to the submitted case.

### Backend

Cases should be stored in a real backend/database.

### PM Portal

The PM should genuinely receive renter-submitted case data.

### PM Status Updates

PM changes should update the renter-facing case.

### Evidence Requests

The PM can create a real request for additional evidence.

### Renter Response

The renter can capture and submit requested evidence.

### Case Activity

Major renter and PM actions should appear in the case activity.

---

## 5. SIMPLIFIED — Real Concept, Reduced Technical Depth

### Adaptive Visual Guidance

The camera does not need continuous frame-by-frame computer vision.

Analyse approximately every:

> 2–5 seconds

or when the camera is sufficiently stable.

Possible guidance:

- Try a brighter angle
- Hold steady
- Move a little further back
- Move closer
- Include the whole window
- Good frame

Success means that the visitor can clearly see guidance change in response to different camera conditions.

Production-grade vision reliability is not required.

---

### Local Camera Analysis

Use simple local measurements where practical:

- brightness
- blur
- frame movement
- stability

These may be implemented without AI.

---

### AI Vision

Use occasional image/frame analysis for higher-level guidance.

Possible checks:

- expected target visible
- useful spatial context visible
- framing too tight
- framing too loose
- evidence appears usable

Only a small, predictable response schema is required.

---

### Capture Rule Engine

Keep the rules small.

Suggested priority:

1. too dark
2. unstable or blurry
3. poor framing
4. issue-specific guidance
5. good frame

Do not build a complex generic rules framework unless later required.

---

### Issue Coverage

Only a small number of evidence archetypes need tailored guidance.

Recommended initial set:

- water / leak
- door / window
- appliance
- fixture damage
- general visible damage

Other issues should use generic fallback capture.

---

### Authentication

Use predefined demo identities.

Example renter:

Brad Lai

Example PM:

Sarah Chen  
Apex Rentals

Do not build a complete public authentication system.

---

### Realtime Updates

A basic realtime backend subscription is sufficient.

It is acceptable for an update to require:

- a short wait,
- a realtime listener,
- or a manual refresh if absolutely necessary.

Native push notification infrastructure is not required.

---

### Video

Short video may be supported.

However, real video upload and storage are lower priority than:

- photos
- AI reporting
- adaptive visual guidance
- PM case loop

If video introduces major browser or device issues, simplify it.

---

## 6. SIMULATED — No Real External Integration Required

### Landlord Approval

The PM may manually change the case to:

> Awaiting approval

No landlord account or real approval workflow is required.

### Contractor Activity

Statuses such as:

- Arranging repair
- Repair scheduled

may be controlled manually by the PM.

No contractor portal is required.

### Repair Completion

The PM may manually mark a case:

> Completed

### Process Timing

No real scheduling engine is required.

### Emergency Contacts

Static or demonstration contact details are acceptable.

---

## 7. OUT OF SCOPE

Do not spend exhibition-development time on these unless scope is intentionally changed.

### Full Property Management Platform

Do not build:

- lease management
- rent collection
- inspection management
- accounting
- billing
- landlord dashboards
- contractor marketplace
- quote comparison
- full work-order management

### Production Authentication

Do not build:

- public user registration
- email verification
- password recovery
- MFA
- organization provisioning

### Production AI Diagnosis

FixLens should not attempt to reliably diagnose the technical cause of maintenance issues.

### Repair Recommendation Engine

Do not recommend professional repair methods.

### Legal Advice

Do not implement legal-rights advice.

### Continuous Computer Vision

Do not send every video frame to AI.

### Full Spatial AR

Do not build:

- spatial anchors
- SLAM
- 3D room mapping
- full environmental reconstruction

### Production Push Notifications

Do not prioritize:

- APNs
- FCM
- native push infrastructure

### External Property Management Integrations

Do not integrate with real commercial property-management platforms for the exhibition version.

### Payment Features

No payment functionality is required.

---

## 8. Core Backend Data

The backend only needs enough structure to support the vertical slice.

Suggested entities:

### Users

- id
- role
- name
- email
- phone

### Properties

- id
- address
- renter_id
- property_manager_id

### Cases

- id
- renter_id
- property_id
- issue_type
- location
- description
- condition
- safety_response
- status
- created_at
- updated_at

### Evidence

- id
- case_id
- evidence_type
- file_path
- annotation_data
- created_at

### Case Updates

- id
- case_id
- type
- message
- created_by
- created_at

### Evidence Requests

- id
- case_id
- instruction
- requested_by
- status
- created_at
- submitted_at
- resolved_at

The schema may evolve during implementation.

---

## 9. Evidence Request Lifecycle

Recommended:

REQUESTED  
→ SUBMITTED  
→ RESOLVED

Example PM request:

> Please provide a clearer photo of the lower-left corner of the window frame.

Renter sees:

**Action Required**

CTA:

> Add Requested Evidence

After the renter uploads evidence:

**Request status:** SUBMITTED

After PM review:

**Request status:** RESOLVED

The main case status remains independent.

---

## 10. AI Reporting Scope

The reporting AI only needs to perform a narrow task well.

Input:

Natural renter issue description.

Suggested output:

```json
{
  "inScope": true,
  "issueType": "",
  "location": "",
  "description": "",
  "condition": "",
  "safetyConcern": null
}
```

The exact schema may change.

The reporting assistant does not need to sustain a long open-ended conversation.

---

## 11. Support Chat Scope

Support Chat may answer questions about:

- how to use FixLens
- maintenance reporting
- evidence collection
- case statuses
- evidence requests
- what happens after submission

For unrelated questions:

> Redirect.

For unsafe technical requests:

> Do not provide repair instructions.

For legal questions:

> Explain that FixLens cannot provide legal advice.

---

## 12. Adaptive Capture Success Criteria

Adaptive capture is successful if a visitor can observe at least two or three different guidance states caused by different camera conditions.

Example:

Dark image  
→ Try a brighter angle

Moving camera  
→ Hold steady

Poor framing  
→ Move a little further back

Suitable image  
→ Good frame

This is sufficient to demonstrate that the feature is adaptive.

It does not need to prove production-grade computer vision.

---

## 13. Exhibition Reliability Rules

Exhibition reliability is more important than technical sophistication.

Prefer:

- predictable AI schemas
- graceful fallbacks
- visible loading states
- timeout handling
- stable primary demo scenario
- simple retries
- demo reset functionality

Avoid making the primary demo dependent on fragile or uncontrolled workflows.

---

## 14. Demo Reset

Provide a simple way to restore the exhibition scenario.

Reset may clear:

- temporary captures
- chat history
- evidence requests
- case updates
- modified statuses

and restore:

- default renter
- default PM
- seeded case data where required

The reset control may be hidden from normal users.

---

## 15. Development Priority

### P0 — Foundation

- clean standalone React app
- stable navigation
- shared types
- backend connection
- case data model

### P1 — Core System

- AI issue extraction
- report submission
- evidence storage
- PM portal
- status synchronization

### P2 — Signature Interaction

- real camera
- adaptive visual guidance
- annotation
- additional evidence loop

### P3 — Exhibition Polish

- Support Chat
- realtime updates
- subtle animations
- demo reset
- error handling
- mobile device testing

### P4 — Optional

- real short-video upload
- export report
- richer PM activity
- more issue archetypes

---

## 16. What Makes the Demo Successful

The demo should communicate four things clearly.

### FixLens Understands the Renter

Natural description becomes useful structured information.

### FixLens Helps the Renter Capture Better Evidence

Camera guidance visibly adapts to what the system observes.

### FixLens Maintains Continuity

The maintenance report does not disappear after submission.

### Both Sides Can Act on the Same Case

The PM can review, update, and request information, and the renter can see and respond to those actions.

That complete end-to-end loop matters more than the total number of implemented features.

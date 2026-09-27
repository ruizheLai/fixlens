# FixLens

FixLens is an AI-assisted rental maintenance reporting companion designed to help renters provide decision-relevant evidence and understand what happens after a maintenance report is submitted.

This repository contains the functional exhibition prototype developed from the FixLens high-fidelity UX prototype.

---

## Concept

FixLens focuses on two problems:

1. Renters often do not know what evidence a property manager needs to make an initial maintenance decision.
2. Renters often lose visibility into the status, responsibility, and next steps of a maintenance case after submission.

Core concept:

> A guided maintenance reporting companion that helps renters create a minimum sufficient report, then keeps the case status visible throughout the maintenance process.

---

## Exhibition Goal

The prototype aims to demonstrate a real end-to-end vertical slice:

Renter  
→ AI-assisted issue reporting  
→ adaptive guided capture  
→ structured report  
→ backend  
→ property manager portal  
→ status update or evidence request  
→ renter follow-up.

The goal is not to build a production-ready rental management platform.

---

## Core Features

### Renter

- AI-assisted maintenance issue reporting
- structured issue summary
- guided visual evidence capture
- adaptive camera guidance
- photo annotation
- report review and submission
- case status tracking
- Inbox updates
- additional evidence submission
- scoped FixLens support chatbot

### Property Manager

- receive submitted cases
- review structured reports
- view renter evidence
- update case status
- request additional evidence
- send renter-facing updates

---

## AI

AI is used selectively.

### Reporting Assistant

AI can:

- understand a renter's natural-language issue description
- identify issue type and location
- generate a concise structured description
- detect off-topic input
- identify important missing information where necessary

### Support Chat

The support chatbot answers only FixLens and rental-maintenance-reporting related questions.

Unrelated requests should be redirected rather than answered as a general-purpose assistant.

### Visual Guidance

Camera frames may be analysed periodically to provide adaptive guidance such as:

- Hold steady
- Try a brighter angle
- Move a little further back
- Move closer
- Include the whole window
- Good frame

The feature is better described as adaptive guided capture or an AR-style camera overlay rather than full spatial AR.

---

## Technology

Current:

- React
- TypeScript
- Vite
- Tailwind CSS

Planned:

- Supabase or an equivalent lightweight backend
- relational database
- evidence/file storage
- AI text analysis
- image/vision analysis
- property manager web portal

---

## Local Development

Supabase schema and seed are applied; Cases, Case Detail, current evidence requests,
Inbox, and Submitted Report structured fields now read live data. Report submission
creates real visitor cases and initial activity, with browser demo-session isolation
and idempotent Retry. Overview and Close-up photos now persist in a private
Storage bucket with separate annotations. This is not production authentication.
Home, Profile, scripted support, video and requested-evidence acknowledgements
remain fixture/local. See [Backend setup](docs/BACKEND_SETUP.md).

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

---

## Vercel deployment

Import `ruizheLai/fixlens` with Framework Preset **Vite**, Root Directory **./**,
the default build command (**npm run build**) and output directory (**dist**).
Keep the default install command. First commit/push the reviewed deployment changes
to the branch Vercel will deploy; these changes are not published automatically.
Confirm that the selected production branch includes Phase 2C-A and vercel.json.

Enter these variables manually in Vercel for Production and Preview when testing
preview deployments (names only; never commit their values):

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Vite embeds these browser-safe values at build time; redeploy after changing them.
Never enter a database password, service-role key or private key in a VITE variable.
The shared client and its x-fixlens-demo-session header remain unchanged. Sessions
are localStorage/origin-specific: localhost, preview and production URLs have
different demo identities. This is exhibition isolation, not secure authentication.

The minimal vercel.json rewrite serves index.html for React Router deep links,
following [Vercel's Vite guidance](https://vercel.com/docs/frameworks/frontend/vite).
No server, middleware or functions are required. Phase 2C-Deploy was deployed and
verified on real mobile by the project owner. Phase 2C-B changes are local pending
review; this batch does not deploy or change Vercel settings.

Phone viewports below 768px use full width and 100dvh without a fake status bar,
rounded device frame or shadow. Larger viewports retain the centered 390×844
maximum phone preview. Local production-preview checks passed at 375×667,
390×844, 360×800 and desktop 1280×900, including scrolling, navigation, report
review/success and live submission. TypeScript/build and normal console checks
passed. No safe-area override was needed in desktop viewport testing; actual
phone browser chrome, keyboard, touch and safe-area behaviour remain unverified.

After deployment, verify HTTPS/secure context and direct entry/refresh/Back/Forward
for `/`, `/cases`, `/inbox`, `/profile`, `/support`, `/report`, all three seeded
case routes and `/cases/bedroom-window-leak/report`. On iPhone Safari or Android
Chrome, complete a report through submission, open its generated case and report,
refresh Cases/Detail, check Inbox and confirm a second browser cannot read it.
Check keyboard visibility, scrolling and bottom navigation without camera access.
Keep the existing backend security-review item documented in
[Backend setup](docs/BACKEND_SETUP.md) before public showcase use.

## Phase 2C-B — Photo evidence

Overview and Close-up use native image/file selection: the shutter requests the
rear camera where supported, and the gallery button selects a file. Photos stay
local until Submit. Preview, Retake and Final Review replacement use the selected
image. Circle, Arrow, Text and Draw store normalized coordinates separately from
the image; Undo/Redo edit the local marks. Submitted Report is read-only.

Submit confirms the case first, then uploads both JPEGs and confirms both evidence
rows before showing success. Retry reuses the case key and photo IDs and skips
confirmed rows. The private `case-evidence` bucket uses
`<demo-session>/<case-id>/<evidence-id>.jpg`. The shared client downloads private
images with the session header into revocable local blob URLs; no public image
URLs or signed-link expiry are involved. Refresh fetches the saved photos again.
Seeded reports without stored photos show an empty state, without fixture images.

Photos are resized to at most 2048px on the longest side and exported as JPEG
quality 0.9, without burned-in annotations or EXIF/GPS. Input limit: 20 MB; upload
limit: 6 MB. Unsupported image formats show a recoverable message. Video remains
a clearly labelled local simulation and creates no evidence rows.

The bucket/policy migration is applied; no extra environment variable or manual
backend setup is required for this project. Draft files survive only while the
report page remains open. Storage and database writes are not one transaction:
abandoning a failed upload can leave a partial case or unlinked file for
administrative cleanup. Session IDs are caller-controlled demo isolation, not
production authentication. See Backend setup for policies and verification.
PM, AI, Realtime, PWA and Phase 2C-C remain deferred.

## Project Structure

```text
fixlens-dev/
├─ AGENTS.md
├─ README.md
├─ docs/
│  ├─ PRODUCT_SPEC.md
│  ├─ UX_DECISIONS.md
│  └─ DEMO_SCOPE.md
├─ src/
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

---

## Current Stage

The high-fidelity UX prototype is complete enough to begin functional development.

Current development focus:

1. remove remaining Figma Make dependencies
2. establish a clean application architecture
3. connect real case data
4. implement AI-assisted issue understanding
5. implement real camera capture
6. add adaptive visual guidance
7. build a lightweight PM portal
8. complete the renter ↔ PM evidence request loop
9. prepare a stable exhibition demo

---

## Design Direction

FixLens should remain:

- clear
- calm
- trustworthy
- minimal
- professional
- quietly polished

The product innovation should come primarily from its reporting workflow, adaptive evidence guidance, AI-assisted issue structuring, and continuous case visibility rather than decorative UI.

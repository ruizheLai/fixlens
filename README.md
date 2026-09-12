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

Supabase schema and seed are applied; the Cases list now reads live data. Other
renter screens remain fixture-driven. See [Backend setup](docs/BACKEND_SETUP.md).

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

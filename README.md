# Section 125 Proposal Tools — Infinity Portal

Two proposal-building tools for Section 125 Cafeteria Plan tax savings analysis.

## Tools

- **Quick Proposal (Fission)** — Broker enters estimated company data manually. Results generate live as inputs change.
- **Informed Analysis (Fusion)** — Broker uploads a census/payroll file. Column mapping + per-employee calculations produce higher-accuracy proposals.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # Run unit tests
npm run build      # Production build
```

## Portal Integration

All backend communication goes through a single adapter file:

```
src/features/proposal/api/proposal.api.ts
```

Replace each function body with your real portal API calls. Every other file imports from here — no direct API calls anywhere else.

### Mount Points

```tsx
<QuickProposalPage groupId={groupId} />
<InformedAnalysisPage groupId={groupId} />
<ResourcesTab groupId={groupId} />
```

## Project Structure

```
src/
├── features/
│   ├── proposal/          # Shared infrastructure (types, engine, hooks, components, store, API)
│   ├── quick-proposal/    # Fission: manual entry tool
│   ├── informed-analysis/ # Fusion: file upload tool
│   └── portal-integration/# Resources tab + proposal cards
├── config/                # Tax rates, FICA rates, industry presets, language
├── design-tokens/         # Theme tokens
└── utils/                 # Formatting, validation, debounce
```

## Tech Stack

- React 18+ / TypeScript
- Zustand (state management)
- Tailwind CSS v4 (custom theme)
- Recharts (data visualization)
- @react-pdf/renderer (client-side PDF)
- Papa Parse + SheetJS (file parsing)
- Zod (validation)
- Framer Motion (animation)
- Vite (build)
- Vitest (testing)

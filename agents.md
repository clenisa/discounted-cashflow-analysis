# Repository Guidelines

## Project Structure & Module Organization
Core app code lives in `src/`. Valuation logic and helpers stay in `lib/`, reusable UI in `components/`, shell layout in `layouts/`, and scenario defaults in `constants/`. Hooks such as `useDCFCalculation` and `useDebouncedValue` sit in `hooks/`, while future data adapters belong in `services/`. Keep feature-specific tests co-located (e.g., `src/lib/dcf.test.ts`), and add comparison specs beside the new components.

## Build, Test, and Development Commands
- `npm install` – install dependencies (Node 18+).
- `npm run dev` – Vite dev server with hot reload at http://localhost:5173.
- `npm run build` – type-check via `tsc` then emit production assets.
- `npm test` – run Vitest (jsdom environment).
- `npm run lint` – ESLint for `.ts/.tsx` within `src/`.

## Coding Style & Naming Conventions
Use TypeScript React function components with PascalCase filenames (`ScenarioComparison.tsx`). Favor camelCase for utilities and state setters. Two-space indentation, Tailwind utility classes for styling, and descriptive prop names keep the UI legible. Run ESLint (and optionally Prettier) before commits to match the existing configuration.

## Scenario Comparison Notes
`ScenarioComparison` renders selectors, summary cards, table, and charts for any two presets. Calculations are memoized and guarded so the view stays stable until both scenarios are chosen. All “Difference” values are computed as **Scenario B minus Scenario A**, so positive results highlight where Scenario B outperforms. The table prefixes “+” for positive deltas and uses currency/percentage helpers to keep formatting consistent with the rest of the dashboard.

## Testing & QA Expectations
Regression coverage currently centers on `calculateDCF` and `calculateFCF`; add Vitest specs when altering valuation math or comparison helpers. During manual QA, confirm baseline Base scenario outputs (PV €5.66M, EV €28.06M), verify comparison charts render after selecting two distinct scenarios, and ensure keyboard navigation reaches both dropdowns. Stress test edge cases (e.g., WACC 50%, growth 0%) to confirm error handling still routes through `calculateDCF`.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, etc.) with focused diffs and passing lint/tests. PR descriptions should summarize scenario or valuation impacts, include reproduction notes for comparison tweaks, and attach screenshots/GIFs when UI changes are visible. Mention any console warnings observed in `npm run dev` and list manual QA steps executed so QA can repeat them quickly.

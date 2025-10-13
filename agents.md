# Repository Guidelines

## Project Structure & Module Organization
The app lives under `src/`, with `components/`, `layouts/`, and `pages/` composing the ReturnPro dashboard shell. DCF logic stays in `lib/` and reusable hooks in `hooks/`; keep valuation presets and defaults inside `constants/` (e.g., `src/constants/scenarios.ts`). Shared styling utilities sit in `styles/`, while service adapters are staged in `services/` for future data persistence. Tests currently target the valuation engine in `src/lib/dcf.test.ts`; co-locate new specs with their modules.

## Build, Test, and Development Commands
- `npm install` – install Node 18+ dependencies once per environment.
- `npm run dev` – launch the Vite dev server at http://localhost:5173 with hot reload.
- `npm run build` – type-check via `tsc` then produce a production bundle.
- `npm test` – execute the Vitest suite (jsdom environment).
- `npm run lint` – run ESLint across `src/` using the TypeScript + React ruleset.
- `npm run preview` – serve the production build locally for smoke checks.

## Coding Style & Naming Conventions
Write TypeScript-first React function components with PascalCase filenames (`ReturnProLayout.tsx`) and camelCase utilities. Use 2-space indentation and favor descriptive prop names over abbreviations. TailwindCSS powers styling; prefer utility classes over inline styles and keep shared tokens in `tailwind.config.ts`. Run ESLint before commits and align formatting with Prettier-compatible settings used by the existing config (`eslint-config-prettier`).

## Testing Guidelines
Vitest and Testing Library underpin unit and interaction tests; mirror the structure in `src/lib/dcf.test.ts` when covering new modules. Add regression cases whenever adjusting `calculateDCF`, `calculateFCF`, or `useDCFCalculation`, validating both nominal and edge scenarios (e.g., WACC > growth, loss carry-forward). Ensure baseline Base scenario values (PV ≈ €5.66M, enterprise value ≈ €28.06M) remain unchanged unless intentionally recalibrated, and document any variance in the PR.

## Commit & Pull Request Guidelines
Follow the Conventional Commits pattern observed in history (`feat:`, `fix:`, `chore:`). Commits should be focused and lint/test clean. PRs need: concise summary, linked issue or QA ticket, reproduction steps or parameter payloads for valuation changes, and screenshots or GIFs for UI updates (charts, tooltips, layout). Call out any console warnings discovered during `npm run dev`, and highlight manual QA steps performed.

## QA & Accessibility Expectations
Before handing off, verify the sidebar, KPI cards, and Scenario Summary render without warnings. Stress test extreme inputs (e.g., WACC 50%, growth 0%) to confirm the Gordon Growth implementation stays stable. Confirm keyboard reachability of all sliders, tooltips, and historical EBITDA entries, and ensure color contrast for red historical rows meets WCAG targets.

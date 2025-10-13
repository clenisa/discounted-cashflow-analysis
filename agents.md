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

## Feature Map
- **Layout**: `ReturnProLayout` wraps the app with sidebar navigation, search bar, profile controls, and quick links to the Carlos Master Dash v1.3 Power BI workspace plus the DCF Excel Template.
- **Dashboard Header**: `MetricCard` tiles show Enterprise Value, Terminal Value (raw + PV), and current WACC, with hoverable info tooltips on the valuation KPIs.
- **Scenario Summary**: `ScenarioSummary` renders the EBITDA Outlook with years as column headers and highlights historical values in red.
- **Scenarios**: `src/constants/scenarios.ts` defines the three hardcoded iFReturns presets (Conservative 25% / 3%, Base 20% / 4%, Optimistic 18% / 5%) that share the same EBITDA seed data.
- **Inputs**: `InputPanel` lists editable EBITDA rows (historical in red) and sliders/number inputs for WACC, Perpetual Growth, and Corporate Tax.
- **Visuals**: `VisualizationPanel` renders a cumulative waterfall value bridge (discounted UFCFs → enterprise value) alongside a `PieChart` splitting projections vs terminal PV.
- **Table**: `DetailedAnalysisTable` provides row-level calculations with tax, FCF, discount factor, and present value, plus terminal value and enterprise value summary rows.
- **Engine**: `useDCFCalculation` debounces form state and invokes `calculateDCF`, enforcing WACC > growth and correct tax treatment for losses.
- **Scenario Comparison**: `ScenarioComparison` component allows side-by-side comparison of any two scenarios with metrics, tables, and visualizations.

## Testing Guidelines
Vitest and Testing Library underpin unit and interaction tests; mirror the structure in `src/lib/dcf.test.ts` when covering new modules. Add regression cases whenever adjusting `calculateDCF`, `calculateFCF`, or `useDCFCalculation`, validating both nominal and edge scenarios (e.g., WACC > growth, loss carry-forward). Ensure baseline Base scenario values (PV ≈ €5.66M, enterprise value ≈ €28.06M) remain unchanged unless intentionally recalibrated, and document any variance in the PR.

## Commit & Pull Request Guidelines
Follow the Conventional Commits pattern observed in history (`feat:`, `fix:`, `chore:`). Commits should be focused and lint/test clean. PRs need: concise summary, linked issue or QA ticket, reproduction steps or parameter payloads for valuation changes, and screenshots or GIFs for UI updates (charts, tooltips, layout). Call out any console warnings discovered during `npm run dev`, and highlight manual QA steps performed.

## QA & Accessibility Expectations
Before handing off, verify the sidebar, KPI cards, and Scenario Summary render without warnings. Stress test extreme inputs (e.g., WACC 50%, growth 0%) to confirm the Gordon Growth implementation stays stable. Confirm keyboard reachability of all sliders, tooltips, and historical EBITDA entries, and ensure color contrast for red historical rows meets WCAG targets.

## Baseline Values (Base Scenario)
- PV of projected cash flows: **€5,660,084**
- Terminal value: **€80,280,862**
- PV of terminal value: **€22,404,915**
- Enterprise value: **€28,064,999**

Agents should spot-check these values after any change to calculations or default data.

## Manual QA Checklist
- **Load & Layout**
  - Start dev server; ensure sidebar, header, and dashboard render without console errors.
  - Confirm the scenario selector lists the three iFReturns presets (Conservative, Base, Optimistic) and switching between them updates metrics.
  - Test the DCF Excel Template link opens the shared spreadsheet and the Carlos Master Dash v1.3 button opens the Power BI dashboard in a new tab/window.
  - Confirm historical EBITDA rows (≤2024) are styled in the red "Historical" state.
  - **NEW**: Verify the Scenario Comparison section loads and allows selection of two different scenarios.
- **Input Behaviour**
  - Change numeric input for a historical year; verify immediate update in header metrics, chart, and table after short debounce (~180 ms).
  - Toggle between negative and positive values to ensure tax only applies when EBITDA > 0.
  - Use sliders to adjust WACC, growth, and tax; confirm number input and trailing percentage text stay synchronized.
  - Attempt to set WACC ≤ growth. Expect calculation error (component will throw). Capture any ungraceful UX—currently no explicit guardrail in UI.
- **Chart & Table Verification**
  - Verify the EBITDA Outlook table renders years as column headers with historical columns in red.
  - Hover Value Bridge steps to confirm tooltips display absolute values, cumulative progression tracks year-over-year, and the final bar equals enterprise value.
  - Check pie chart percentages sum to ~100% and labels remain legible.
  - Validate table formatting: negative taxes wrapped in parentheses, discount factor precision (3 decimals), enterprise value row styled in primary color.
  - **NEW**: In Scenario Comparison, verify bar charts and pie charts render correctly with proper data labels and tooltips.
- **Calculation Accuracy**
  - Recreate a manual scenario (e.g., set 2029 EBITDA to 10,000,000, growth 3%, WACC 12%) and recompute expected results offline to compare.
  - Ensure terminal value row uses Gordon Growth formula and separate present value discount factor.
  - **NEW**: Verify comparison calculations match individual scenario calculations when comparing scenarios.
- **Performance & Responsiveness**
  - Resize browser from mobile to desktop widths; columns stack to single column on small viewports, charts maintain aspect ratio, inputs remain accessible.
  - Observe debounce to confirm no stutter when rapidly typing.
  - **NEW**: Test comparison tool responsiveness when switching between different scenario combinations.
- **Accessibility**
  - Verify inputs have descriptive labels and helper text (`aria-describedby` on sliders/numbers).
  - Check keyboard focus order (tabbing through EBITDA list, sliders, and header buttons).
  - Ensure the KPI info buttons are reachable via keyboard and display tooltip text on focus.
  - Confirm color contrasts for historical vs projected rows.
  - **NEW**: Verify comparison tool dropdowns and charts are keyboard accessible.

## Regression Watchouts
- Calculation exceptions ripple through UI because `calculateDCF` throws; any new validation should include graceful error handling.
- Chart tooltip relies on `formatCurrency`; altering formatter should preserve currency symbol and thousand separators.
- Debounce timing changes impact perceived responsiveness; keep ≤200 ms.
- Data services: `LocalDataService` and `SupabaseDataService` exist but are not wired into the calculator yet. Adding persistence must respect interface contracts and TypeScript typing.
- **NEW**: Scenario comparison should not affect individual scenario calculations or state management.

## Suggested Exploratory Scenarios
1. Extreme inputs (e.g., WACC 50%, growth 0%, alternating positive/negative EBITDA) to stress calculation stability.
2. Rapid slider drags combined with concurrent EBITDA edits to check debounced state coherence.
3. Browser storage block (disable localStorage via dev tools) to ensure app still renders without persistence errors.
4. Mobile viewport (375px) to validate chart renders and table scroll works with touch gestures.
5. **NEW**: Compare scenarios with vastly different parameters to test visualization scaling and metric differences.

## Test Automation Hooks
- Unit coverage focuses on `calculateDCF` and `calculateFCF`. When adding new behaviours, extend `src/lib/dcf.test.ts`.
- Consider adding testing-library suites for input panels if bug fixes touch UI state or validation messaging.
- **NEW**: Consider adding tests for comparison calculations and scenario selection logic.

## Handoff Notes
- Provide QA with the command list above and this guide.
- Capture any console warnings, especially React key warnings from dynamic lists.
- Report issues with screenshots plus the parameter/EBITDA payload that reproduced them.
- **NEW**: Include comparison tool testing in QA handoff, focusing on scenario selection and chart rendering.
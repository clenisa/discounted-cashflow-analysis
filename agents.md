# ReturnPro DCF – QA Agent Guide

## Objective
- Validate the ReturnPro-branded discounted cash flow dashboard before live QA.
- Confirm the corrected valuation methodology (single WACC, Gordon Growth) remains stable under varied inputs.
- Surface UX, accessibility, and data consistency regressions that automated tests might miss.

## Environment & Build
- Recommended: Node.js 18+, npm 9+.
- Install once with `npm install`.
- Developer server: `npm run dev` (Vite, served on http://localhost:5173 by default).
- Unit tests: `npm test` (Vitest). Latest run: all suites green.
- Optional lint sweep: `npm run lint`.

## Feature Map
- **Layout**: `ReturnProLayout` wraps the app with sidebar navigation, search bar, profile controls, and quick links to the Carlos Master Dash v1.3 Power BI workspace plus the DCF Excel Template.
- **Dashboard Header**: `MetricCard` tiles show Enterprise Value, Terminal Value (raw + PV), and current WACC, with hoverable info tooltips on the valuation KPIs.
- **Scenario Summary**: `ScenarioSummary` renders the EBITDA Outlook with years as column headers and highlights historical values in red.
- **Scenarios**: `src/constants/scenarios.ts` defines the three hardcoded iFReturns presets (Conservative 25% / 3%, Base 20% / 4%, Optimistic 18% / 5%) that share the same EBITDA seed data.
- **Inputs**: `InputPanel` lists editable EBITDA rows (historical in red) and sliders/number inputs for WACC, Perpetual Growth, and Corporate Tax.
- **Visuals**: `VisualizationPanel` renders a `ComposedChart` (EBITDA, Tax, FCF, Present Value) and a `PieChart` splitting projections vs terminal PV.
- **Table**: `DetailedAnalysisTable` provides row-level calculations with tax, FCF, discount factor, and present value, plus terminal value and enterprise value summary rows.
- **Engine**: `useDCFCalculation` debounces form state and invokes `calculateDCF`, enforcing WACC > growth and correct tax treatment for losses.

## Baseline Calculation (default seed data)
Derived from the Base iFReturns scenario with 20% WACC, 4% growth, and 21% corporate tax.

| Year | EBITDA (€) | Corporate Tax (€) | Free Cash Flow (€) | Discount Factor | Present Value (€) |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2023 | -1,274,610 | 0 | -1,274,610 | 0.833 | -1,062,175 |
| 2024 | -885,664 | 0 | -885,664 | 0.694 | -615,044 |
| 2025 | 29,279 | 6,149 | 23,130 | 0.579 | 13,386 |
| 2026 | 1,715,988 | 360,357 | 1,355,631 | 0.482 | 653,757 |
| 2027 | 3,618,470 | 759,879 | 2,858,591 | 0.402 | 1,148,804 |
| 2028 | 7,840,841 | 1,646,577 | 6,194,264 | 0.335 | 2,074,447 |
| 2029 | 15,634,053 | 3,283,151 | 12,350,902 | 0.279 | 3,446,910 |

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
  - Confirm historical EBITDA rows (≤2024) are styled in the red “Historical” state.
- **Input Behaviour**
  - Change numeric input for a historical year; verify immediate update in header metrics, chart, and table after short debounce (~180 ms).
  - Toggle between negative and positive values to ensure tax only applies when EBITDA > 0.
  - Use sliders to adjust WACC, growth, and tax; confirm number input and trailing percentage text stay synchronized.
  - Attempt to set WACC ≤ growth. Expect calculation error (component will throw). Capture any ungraceful UX—currently no explicit guardrail in UI.
- **Chart & Table Verification**
  - Verify the EBITDA Outlook table renders years as column headers with historical columns in red.
  - Hover bars/line to confirm tooltip currency formatting and labels.
  - Check pie chart percentages sum to ~100% and labels remain legible.
  - Validate table formatting: negative taxes wrapped in parentheses, discount factor precision (3 decimals), enterprise value row styled in primary color.
- **Calculation Accuracy**
  - Recreate a manual scenario (e.g., set 2029 EBITDA to 10,000,000, growth 3%, WACC 12%) and recompute expected results offline to compare.
  - Ensure terminal value row uses Gordon Growth formula and separate present value discount factor.
- **Performance & Responsiveness**
  - Resize browser from mobile to desktop widths; columns stack to single column on small viewports, charts maintain aspect ratio, inputs remain accessible.
  - Observe debounce to confirm no stutter when rapidly typing.
- **Accessibility**
  - Verify inputs have descriptive labels and helper text (`aria-describedby` on sliders/numbers).
  - Check keyboard focus order (tabbing through EBITDA list, sliders, and header buttons).
  - Ensure the KPI info buttons are reachable via keyboard and display tooltip text on focus.
  - Confirm color contrasts for historical vs projected rows.

## Regression Watchouts
- Calculation exceptions ripple through UI because `calculateDCF` throws; any new validation should include graceful error handling.
- Chart tooltip relies on `formatCurrency`; altering formatter should preserve currency symbol and thousand separators.
- Debounce timing changes impact perceived responsiveness; keep ≤200 ms.
- Data services: `LocalDataService` and `SupabaseDataService` exist but are not wired into the calculator yet. Adding persistence must respect interface contracts and TypeScript typing.

## Suggested Exploratory Scenarios
1. Extreme inputs (e.g., WACC 50%, growth 0%, alternating positive/negative EBITDA) to stress calculation stability.
2. Rapid slider drags combined with concurrent EBITDA edits to check debounced state coherence.
3. Browser storage block (disable localStorage via dev tools) to ensure app still renders without persistence errors.
4. Mobile viewport (375px) to validate chart renders and table scroll works with touch gestures.

## Test Automation Hooks
- Unit coverage focuses on `calculateDCF` and `calculateFCF`. When adding new behaviours, extend `src/lib/dcf.test.ts`.
- Consider adding testing-library suites for input panels if bug fixes touch UI state or validation messaging.

## Handoff Notes
- Provide QA with the command list above and this guide.
- Capture any console warnings, especially React key warnings from dynamic lists.
- Report issues with screenshots plus the parameter/EBITDA payload that reproduced them.

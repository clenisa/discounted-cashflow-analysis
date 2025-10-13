# ReturnPro DCF Calculator

Enterprise-grade discounted cash flow tooling that mirrors the ReturnPro R1 design system while following academically sound valuation methodology. The calculator applies a consistent weighted average cost of capital (WACC), the Gordon Growth terminal value model, and clear breakdowns of projected cash flows.

## Key Features

- Correct DCF engine with consistent WACC discounting and Gordon Growth terminal value.
- Interactive React dashboard with ReturnPro-styled layout, charts, and accessibility-first inputs.
- Debounced editing of EBITDA timelines and valuation parameters for responsive recalculation.
- Scenario comparison workspace that contrasts any two presets with B − A delta metrics, charts, and tables.
- Data layer abstraction prepared for Supabase persistence while supporting secure local storage.
- Comprehensive unit tests validating terminal value math, discount factor usage, and edge cases.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```
2. Launch the development server:
   ```
   npm run dev
   ```
3. Build production assets:
   ```
   npm run build
   ```

The project uses Vite with TypeScript and Tailwind CSS. Charts are rendered with Recharts, and UI icons come from lucide-react.

## Testing

- Run the unit test suite:
  ```
  npm test
  ```
- Coverage reports are generated automatically using the V8 provider.

## Project Structure

- `src/lib` DCF calculation logic and supporting helpers.
- `src/components/dcf` Dashboard, inputs, tables, and visualization components.
- `src/components/comparison` Scenario comparison selectors, metrics, visuals, and table views.
- `src/layouts` ReturnPro-styled application shell and navigation.
- `src/services` Data service abstractions for local storage and Supabase.
- `src/constants` Default EBITDA timeline and valuation parameter presets.
- `src/utils` Formatting helpers for currency and percentages.

## Financial Methodology

- Free cash flow applies corporate tax only when EBITDA is positive.
- All projections and the terminal value are discounted using the same WACC.
- Terminal value uses `TV = FCF_final * (1 + g) / (r - g)` with a separate present value step.
- Validation prevents growth rates from equaling or exceeding the discount rate.

## Scenario Comparison

- Access the comparison view from the sidebar to select any two scenarios.
- Calculations are memoized and remain idle until both dropdowns have unique selections.
- All displayed differences are calculated as Scenario B minus Scenario A; positive values indicate Scenario B outperforms A.
- Bar and pie charts mirror the dashboard formatting, using the same currency helpers for tooltip parity.

## Supabase Integration Notes

- Schema definitions for `dcf_models` and `financial_data_sources` align with ReturnPro requirements and support row level security.
- `SupabaseDataService` implements the full `DataService` interface, enabling easy swap from local storage to cloud persistence.
- Add your Supabase credentials and instantiate `SupabaseDataService` once authentication is ready.

## Accessibility and UX

- Input fields include ARIA labelling and screen reader hints.
- Keyboard navigation is supported across numeric inputs and parameter sliders.
- Responsive layout scales from mobile devices to desktop monitors.

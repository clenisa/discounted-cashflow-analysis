# Repository Guidelines

## Project Structure & Module Organization
App code lives in `src/`. Domain math and helpers stay in `lib/`, reusable UI in `components/`, layouts in `layouts/`, and scenario presets in `constants/`. Hooks (e.g., `hooks/useDCFCalculation.ts`) manage cross-cutting logic, while API adapters belong in `services/`. Keep feature tests beside their targets (`src/lib/calculateDCF.test.ts`), and colocate story or comparison specs with the relevant component folder.

## Build, Test, and Development Commands
- `npm install` – install dependencies (Node 18+).
- `npm run dev` – start the Vite dev server at http://localhost:5173.
- `npm run build` – run `tsc` type-checks then emit production assets in `dist/`.
- `npm test` – execute Vitest in jsdom; pass `--watch` when iterating.
- `npm run lint` – run ESLint for `.ts/.tsx` files under `src/`.

## Coding Style & Naming Conventions
Write TypeScript React function components in PascalCase files (`ScenarioComparison.tsx`), and use camelCase for variables, hooks, and handler names. Indent with two spaces. Favor Tailwind utility classes for styling; add minimal inline comments only where the intent is non-obvious. Run the linter before committing; Prettier is available via your editor if needed, but ESLint is the enforced check.

## Testing Guidelines
Vitest is the primary framework. Name test files with the `.test.ts[x]` suffix and colocate them with the code they exercise. Extend regression coverage when adjusting valuation maths (`calculateDCF`, `calculateFCF`) or comparison helpers. When UI logic changes, add component-level tests or lightweight integration specs. Use `npm test -- --coverage` when validating larger refactors, and confirm baseline outputs (PV €5.66M, EV €28.06M) still match.

## Security & Configuration Tips
Supabase features require `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Define them in local `.env` files and Vercel project settings; never commit secrets. When the env vars are absent, the app degrades gracefully to local storage, so verify auth flows after toggling configuration. Tailwind relies on `tailwind.config.ts`; update the safelist when introducing dynamic class names.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.) and keep diffs focused. Every PR should include a concise summary of valuation or UI impact, reproduction steps for comparison changes, screenshots or GIFs for visible tweaks, and a note on console warnings observed during `npm run dev`. Ensure lint, tests, and build all pass locally before requesting review.

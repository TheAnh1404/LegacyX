# Repository Guidelines

## Project Structure & Module Organization

This is a React + TypeScript + Vite application. App entry points live in `src/main.tsx` and `src/App.tsx`. Route-level screens are in `src/pages/`, reusable layout wrappers are in `src/components/layouts/`, and shared UI primitives are in `src/components/ui/`. Utility and integration code belongs in `src/lib/`, with mock app state in `src/mock/`. Static files served directly by Vite are in `public/`; imported assets are in `src/assets/`. Build output goes to `dist/` and should not be edited by hand.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server with HMR.
- `npm run build`: run TypeScript project checks, then create a production build.
- `npm run lint`: run Oxlint using `.oxlintrc.json`.
- `npm run preview`: serve the production build locally for review.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Name components and pages in `PascalCase` (`DashboardPage.tsx`, `GradientButton.tsx`), hooks with `use` prefixes, and general helpers in `camelCase`. Keep component-specific styles close to the component when possible; global CSS belongs in `src/index.css` or `src/App.css`. Follow the existing two-space JSON indentation and single-quote TypeScript style. Prefer existing UI primitives before adding new ones, and use `lucide-react` icons for controls when a matching icon exists.

## Testing Guidelines

No test framework is currently configured. Before adding behavioral changes, at minimum run `npm run lint` and `npm run build`. If tests are introduced, prefer colocated `*.test.ts` or `*.test.tsx` files near the code under test, and add the test command to `package.json` so contributors can run it consistently.

## Commit & Pull Request Guidelines

This checkout does not expose Git history, so no local commit convention can be inferred. Use short, imperative commit subjects such as `Add wallet empty state` or `Fix dashboard timer formatting`. Pull requests should include a concise description, screenshots for UI changes, manual verification steps, and linked issues when applicable.

## Security & Configuration Tips

Do not commit secrets, wallet keys, or environment-specific credentials. Keep generated folders such as `dist/`, `node_modules/`, `.tmp/`, and local log files out of review unless explicitly needed for debugging.

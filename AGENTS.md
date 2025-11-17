# Repository Guidelines

## Project Structure & Module Organization
The Next.js App Router lives under `app/`, while composable UI and forms sit in `components/`. Feature-specific hooks plus client state belong in `features/` or `context/`, and generic helpers (env, fetchers, schemas) live in `lib/`. Database schemas and migrations are managed through `drizzle/` beside `drizzle.config.ts`; automation utilities stay in `scripts/`. Static assets ship from `public/`, and localized copy is stored in `messages/` with settings in `i18n.config.ts`.

## Build, Test, and Development Commands
- `npm run dev` / `pnpm dev`: starts the dev server through `scripts/run-dev.mjs`.
- `npm run build`: regenerates the blog manifest, then builds the production bundle.
- `npm run start`: serves the built output exactly as Vercel will.
- `npm run lint`: Next.js + ESLint for formatting, imports, and type-aware checks.
- `npm run db:generate`, `db:migrate`, `db:push`, `db:studio`: Drizzle tasks for emitting SQL, applying migrations, syncing schema, and inspecting data.

## Coding Style & Naming Conventions
Author components in TypeScript; prefer server components unless a hook or browser API is required—mark those files with `"use client"`. Use PascalCase component names (`HeroSection.tsx`), camelCase helpers (`formatMessage`), and kebab-case directories. Tailwind utility classes are the default styling approach; consolidate reusable variants inside `components/ui` or `lib/utils`. Two-space indentation plus `next lint` act as the formatting source of truth.

## Testing Guidelines
No dedicated suite exists yet, so add coverage while you work. Co-locate unit tests as `<file>.test.tsx` and describe behavior-focused cases such as `it("renders CTA copy")`. If you add end-to-end tests, place Playwright specs under `tests/e2e/` and document their preconditions in the PR. Always list manual verification steps and attach screenshots or short clips for UI updates until CI is in place.

## Commit & Pull Request Guidelines
Commits follow short, imperative summaries (the history starts with `Initial commit`); keep messages scoped and squash noisy fixups. Every PR should explain the problem, link issues, describe testing, and mention required follow-up commands (e.g., “Run `npm run db:migrate` after deploy”). Include screenshots for visual changes, request a reviewer familiar with the feature, and keep diffs focused so they can be reviewed quickly.

## Security & Configuration Tips
Secrets belong in `.env.local` and should satisfy the variables referenced by Drizzle, auth helpers, and `middleware.ts`. Use the wrappers in `lib/s3` or server actions instead of direct SDK calls to prevent exposing credentials.

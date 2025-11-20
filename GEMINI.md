# Project Context: Sistine Starter (FindYourself)

## Overview
This project, **Sistine Starter** (repo name: `FindYourself`), is a **Next.js 14** AI SaaS starter kit designed for "Vibe Coding" (building with AI assistants). It features a production-ready stack including authentication, payments, database management, and AI integrations.

**Key Tech Stack:**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Framer Motion, shadcn/ui components
- **Database:** PostgreSQL (via `postgres` driver) with Drizzle ORM
- **Authentication:** Better Auth
- **Internationalization:** `next-intl`
- **Content:** MDX for blogs/docs

## Architecture

### Directory Structure
- **`app/`**: Next.js App Router pages and API routes.
    - **`[locale]/`**: Root layout for i18n support. Contains routes like `(auth)`, `(marketing)`, `(protected)`.
    - **`api/`**: Backend API endpoints (`admin`, `auth`, `chat`, `cron`, `findme`, `payments`, etc.).
- **`components/`**: React components.
    - **`ui/`**: Reusable UI components (buttons, inputs, etc.), likely following shadcn/ui patterns.
    - **`...`**: Feature-specific components (e.g., `blog-card.tsx`, `pricing.tsx`).
- **`lib/`**: Utility functions and shared logic.
    - **`db/`**: Database configuration (`index.ts`) and schema definition (`schema.ts`).
    - **`auth.ts`**: Authentication configuration.
    - **`facepp.ts`, `volcano-engine/`**: AI/Image processing integrations.
- **`drizzle/`**: Database migrations and snapshots.
- **`features/`**: Feature-based modular code organization (`auth`, `findme`, `marketing`, etc.).
- **`messages/`**: JSON files for i18n translations (`en.json`, `zh.json`).
- **`public/`**: Static assets.
- **`scripts/`**: Utility scripts (`setup-admin.ts`, `run-dev.mjs`).

## Development Workflow

### Prerequisites
- Node.js 18+
- PostgreSQL database
- `pnpm` (Package Manager)

### Setup & Installation
1.  **Install Dependencies:** `pnpm install`
2.  **Environment Variables:** Copy `.env.example` to `.env.local` and configure:
    - `DATABASE_URL`: PostgreSQL connection string.
    - `BETTER_AUTH_SECRET` & `BETTER_AUTH_URL`.
    - Third-party keys (Creem, Google Gemini, etc.).

### Key Commands
| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the development server (wraps `scripts/run-dev.mjs`). |
| `pnpm build` | Builds the application for production. |
| `pnpm db:push` | Pushes schema changes directly to the database (prototyping). |
| `pnpm db:generate` | Generates SQL migrations based on schema changes. |
| `pnpm db:migrate` | Applies generated migrations. |
| `pnpm db:studio` | Opens Drizzle Studio to view/edit data. |
| `pnpm admin:setup` | Runs the admin setup script. |
| `pnpm lint` | Runs ESLint. |

## Development Conventions

- **Database:** Use Drizzle ORM for all database interactions. Define schema in `lib/db/schema.ts`.
- **Styling:** Use Tailwind CSS utility classes.
- **Components:** specific UI components reside in `components/ui`. Business components are in `components/` or `features/`.
- **I18n:** All user-facing text should be internationalized using `next-intl`. Add keys to `messages/en.json` and `messages/zh.json`.
- **API:** API routes are located in `app/api/`.
- **AI features:** Logic for specific features like "FindMe" or "Photo Compression" is often located in `lib/` or `features/` and exposed via `app/api/`.

## Specific Features
- **FindMe:** Face search feature involving photo uploading and processing (`api/findme`, `api/photos`).
- **Billing:** Managed via `constants/billing.ts` and `api/payments`. Supports credit scheduling.
- **Blog:** MDX-based blog system with manifest generation.

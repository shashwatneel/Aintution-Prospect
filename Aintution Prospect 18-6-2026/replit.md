# Aintution Prospects

A full-stack premium CRM/prospect management web app for Aintution AI — track outreach pipelines with joyful glassmorphism design.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/aintution-prospects run dev` — run the frontend (port varies, proxied at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter routing, @clerk/react v6, framer-motion, sonner toasts, lucide-react, shadcn/ui
- API: Express 5, Clerk middleware via `@clerk/express` getAuth()
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/aintution-prospects/src/pages/` — all page components (Landing, Dashboard, Analytics, ProspectTable, CardSettings)
- `artifacts/aintution-prospects/src/App.tsx` — routing + Clerk provider setup
- `artifacts/aintution-prospects/src/index.css` — pastel glassmorphism theme, Nunito font
- `artifacts/api-server/src/routes/` — API routes (cards, messages, prospects, analytics)
- `lib/db/src/schema/` — Drizzle schema (cards, messageTemplates, prospects, messageStatuses)
- `lib/api-spec/` — OpenAPI spec, source of truth for API contracts
- `lib/api-client-react/` — generated React Query hooks (from codegen)
- `lib/api-zod/` — generated Zod validators (from codegen)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → React Query hooks + Zod validators. Always run `pnpm --filter @workspace/api-spec run codegen` after changing the spec.
- Clerk v6 for auth: uses `Show` component (when="signed-in"/"signed-out") instead of `SignedIn`/`SignedOut`. No `SignedIn`/`SignedOut` exports in v6.
- Always light mode: no dark mode anywhere — glassmorphism design with pastel colors only.
- Message templates belong to cards; message statuses belong to prospects (per-prospect, per-template tracking).
- CSV export via direct `<a href="/api/analytics/export-csv">` — no fetch-blob needed.

## Product

- **Landing page**: logo + hero image, click to sign in
- **Dashboard**: analytics hero image (→ /analytics) + card grid (→ /cards/:cardId)
- **Prospect Table** (/cards/:cardId): spreadsheet-style view with inline editing, status dropdowns, lead toggle, message columns with rendered text (#name substitution), tick-to-copy + done, countdown badges
- **Card Settings** (/cards/:cardId/settings): manage card name/image + message templates with days countdown config
- **Analytics**: per-card stats, status breakdown, message completion bars, overdue/due-today counts, CSV export

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Clerk v6: `SignedIn`/`SignedOut` don't exist — use `Show when="signed-in"` / `Show when="signed-out"`
- After changing DB schema: run `pnpm --filter @workspace/db run push` (dev) then update the OpenAPI spec and run codegen
- After changing lib packages: run `pnpm run typecheck:libs` before leaf artifact typechecks
- Do NOT run `pnpm dev` from workspace root — use restart_workflow or individual artifact dev commands

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk configuration (Replit-managed Clerk tenant)

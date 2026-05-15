# Staycay Admin

A multi-tenant SaaS platform for property owners to manage room/unit bookings, cleaning operations, and customer interactions in Malaysia.

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS (TypeScript) |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Frontend | Next.js 16 (App Router) + Tailwind CSS + shadcn/ui + Metronic template |
| Queue | BullMQ + Redis |
| Payments | Modular multi-gateway (Billplz, Fiuu — Stripe in Stage 2) |
| Storage | Cloudflare R2 / Supabase Storage |
| Monorepo | Turborepo + pnpm |

## Project Structure

```
apps/
  api/          NestJS backend
  portal/       Management portal (Next.js)
  web/          Customer booking site (Stage 2)
  mobile/       React Native Expo (Stage 3)

packages/
  database/     Prisma schema + client
  types/        Shared TypeScript types
  ui/           Shared component library
  utils/        Shared helpers
  config/       Base configs

docs/
  architecture/ System-level documentation
  modules/      Per-module specs
```

## Roadmap

| Stage | Scope | Status |
|---|---|---|
| 1 | Management portal (admin + merchant) | Portal UI complete (mock-only); backend pending |
| 2 | Customer site + loyalty + full channel sync + Stripe | Planned |
| 3 | Mobile apps (iOS + Android) | Planned |

### Current Build State

- **Portal frontend (`apps/portal`)** — every screen in dev plan Stages 3–8 is built and reads Faker-seeded data from `apps/portal/lib/mock/`. No API client, no fetch, no Prisma yet. See DL-020 in the decision log for context.
- **Backend (`apps/api`)** — not yet scaffolded. Dev plan Stages 1 and 2 are the next major chunk.
- **Role switcher** — `View as` dropdown in the header switches between Super Admin / Property Owner / Staff. Sidebar visibility and direct-URL access both respect the same allow-list (`apps/portal/lib/mock/route-access.ts`).

## Getting Started

```bash
pnpm install
pnpm dev
```

The portal runs at <http://localhost:3000>. Default login is the Metronic demo account (`demo@kt.com` / `demo123`); after auth, all data is mocked client-side — no DB needed yet.

## Documentation

- [System Overview](docs/architecture/system-overview.md) — start here
- [Development Plan](docs/development-plan.md) — 9-stage rollout
- [Data Models](docs/architecture/data-models.md) — Building, Guest, Channel, Booking, etc.
- [Business Rules](docs/architecture/business-rules.md) — BR-001..BR-G05..BR-CH06
- [API Contracts](docs/architecture/api-contracts.md) — endpoint shapes + error codes
- [Decision Log](docs/architecture/decision-log.md) — DL-001 to DL-020
- [Module Specs](docs/modules/) — auth, bookings, cleaning, channels, guests, listings, loyalty, merchants, notifications, payments, properties, users

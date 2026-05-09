# Staycay Admin

A multi-tenant SaaS platform for property owners to manage room/unit bookings, cleaning operations, and customer interactions in Malaysia.

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS (TypeScript) |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Frontend | Next.js (App Router) + Tailwind CSS |
| Queue | BullMQ + Redis |
| Payments | Billplz (FPX + cards) |
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
| 1 | Management portal (admin + merchant) | In progress |
| 2 | Customer site + loyalty + payments | Planned |
| 3 | Mobile apps (iOS + Android) | Planned |

## Getting Started

```bash
pnpm install
pnpm dev
```

## Documentation

- [System Overview](docs/architecture/system-overview.md)
- [Data Models](docs/architecture/data-models.md)
- [Business Rules](docs/architecture/business-rules.md)
- [API Contracts](docs/architecture/api-contracts.md)
- [Decision Log](docs/architecture/decision-log.md)

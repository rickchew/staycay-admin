# CLAUDE.md

> This file is loaded automatically by Claude Code at the start of every session.
> Keep it concise — link to detailed docs rather than duplicating content.

---

## Project: Property Booking Platform

A multi-tenant SaaS platform for property owners to manage room/unit bookings, cleaning, and customer interactions in Malaysia.

**Stack:** NestJS · PostgreSQL · Prisma · Next.js · Turborepo · TypeScript

---

## Required Reading Before Any Task

1. `docs/architecture/system-overview.md` — Stack, structure, conventions
2. `docs/architecture/data-models.md` — Entity relationships
3. `docs/architecture/business-rules.md` — Cross-cutting business logic
4. `docs/architecture/decision-log.md` — Why things are the way they are
5. `docs/modules/{relevant-module}.md` — For the module you're touching

---

## Key Conventions

- **Money** → `Decimal(10, 2)` always. Never `Float`. Currency: MYR.
- **IDs** → `cuid()` only. No auto-increment.
- **Dates** → Booking dates are `@db.Date`. Server tz: `Asia/Kuala_Lumpur`.
- **Soft delete** → `isActive: false`, never hard delete user-facing entities.
- **Multi-tenancy** → Always scope by `merchantId` from authenticated user. Never trust client.
- **Audit** → Every state-changing action writes to `audit_logs`.
- **Response shape** → `{ success, data, meta?, error? }` consistently.
- **API versioning** → All routes under `/api/v1/`.

---

## Module Structure (NestJS)

Every module follows this layered pattern:

```
Controller   → HTTP handling, validation, calls service
Service      → Business logic, no direct DB calls
Repository   → All Prisma queries
DTO          → Request/response shapes (class-validator)
```

Modules communicate via events (BullMQ), never via direct cross-module method calls.

---

## When Modifying Code

- **Stay in scope.** If asked to modify the `bookings` module, do not touch `payments` or others.
- **Update docs.** If you change business logic, update the relevant `/docs` file.
- **Add to decision log.** For architectural changes, append to `decision-log.md`.
- **Respect existing decisions.** Read the decision log before suggesting alternatives.
- **Test multi-tenancy.** Any new endpoint or query must be merchant-scoped.

---

## Roadmap

| Stage | Scope | Status |
|---|---|---|
| 1 | Management portal (admin + merchant) | In progress |
| 2 | Customer site + loyalty + full payments | Planned |
| 3 | Mobile apps (iOS + Android) | Planned |

---

## Repository Map

```
/apps
  /api          NestJS backend
  /portal       Management portal (Next.js)
  /web          Customer site (Next.js, Stage 2)
  /mobile       React Native (Stage 3)

/packages
  /database     Prisma schema + client
  /types        Shared TypeScript types
  /ui           Shared components
  /utils        Shared helpers
  /config       Base configs

/docs           ← read these before working
```

---

## Common Commands

```bash
pnpm install              # Install all deps
pnpm dev                  # Run all apps in dev mode
pnpm db:generate          # Regenerate Prisma client
pnpm db:migrate           # Run migrations
pnpm db:studio            # Open Prisma Studio
pnpm test                 # Run tests
pnpm lint                 # Lint all packages
```

---

## Don't

- Don't add merchant_id denormalization to bookings — always join through unit → listing → property → merchant
- Don't bypass guards for "convenience"
- Don't use `any` in TypeScript without explicit justification
- Don't write business logic in controllers — keep it in services
- Don't commit `.env` files or secrets
- Don't introduce new dependencies without checking existing alternatives

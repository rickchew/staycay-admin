# System Overview

> **This document is the entry point for any AI agent or developer joining the project.**
> Always load this file first when starting a new task.

---

## Platform Name
Property Booking Platform (working title)

## Purpose
A multi-tenant SaaS platform for property owners (merchants) to manage room/unit bookings, cleaning operations, and customer interactions. Built in stages — internal management first, then public-facing customer site, then mobile apps.

---

## Roadmap Stages

| Stage | Scope | Status |
|---|---|---|
| 1 | Management portal (admin + merchant) | In progress |
| 2 | Customer booking website + loyalty + payments | Planned |
| 3 | Mobile apps (iOS + Android) | Planned |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS (Node.js, TypeScript) |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Frontend | Next.js (App Router) + Tailwind CSS |
| Mobile | React Native (Expo) — Stage 3 |
| Queue | BullMQ + Redis |
| Cache | Redis |
| Auth | JWT (access + refresh) + RBAC |
| Payments | Billplz (Stage 1), Stripe (Stage 2) |
| Storage | Cloudflare R2 or Supabase Storage |
| Email | Resend or Postmark |
| Monorepo | Turborepo |
| Market | Malaysia (MYR, FPX, SSM compliance) |

---

## Monorepo Structure

```
/apps
  /api          NestJS backend — single API for all clients
  /portal       Next.js — management portal (admin + merchant)
  /web          Next.js — public customer booking site (Stage 2)
  /mobile       React Native Expo (Stage 3)

/packages
  /database     Prisma schema + generated client (shared)
  /types        Shared TypeScript interfaces and DTOs
  /ui           Shared component library
  /utils        Shared helpers (date, currency, formatting)
  /config       Base eslint, tsconfig, tailwind configs

/docs
  /architecture System-level documentation (this folder)
  /modules      Per-module business rules and specs
```

---

## Core Domain Hierarchy

```
Merchant
  └── Property (multiple per merchant)
        └── Listing (room type with quantity)
              └── ListingUnit (individual trackable unit)
                    └── Booking (daily-rate reservation)
                          ├── Payment
                          └── CleaningLog
```

**Key principle:** A `Listing` represents a *type* (e.g., "Soho Suite, qty 8"), and a `ListingUnit` represents each *physical instance* (Suite 101, Suite 102, etc.). Bookings are always tied to a specific `ListingUnit`, never to a `Listing` directly.

---

## User Roles

| Role | Description | Access Scope |
|---|---|---|
| `SUPER_ADMIN` | Platform owner | All merchants, all data |
| `MERCHANT_OWNER` | Business owner | Own merchant + properties only |
| `MERCHANT_STAFF` | Property staff | Assigned merchant only |
| `CUSTOMER` | Public booking user | Own bookings only |

Authorization is enforced via NestJS Guards using `@Roles()` decorators on controllers.

---

## Stage 1 Module Map

| Module | Purpose |
|---|---|
| `auth` | Login, JWT, refresh tokens |
| `users` | User management |
| `merchants` | Merchant + member management |
| `properties` | Property CRUD |
| `listings` | Listing + unit CRUD |
| `bookings` | Booking engine, availability |
| `cleaning` | Cleaning workflow |
| `payments` | Manual + Billplz integration |
| `notifications` | Email / in-app |

Stage 2 will add `loyalty`, `customers` (public profile), and full Billplz/Stripe payment flows.

---

## Cross-Cutting Concerns

- **Multi-tenancy** — Every query is scoped by `merchantId` via guards. Never trust client-provided merchant IDs.
- **Audit logging** — Every state-changing action writes to the `audit_logs` table.
- **Soft deletes** — Use `isActive: false` instead of hard deletes for user-facing entities.
- **Money** — Always store as `Decimal(10, 2)`. Never use `Float`. Currency is `MYR` by default.
- **Dates** — Booking dates are stored as `@db.Date` (no time component). Server timezone is `Asia/Kuala_Lumpur`.
- **IDs** — All IDs are `cuid()`. No auto-increment integers.

---

## Working with AI Agents

When delegating tasks to AI agents, always provide:
1. This `system-overview.md` file (root context)
2. The relevant `/docs/modules/*.md` for the task domain
3. The target module folder in `/apps/api/src/modules/{name}/`
4. Explicit scope: "Modify only this module. Do not touch others."

See `decision-log.md` for *why* certain choices were made — agents must respect these decisions and not regress them.

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
| Frontend | Next.js (App Router) + Tailwind CSS + shadcn/ui |
| Mobile | React Native (Expo) — Stage 3 |
| Queue | BullMQ + Redis |
| Cache | Redis |
| Auth | JWT (access + refresh) + RBAC |
| Payments | Modular gateway system (Billplz, Fiuu, Stripe, etc.) |
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
  /ui           Shared component library (promoted shadcn/ui components used across apps)
  /utils        Shared helpers (date, currency, formatting)
  /config       Base eslint, tsconfig, tailwind configs

/docs
  /architecture System-level documentation (this folder)
  /modules      Per-module business rules and specs
```

---

## Core Domain Hierarchy

```
Building (physical structure — DL-014, may host multiple merchants)
  └── Property (one merchant's slice of the building)
        └── Listing (room type with quantity)
              └── ListingUnit (individual trackable unit)
                    └── Booking (daily-rate reservation)
                          ├── Payment
                          └── CleaningLog

Merchant ──owns──> Property (1:N)
Guest    ──per-merchant── linked from Booking via guestId (DL-015)
Channel  ──global registry── tagged on every Booking via channelCode (DL-016)
```

**Key principles:**
- A `Listing` represents a *type* (e.g., "Soho Suite, qty 8"); a `ListingUnit` represents each *physical instance* (Suite 101, Suite 102, etc.). Bookings are always tied to a specific `ListingUnit`, never to a `Listing` directly.
- `Building` sits **above** `Property` so a single physical structure with multiple operators (e.g. Stirling Suite Miri — three independent merchants) has a place to share address, common-area photos, and produce cross-merchant aggregate views.
- `Guest` rows are per-merchant — same email at two operators = two separate Guest records. Bookings carry a snapshot of guest contact fields *and* a `guestId` pointing at the Guest row.
- `Channel` is a global registry (DIRECT / AGODA / BOOKING_COM / AIRBNB / EXPEDIA / OTHER). Every Booking is tagged with one. Full OTA sync is Stage 2 of the product roadmap.

---

## User Roles

| Role | Description | Access Scope |
|---|---|---|
| `SUPER_ADMIN` | Platform owner | All merchants, all data |
| `PROPERTY_OWNER` | Business owner | Own merchant + properties only |
| `STAFF` | Property staff | Assigned merchant only |
| `CUSTOMER` | Public booking user | Own bookings only |

Authorization is enforced via NestJS Guards using `@Roles()` decorators on controllers.

---

## Stage 1 Module Map

| Module | Purpose |
|---|---|
| `auth` | Login, JWT, refresh tokens |
| `users` | User management |
| `merchants` | Merchant + member management |
| `buildings` | Shared physical structures (DL-014) |
| `properties` | Property CRUD |
| `listings` | Listing + unit CRUD |
| `bookings` | Booking engine, availability |
| `guests` | Per-merchant guestbook (DL-015) |
| `channels` | Channel registry + origin tagging (DL-016, MVP scope) |
| `cleaning` | Cleaning workflow |
| `payments` | Modular multi-gateway payments |
| `notifications` | Email / in-app |

Stage 2 will add `loyalty`, `customers` (public profile), full channel sync, and additional payment gateways.

---

## Current Build State

The **portal frontend (`apps/portal`) is built as a mock-only layer** ahead of the API (see DL-020). Every screen the dev plan calls for in Stages 3–8 exists, reads Faker-seeded data from `apps/portal/lib/mock/`, and visibly demonstrates the full UX picture. The NestJS API has not been scaffolded yet — that's the next major piece of work (dev plan Stages 1–2).

### Portal sidebar map
- **Dashboard** — `/` (KPIs, Channel Mix, Revenue, Next check-in, Recent Bookings)
- **Calendar** — `/calendar` (units × dates occupancy grid, property + channel filters)
- **Operations**
  - Bookings — `/bookings`, `/bookings/[id]`
  - Cleaning — `/cleaning` (drag-and-drop kanban)
  - Notifications — `/notifications`
- **Inventory**
  - Listings — `/listings` (Flat / By property / By building grouping)
  - Buildings — `/buildings`, `/buildings/[id]` *(SUPER_ADMIN only)*
- **Administration** *(SUPER_ADMIN only for Merchants & Users; Guests visible to all)*
  - Merchants — `/admin/merchants`, `/admin/merchants/[id]`
  - Guests — `/guests`, `/guests/[id]`
  - Users — `/admin/users`
- **Settings** *(SUPER_ADMIN + PROPERTY_OWNER)*
  - Merchant Profile — `/settings/profile`
  - Team Members — `/settings/members`
  - Payment Gateways — `/settings/payment-gateways`

Sidebar visibility and direct-URL access both follow the role allow-list in `apps/portal/lib/mock/route-access.ts` (DL-018).

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

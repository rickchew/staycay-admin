# Decision Log

> Architectural decisions with rationale. AI agents must respect these — never regress.
> When making new architectural decisions, append a new entry here.

---

## DL-001 — Stack: NestJS + PostgreSQL over Laravel + MySQL
**Date:** 2026-05-09
**Status:** Accepted

### Context
Choosing between staying with familiar Laravel + MySQL or moving to NestJS + PostgreSQL for a new property booking SaaS platform with planned mobile apps.

### Decision
Adopt NestJS + PostgreSQL.

### Rationale
- TypeScript end-to-end (backend, frontend, mobile) reduces context-switching
- NestJS module architecture is purpose-built for SaaS scale
- PostgreSQL row-level security supports cleaner multi-tenancy
- Native WebSocket support for future real-time features (room status, IoT)
- AI agent code generation quality is significantly higher for NestJS/TS than Laravel/PHP
- This is a personal project — learning curve cost is one-time

### Trade-offs Accepted
- 3–5 weeks team ramp time
- More upfront architectural decisions required
- Migration cost from any existing CodeIgniter codebase

---

## DL-002 — Listing vs ListingUnit Split
**Date:** 2026-05-09
**Status:** Accepted

### Context
Listings can be either single-unit (e.g., "Entire Villa") or multi-unit (e.g., "Soho Suite, qty 8"). Need to track individual unit availability.

### Decision
Separate `Listing` (the type/category) from `ListingUnit` (the physical instance).

### Rationale
- Bookings reference specific units, not just listing types
- Each unit can have a merchant-defined name (e.g., "Suite 101")
- Summary views show `booked/total` count from listing
- Detail views show per-unit status grid
- Single-unit listings still get a `ListingUnit` row (qty 1) — no special-case logic

### Implementation Note
Listing has an `isSingle` boolean to drive UI rendering, but the underlying data model is uniform.

---

## DL-003 — Daily Rate Snapshot on Booking
**Date:** 2026-05-09
**Status:** Accepted

### Context
Listing prices change over time. Historical bookings need stable pricing.

### Decision
Copy `dailyRate` from `Listing` to `Booking` at creation. Never join back to Listing for price.

### Rationale
- Audit trail and customer disputes need historical accuracy
- Reporting queries are simpler (no point-in-time joins)
- Prevents accidental price changes affecting confirmed bookings

### Trade-off
Slight denormalization. Acceptable because pricing history matters more than DRY.

---

## DL-004 — Single User Table with Role Field
**Date:** 2026-05-09
**Status:** Accepted

### Context
Platform has 4 user types: SUPER_ADMIN, MERCHANT_OWNER, MERCHANT_STAFF, CUSTOMER.

### Decision
One `users` table with a `role` enum field. Use `MerchantMember` join table for merchant-scoped users.

### Rationale
- Single auth flow for all users
- Easier to upgrade/downgrade roles
- Simpler audit logging
- Customers may later become merchants — same record

### Alternative Rejected
Separate tables per user type would force duplicate auth logic and complicate role changes.

---

## DL-005 — Monorepo via Turborepo
**Date:** 2026-05-09
**Status:** Accepted

### Context
Project will have API, management portal, customer site, and mobile app — all sharing types and possibly UI components.

### Decision
Monorepo with Turborepo. Shared `database`, `types`, `ui`, `utils` packages.

### Rationale
- Prisma schema lives in one place, generates client used by all apps
- TypeScript types (DTOs, enums) shared across frontend and backend
- One `pnpm install` sets up everything
- Turborepo caches builds for fast CI

### Trade-off
Slightly more complex initial setup. Acceptable given multi-app roadmap.

---

## DL-006 — Prisma over TypeORM
**Date:** 2026-05-09
**Status:** Accepted

### Context
Need an ORM for NestJS + PostgreSQL.

### Decision
Use Prisma.

### Rationale
- Schema-first — single source of truth in `schema.prisma`
- Generated TypeScript types are far better than TypeORM decorators
- Migration tooling is more reliable
- Better DX for AI agents (cleaner query syntax)
- Schema file is human-readable and serves as documentation

---

## DL-007 — Billplz First, Stripe Second
**Date:** 2026-05-09
**Status:** Superseded by DL-011

### Context
Malaysian market needs FPX (online banking) which is the dominant payment method.

### Decision
Integrate Billplz for Stage 1 (FPX + cards). Add Stripe in Stage 2 for international cards and recurring loyalty.

### Rationale
- Billplz is the established Malaysian SME gateway
- Simple API, fast onboarding
- FPX coverage essential for local customers
- Stripe added later for international expansion + recurring payments

### Superseded
Replaced by DL-011 — modular multi-gateway architecture. The platform now supports multiple gateways from day one rather than hardcoding Billplz first.

---

## DL-008 — Audit Log from Day One
**Date:** 2026-05-09
**Status:** Accepted

### Context
Booking platforms have disputes. Without audit trail, support cannot resolve issues.

### Decision
Implement `audit_logs` table from day one. Wire via NestJS interceptor on all mutating endpoints.

### Rationale
- Cheap insurance — every state change is recoverable
- Dispute resolution requires before/after state
- Compliance and trust

### Implementation Note
Stored as JSON `before`/`after` snapshots, not as event sourcing. Full event sourcing is overkill for current scale.

---

## DL-009 — Loyalty Schema Dormant in Stage 1
**Date:** 2026-05-09
**Status:** Accepted

### Context
Loyalty is Stage 2, but adding tables later requires migration coordination.

### Decision
Include loyalty tables in initial schema. Do not create rows or wire endpoints until Stage 2.

### Rationale
- No migration needed when activating Stage 2
- Schema review happens once, not twice
- Forward-thinking design

---

## DL-010 — Soft Deletes via `isActive`
**Date:** 2026-05-09
**Status:** Accepted

### Context
Hard deletes break audit trails and break foreign key relationships.

### Decision
User-facing entities (User, Merchant, Property, Listing, ListingUnit) use `isActive: boolean` instead of hard delete. Inactive records are filtered out at the service layer.

### Rationale
- Preserves historical bookings linked to "deleted" listings
- Allows reactivation
- Simpler than `deletedAt` timestamps for current needs

### Exception
`RefreshToken` and `Notification` use hard deletes — no audit value.

---

## DL-011 — Modular Multi-Gateway Payment Architecture
**Date:** 2026-05-09
**Status:** Accepted (supersedes DL-007)

### Context
Different merchants prefer different payment gateways. Some need Billplz for FPX, others use Fiuu for card processing. A single merchant may want both. Hardcoding gateway order (Billplz first, Stripe later) doesn't support this.

### Decision
Design the payment system as a modular gateway registry. Each gateway implements a common `PaymentGateway` interface. Merchants configure their own gateway credentials via `PaymentGatewayConfig` records — one per gateway per merchant. Gateways can be added by implementing the interface and registering in the gateway registry, with zero changes to the service layer.

### Rationale
- Merchants in Malaysia use a mix of Billplz, Fiuu, and manual payments — forcing one gateway doesn't work
- A merchant can enable Billplz for FPX and Fiuu for international cards simultaneously
- Adding a new gateway (e.g., Stripe, SenangPay) requires only: (1) implement the interface, (2) add webhook controller, (3) register in the gateway registry
- Per-merchant credentials stored in `PaymentGatewayConfig` with encrypted JSON — no env vars per gateway per merchant
- Service layer is fully gateway-agnostic: it calls `gateway.initiate()`, `gateway.verifyWebhook()`, `gateway.parseWebhook()` without knowing which gateway it's talking to

### Trade-offs Accepted
- More upfront complexity than hardcoding Billplz
- Credential encryption adds a layer of indirection
- Each new gateway needs its own webhook controller (webhooks have different payload shapes and signature mechanisms)

### Implementation Notes
- Gateway interface: `initiate`, `verifyWebhook`, `parseWebhook`, `refund`
- Gateway registry: `Map<GatewayName, PaymentGateway>` — injected via NestJS DI
- Webhook routing: `/api/v1/webhooks/:gateway` with per-gateway controllers
- `MANUAL` is a special gateway that skips initiation and sets status to PAID immediately
- `credentials` JSON shape varies per gateway — validated at config creation time using gateway-specific schemas

---

## DL-012 — shadcn/ui as Admin Portal Component System
**Date:** 2026-05-10
**Status:** Accepted

### Context
The management portal (`/apps/portal`) needed a component library. Tailwind CSS alone provides utilities but not pre-built accessible components (modals, tables, forms, date pickers). A consistent, opinionated component system reduces duplication and keeps UI coherent.

### Decision
Adopt shadcn/ui for the admin portal. Components live in `/apps/portal/components/ui/` (shadcn's copy-in pattern). Components needed across multiple apps are promoted to `packages/ui/`.

### Rationale
- shadcn/ui is copy-paste, not a dependency — full ownership of component code
- Built on Radix UI primitives (WAI-ARIA accessibility out of the box)
- Tailwind-native — zero extra CSS paradigm to learn
- Excellent TypeScript support
- Components are customisable without fighting a library's internal API

### Trade-offs Accepted
- Components must be manually updated when shadcn releases new versions (no npm upgrade path)
- Slightly more boilerplate than a traditional component library like MUI or Chakra

### Implementation Notes
- Install via: `npx shadcn@latest init` in `/apps/portal`
- Component source lives at `/apps/portal/components/ui/`
- If a component is needed in both portal and web (Stage 2), promote it to `packages/ui/`
- Do not run `shadcn init` inside `packages/ui` — shadcn requires a Next.js app context

---

## DL-013 — Cloudflare Workers for Admin Portal Hosting
**Date:** 2026-05-11
**Status:** Accepted

### Context
Need a hosting platform for the Next.js admin portal (`apps/portal`).

### Decision
Deploy `apps/portal` to Cloudflare Workers via the OpenNext adapter (`@opennextjs/cloudflare`). Next.js upgraded from 15.0.4 to 16.x as required by the adapter.

### Rationale
- Cloudflare Workers provides edge deployment close to Malaysian users
- OpenNext is the officially recommended adapter (replaces deprecated `@cloudflare/next-on-pages`)
- No server infrastructure to manage

### Trade-offs Accepted
- `next/image` optimisation disabled (`unoptimized: true`) — Workers does not support the Node.js image pipeline
- Node.js-only APIs unavailable at runtime; all DB access must go through the NestJS API

---

## Template for New Entries

```
## DL-NNN — Title
**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Superseded by DL-XXX | Deprecated

### Context
What problem prompted this decision?

### Decision
What did we decide?

### Rationale
Why this choice over alternatives?

### Trade-offs Accepted
What are we giving up?
```

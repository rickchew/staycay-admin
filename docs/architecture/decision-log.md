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
**Status:** Accepted

### Context
Malaysian market needs FPX (online banking) which is the dominant payment method.

### Decision
Integrate Billplz for Stage 1 (FPX + cards). Add Stripe in Stage 2 for international cards and recurring loyalty.

### Rationale
- Billplz is the established Malaysian SME gateway
- Simple API, fast onboarding
- FPX coverage essential for local customers
- Stripe added later for international expansion + recurring payments

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

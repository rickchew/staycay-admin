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
Platform has 4 user types: SUPER_ADMIN, PROPERTY_OWNER, STAFF, CUSTOMER.

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

## DL-014 — Building Entity Above Property (Option A)
**Date:** 2026-05-15
**Status:** Accepted

### Context
A single physical building can host multiple merchants (e.g. Stirling Suite Miri has three independent operators on different floors). The original `Property` model assumed a one-merchant-per-physical-place mapping, which lost the "same building" relationship and made cross-merchant operational views impossible (shared lobby info, joint occupancy summary, etc.).

### Decision
Introduce a `Building` entity above `Property`. `Building` represents the physical structure (address, postcode, GPS, shared photos, common-area info). `Property` becomes "a merchant's slice of that building" and keeps merchant-specific operational fields (check-in/out times, settings). One `Property` still belongs to one `Merchant` — the multi-tenancy invariant is preserved.

### Rationale
- Matches the OTA/hotel mental model where a building can carry multiple operators
- Lets the SUPER_ADMIN see aggregate occupancy and owners-list for a building (Stirling case)
- Shared metadata (common-area photos, parking, building WiFi, building notes) has a clean home instead of being denormalised across each merchant's Property
- Property → Merchant remains 1:1, so audit logs, RBAC, soft-delete rules are untouched

### Alternatives Rejected
- **Option B — `Property.buildingId` tag only** (no Building entity). Cheaper today but no place for shared metadata; would require migration later when shared building info became needed.
- **Option C — Multi-tenant Property** (Property owned by multiple merchants via a junction table). Breaks the single-merchant-ownership invariant relied on by every other module. Massive blast radius.

### Implementation Notes
- Properties on the same building share `buildingId`. UI aggregates via `getMerchantStats(merchantId)` for owners table and per-building occupancy.
- Building creation policy is "SUPER_ADMIN onboards buildings; merchants link properties to existing Building records" (others can be added later if needed).
- `/buildings` and `/buildings/[id]` portal routes (admin-only visibility in the sidebar).

---

## DL-015 — Guestbook as a First-Class Per-Merchant Entity
**Date:** 2026-05-15
**Status:** Accepted

### Context
Before this decision, guest info (name/email/phone) lived inline on each `Booking` row. There was no way to view a guest's stay history, mark a guest VIP or blacklisted, or feed a future loyalty programme. Guest data also crossed merchant boundaries when the same person stayed at two different operators.

### Decision
Introduce a `Guest` entity scoped by `merchantId`. Guests are not created directly — they are upserted by the bookings flow via find-or-create on `(merchantId, email)` (falling back to `(merchantId, phone)` for walk-ins). The same email at two different merchants produces two independent Guest rows.

Per-merchant fields include VIP flag, blacklist flag + reason, identity (NRIC/Passport), nationality, and denormalised counters (`totalBookings`, `totalSpent`, `firstBookingAt`, `lastBookingAt`).

### Rationale
- Per-merchant scoping aligns with the rest of the tenancy model — no merchant can read another merchant's guest list
- Find-or-create from bookings ensures the guestbook is always populated correctly without needing a separate "Add Guest" UI
- Booking rows still snapshot `guestName/guestEmail/guestPhone` for historical accuracy (BR-G02) — the Guest profile reflects current contact info
- Forms the foundation for the Stage 2 Loyalty module (per `LoyaltyAccount` per `Guest`)

### Trade-offs Accepted
- Denormalised counters need a reconciliation job to repair drift (nightly cron)
- No global "is this guest blacklisted at any merchant" concept; each merchant maintains their own list

### Implementation Notes
- Endpoints under `/guests` are read + patch only — explicitly **no** `POST /guests`. Listed under Administration in the sidebar (visible to all roles).
- Blacklist enforcement happens at booking creation: `POST /bookings` rejects with `GUEST_BLACKLISTED` if the resolved guest is blacklisted at this merchant (BR-G04).

---

## DL-016 — Channel Registry with MVP Origin Tagging
**Date:** 2026-05-15
**Status:** Accepted

### Context
Property operators frequently list their inventory on multiple OTAs (Agoda, Booking.com, Airbnb, Expedia). Full channel-manager sync (rate push, availability push, inbound booking webhooks) is a heavy, expensive integration that doesn't fit Stage 1 scope. But operators still need to know *which channel* each booking came from — for commission reporting, performance review, and reconciliation.

### Decision
Split channel support into two phases:
- **MVP (Stage 6):** A global `Channel` registry seeded with `DIRECT`, `AGODA`, `BOOKING_COM`, `AIRBNB`, `EXPEDIA`, `OTHER`. Every `Booking` carries a `channelCode` (defaulting to `DIRECT`) and an optional `externalBookingRef` free-text field. Staff tags the channel at booking creation. Dashboard surfaces a channel-mix breakdown.
- **Stage 2 of product roadmap:** `ChannelAccount` (encrypted per-merchant credentials, mirroring `PaymentGatewayConfig`), `ChannelListing` (per-listing mapping to the channel's external listing id with rate adjustment %), outbound availability/rate push, inbound webhooks, channel-aware cancellation propagation, and reconciliation jobs.

### Rationale
- The MVP is essentially zero-cost — adding two fields to `Booking` and a seeded enum-like table buys us channel reporting from day one
- Full sync is deferred because each OTA has its own API, signature scheme, and quirks; building all four at once would block Stage 1
- The Stage 2 architecture reuses the `PaymentGatewayConfig`/encryption pattern, so when we activate it there's no fresh design work

### Implementation Notes
- `DIRECT` is always present and always available — used for walk-ins, phone bookings, and own-website reservations
- Channel chip + icon UI uses Booking.com and Airbnb SVGs already shipped in Metronic's brand-logos folder; other channels render a colour-coded initial badge (e.g. red "A" for Agoda)
- Bookings list, booking detail, calendar, and dashboard Channel Mix widget all consume the same `getChannel(code)` helper

---

## DL-017 — Sidebar Inventory Consolidation (Listings as Primary)
**Date:** 2026-05-15
**Status:** Accepted

### Context
The initial sidebar exposed both "Properties" and "Listings" as parallel top-level inventory destinations. In practice every operational concern (bookings, payments, cleaning) terminates at a listing/unit, not at a property. Operators reported confusion: "do I add the new room under Properties or Listings?".

### Decision
Drop `/properties` from the sidebar. `Listings` becomes the single inventory entry point, with grouping toggles `Flat / By property / By building` so the operator can pivot the same data without switching menus. Property pages remain reachable via drill-through links (clicking a property name in a listing row or a building's owners table). Building gets its own admin-only sidebar entry under Inventory.

### Rationale
- Listings are the operational unit — bookings, availability, pricing, channel-mappings all live there
- Properties and Buildings are organisational layers users browse *into*, not parallel concepts to choose between
- A grouping toggle on `/listings` exposes the spatial hierarchy without forcing a separate top-level destination

### Trade-offs Accepted
- Operators have to learn the "click into a listing to see the property" flow
- The bare `/properties` URL still exists as a reachable route, just not in the sidebar — accepted for now, can be revisited

---

## DL-018 — Role-Aware Sidebar + Route Guards (Single Allow-List)
**Date:** 2026-05-15
**Status:** Accepted

### Context
Three Staycay roles (`SUPER_ADMIN`, `PROPERTY_OWNER`, `STAFF`) need different navigation surfaces. Earlier we only filtered the sidebar visually — direct URL access (typing `/admin/users` while logged in as STAFF) still worked because no route guard ran.

### Decision
Centralise the role-to-path allow-list in `apps/portal/lib/mock/route-access.ts`. Both the sidebar filter and a client-side `RoleRouteGuard` consume the same predicate `isPathAllowedForRole(path, role)`. The guard wraps the protected layout's children and redirects to `/` if the current role can't reach the path. Section headings whose items are all filtered out are dropped from the sidebar (no orphan "ADMINISTRATION" header).

Allow-list rules:
- `SUPER_ADMIN` — everything
- `PROPERTY_OWNER` — everything except `/admin/*` and `/buildings`
- `STAFF` — everything except `/admin/*`, `/buildings`, and `/settings/*`

### Rationale
- One source of truth — adding a new admin-only route is a single-line change in `route-access.ts`
- The portal still mocks the API, so the guard is a client-side UX layer; real enforcement will live in the NestJS `RolesGuard` (Stage 2 of dev plan) using the same predicate semantics
- Empty-section heading suppression avoids the "ADMINISTRATION (nothing visible)" anti-pattern

---

## DL-019 — Calendar Feature as Operational Anchor
**Date:** 2026-05-15
**Status:** Accepted

### Context
The bookings list answers "what's on the books" but not "is this unit free on these dates" at a glance. PMS/OTA users expect a 2D occupancy grid (units × dates) as the daily operational view.

### Decision
Add a `/calendar` route directly below Dashboard in the sidebar. The page renders a 14-day occupancy grid where each row is a `ListingUnit` and each column is a date. Status-coloured pills span `checkIn → checkOut`. The toolbar carries property and channel filters, week pagination, and an occupancy ratio badge (occupied unit-nights ÷ total).

### Rationale
- This is the screen operators glance at first every morning — putting it second in the sidebar mirrors that
- Reuses the existing `Booking.unitId` linkage; no new schema is needed
- Filters reuse the channel registry (DL-016) and the existing property list

### Implementation Notes
- Date math via `date-fns` (already a Metronic dependency)
- Clicking a booking pill drills to `/bookings/[id]`
- Today's column gets a primary-coloured ring; weekend columns get a subtle background
- A property-aware filter narrows the rows; a channel filter narrows the rendered bookings (and recomputes occupancy stats)

---

## DL-020 — Mock-Only Frontend Stage Before Backend
**Date:** 2026-05-15
**Status:** Accepted

### Context
The dev plan sequences API (Stage 1–2) before portal (Stage 3+). In practice, building all portal screens against `lib/mock` (Faker-seeded data, no network) lets us validate the full UX picture before committing API endpoint shapes.

### Decision
The current `apps/portal` is a **mock-only build**. All entities (Merchants, Users, Guests, Properties, Listings, Bookings, Payments, Cleaning logs, Notifications, Buildings, Channels) live as Faker-generated TypeScript arrays in `apps/portal/lib/mock/`. Pages import the arrays directly — no `fetch`, no API client, no Prisma. The role switcher persists to `localStorage` (`staycay.role` key). Create/edit buttons are deliberately no-ops (forms not wired).

When the NestJS API lands (dev plan Stages 1 + 2), the migration path is:
1. Replace each `MOCK_*` import with a typed API client call (`apiFetch('/api/v1/...')`)
2. Move stateful data (cleaning column moves, role switcher) behind a real backend
3. Wire create/edit forms to the corresponding endpoints

The page shapes, route hierarchy, role rules, and component composition do not change — that's the whole point of doing UI first.

### Rationale
- The dashboard, calendar, channel mix, multi-owner building view, guest-blacklist warning banner — none of these are obvious from looking at the data model. Building them against mocks surfaced real layout and information-density decisions
- Architecture docs (data-models.md, business-rules.md, api-contracts.md) were extended *because* the UI work asked questions the docs hadn't answered
- The next agent picking this up has a complete UX to work back from

### Trade-offs Accepted
- Forms (Add booking, Add gateway, Edit merchant, etc.) are visible CTAs that don't do anything yet — documented in this entry rather than hidden, so the gap is explicit
- Cleaning column moves and role switcher state are client-only and don't persist across browser sessions

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

# Staycay Admin — Development Plan

> A 9-stage incremental development plan for the Staycay Admin platform.
> Each stage is designed to run independently and deliver a demonstrable, testable slice of functionality.

---

## Overview

| Stage | Focus | Independently Demonstrable Outcome |
|---|---|---|
| 1 | Monorepo, infrastructure & database schema | `pnpm db:studio` opens with full schema; CI green |
| 2 | NestJS bootstrap + auth + multi-tenancy guards | All auth flows + guards + audit logging provable via curl/e2e |
| 3 | Next.js portal shell + login + auth session | Login → empty dashboard → logout works |
| 4 | Users, merchants & members management | SUPER_ADMIN creates merchant + owner; staff added; tenancy enforced |
| 5 | Properties, listings & units | Merchant creates property, listing with N units; availability API works |
| 6 | Booking engine + manual payments + guestbook + channel tagging | Full cash-booking lifecycle (create → pay → confirm → check-in → check-out) plus per-merchant guest list with history, VIP, blacklist, and channel-origin tagging (Agoda / Booking.com / Airbnb / Direct) |
| 7 | Cleaning workflow + notifications | Cleaning queue auto-populates on checkout; emails fire on events |
| 8 | Multi-gateway online payments | Billplz + Fiuu live alongside manual payments |
| 9 | Deployment, observability & hardening | Portal on Cloudflare Workers, API on managed host, production-ready |

---

## Guiding Principles

- **Independent stages.** Each stage delivers something demonstrable on its own. Stage N+1 builds on N, but failure in a later stage never breaks an earlier one.
- **No retro-fitting.** Cross-cutting concerns (audit, multi-tenancy, queue, schema) land in early stages so later stages inherit them for free.
- **Tested at the boundaries.** Each stage has an explicit "runs independently" criterion that should be the acceptance test.
- **Respect the decision log.** All choices (NestJS, Prisma, shadcn/ui, modular payments, Cloudflare Workers, etc.) trace to existing entries in `decision-log.md`.

---

## Stage 1 — Monorepo, Infrastructure & Database Schema

**Focus:** Turborepo · pnpm · Docker · Prisma full schema · CI baseline

### Tasks

- Scaffold Turborepo with pnpm workspaces: `apps/api`, `apps/portal`, `packages/{database, types, ui, utils, config}`
- `packages/config`: base tsconfig, eslint, prettier, tailwind — all apps extend from here
- `docker-compose.yml`: PostgreSQL 16, Redis 7, with named volumes and healthchecks
- `packages/database`: complete Prisma schema from `data-models.md` — `User`, `Merchant`, `MerchantMember`, `Property`, `Listing`, `ListingUnit`, `Booking`, `Payment`, `PaymentGatewayConfig`, `CleaningLog`, `LoyaltyAccount`, `LoyaltyTransaction` (dormant), `Notification`, `AuditLog`, `RefreshToken`
- Run initial migration, verify all FKs, indexes (composite indexes on `bookings.checkIn+checkOut`, `audit_logs.entity+entityId`, etc.) and partial unique on `(merchantId, gateway, isDefault)` where `isDefault=true`
- Per-year sequence for booking ref: create `booking_ref_seq_YYYY` pattern + helper migration
- GitHub Actions baseline: `pnpm install` + lint + typecheck + Prisma validate on every push
- `.env.example` files per app, root `.gitignore`, husky pre-commit hook (lint-staged)
- README updated with: `pnpm install` → `docker compose up -d` → `pnpm db:migrate` → `pnpm dev`

### Deliverables

Turborepo + pnpm · Docker stack · Full Prisma schema · CI lint/typecheck · Dev bootstrap docs

### Runs Independently

No app code yet — but `pnpm db:studio` opens Prisma Studio with all tables visible. CI passes on a fresh clone. This stage proves the foundation works without committing to any module logic.

### Rationale

Includes the full schema (incl. dormant loyalty tables per DL-009) so no migration is ever needed later. CI baseline added early to catch issues at the source.

---

## Stage 2 — NestJS Bootstrap + Auth + Multi-Tenancy Guards

**Focus:** JWT · Refresh rotation · RolesGuard · MerchantGuard · Audit interceptor

### Tasks

- Bootstrap NestJS in `apps/api` — `AppModule`, `ConfigModule` with validation, global `ValidationPipe` (class-validator)
- `PrismaModule` wrapping `packages/database` client — singleton, with `onModuleInit`/`onModuleDestroy`
- Global exception filter producing `{ success, data, error }` shape with proper HTTP codes (400/401/403/404/409/422/500)
- Auth module: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`
- Access token (15min) in Authorization header; refresh token (7d) HTTP-only secure cookie, stored in `refresh_tokens`, rotated on every refresh
- `JwtAuthGuard`, `RolesGuard` with `@Roles()` decorator, `@CurrentUser()` decorator
- `MerchantGuard` — resolves `merchantId` via `MerchantMember.findUnique({where:{userId}})` at runtime (never trusts client, never in JWT — per `auth.md`)
- `AuditInterceptor` — wraps every mutating route, captures before/after JSON snapshots, writes to `audit_logs` via BullMQ queue (non-blocking)
- BullMQ + Redis wired: queues for audit-log, notifications, payment-events (just the plumbing, no real consumers yet)
- Seed script: SUPER_ADMIN + one PROPERTY_OWNER + one Merchant + one MerchantMember linking them — for every later stage to use
- e2e test suite skeleton with supertest: login → refresh → logout flow + 401 on missing token + 403 on wrong role

### Deliverables

Auth endpoints · JWT + refresh rotation · 3 guards (Jwt, Roles, Merchant) · AuditInterceptor · BullMQ infra · Seed script · e2e test harness

### Runs Independently

API runs against Postgres + Redis only. curl/Postman or the e2e tests prove every guard, every error code, and the audit log writing — all in isolation, with no business modules to break.

### Rationale

`MerchantGuard` + `AuditInterceptor` + BullMQ land here instead of being scattered across later stages. This makes every subsequent module benefit from these rails without needing rework.

---

## Stage 3 — Next.js Portal Shell + Login + Auth Session

**Focus:** shadcn/ui · App Router · API client · Role-aware layout

### Tasks

- Bootstrap Next.js 16 in `apps/portal` (App Router, TS, Tailwind) — pin to 16.x per DL-013
- shadcn/ui init in `apps/portal` — components in `apps/portal/components/ui/` (DL-012)
- Typed API client in `apps/portal/lib/api.ts` — uses fetch wrapper with automatic `{ success, data, error }` unwrapping
- Auth session provider (Zustand or React context): stores user + role + access token in memory; refresh token lives in HTTP-only cookie set by API
- Silent token refresh: on any 401, call `/auth/refresh`, retry the original request once
- Login page `/login`: shadcn Form + Input + Button, error toasts, redirect to `/` on success
- Root layout: server-side check via `/auth/me`, redirect to `/login` if unauthenticated
- Role-aware sidebar component: links rendered conditionally — SUPER_ADMIN sees `/admin/*`, MERCHANT_* sees operational links, hides anything they cannot access
- Header with user menu (display name, role badge, logout)
- Empty dashboard page `/` showing a "Welcome" card with the logged-in user info — proves the whole chain works
- Configure `@opennextjs/cloudflare` adapter + `images.unoptimized=true` (DL-013), even though local dev still uses `next dev`

### Deliverables

Portal scaffold · shadcn/ui installed · API client lib · Auth session + silent refresh · Login page · Role-aware shell

### Runs Independently

Portal runs against the Stage 2 API. Login → see your name on a dashboard → logout. All future portal pages plug into the existing layout. No business data needed.

### Rationale

OpenNext config applied early so deployment in Stage 9 is a config change, not a refactor. Silent refresh is non-negotiable to avoid annoying re-logins during dev.

---

## Stage 4 — Users, Merchants & Members Management

**Focus:** CRUD · Member linking · SUPER_ADMIN + PROPERTY_OWNER flows

### Tasks

- `users` module: SUPER_ADMIN endpoints (list/create/update/soft-delete any user) + PROPERTY_OWNER staff endpoints (under `/merchants/me/staff`) + `PATCH /users/me/password`
- Enforce business rules: globally unique email + phone, bcrypt hash, never return `passwordHash`, last-owner protection (cannot soft-delete the last PROPERTY_OWNER of a merchant)
- `merchants` module: SUPER_ADMIN merchant CRUD + PROPERTY_OWNER self-management (`/merchants/me`, `/merchants/me/settings`, `/merchants/me/members`)
- On create-staff or create-owner: transactional create `User` + `MerchantMember` together
- `merchants.settings` as JSON: `accept_manual_payments`, `deposit_confirms_booking` toggles (defaults set in service)
- Active-booking guard: cannot soft-delete a merchant if it has any active (CONFIRMED/CHECKED_IN) bookings — clean error code `MERCHANT_INACTIVE`
- Portal `/admin/merchants` — SUPER_ADMIN merchant list + create + detail (members table, settings)
- Portal `/settings/profile` — PROPERTY_OWNER edits own merchant + settings + member list (add/remove staff)
- Multi-tenancy test: merchant A user tries to GET merchant B properties (returns 403, NEVER 404 — leaking existence is also a leak)
- Verify `audit_logs` table is populated for every mutation by inspecting Prisma Studio

### Deliverables

Users module · Merchants module · Member linking · Admin merchant UI · Merchant self-service UI

### Runs Independently

SUPER_ADMIN creates a merchant + owner; that owner logs in, adds staff; staff logs in and sees only their own merchant context. The whole tenancy model is provable end-to-end before any property data exists.

### Rationale

Properties was pulled OUT of this stage (was bloated in v1). This stage now exclusively proves the tenant model — every later stage relies on it being airtight.

---

## Stage 5 — Properties, Listings & Units

**Focus:** Property CRUD · Listing + auto-unit creation · Availability API

### Tasks

- `properties` module: full CRUD scoped through `MerchantGuard`, 5-digit MY postcode validation, `HH:mm` time validation, `imageUrls` as `string[]` (upload itself in Stage 9)
- `listings` module: Listing CRUD under `/properties/:propertyId/listings` with merchant scope verified via property → merchant chain
- On listing create: transactional creation of N `ListingUnit` records matching `quantity`, with default names ("Unit 1", "Unit 2", … editable later)
- `PATCH /listing-units/:id` for renaming individual units (e.g. "Suite 101", "Cabin A")
- Soft-delete rules: cannot deactivate listing if any unit has non-cancelled bookings; cannot deactivate unit if it has non-cancelled bookings
- `isSingle` field: pure UI flag, no special-case logic in the data layer (per DL-002)
- Availability endpoint `GET /listings/:id/availability?from=&to=` — uses BR-002 overlap query, returns available units; same-day turnover ALLOWED
- Occupancy endpoint `GET /listings/:id/occupancy?date=` — returns `{ booked, total, isSingle }`
- Portal `/properties` — list, create, edit, gallery placeholder
- Portal `/properties/:id` — property detail with listings table, "Add listing" form, per-listing unit grid
- Portal `/properties/:id/listings/:listingId` — listing detail with unit management
- Unit tests for availability overlap (date boundary edge cases — same-day turnover, fully-contained, partial overlap, exact match)

### Deliverables

Properties module · Listings module · Units auto-create · Availability API · Occupancy API · Inventory UI

### Runs Independently

A merchant creates a property → adds a "Soho Suite" listing with quantity 8 → sees 8 auto-created units → renames them. Availability queries return all 8 units for any future date range. All testable without a single booking existing.

### Rationale

Availability + occupancy APIs land HERE, not in the bookings stage — so the booking module in Stage 6 just consumes a tested primitive instead of building two things at once.

---

## Stage 6 — Booking Engine + Manual Payments

**Focus:** Lifecycle · Daily-rate snapshot · Manual payment recording · Payment status calc

### Tasks

- `bookings` module structure per `bookings.md`: controller, service, repository, `/dto`, `/helpers` (`booking-ref.generator`, `availability.checker`, `nights.calculator`), `/events`
- `guests` module per `guests.md`: find-or-create on `(merchantId, email|phone)`, denormalized counter listeners, blacklist + VIP flags, `/guests` + `/guests/:id` endpoints (read + patch only — no direct create)
- `channels` module per `channels.md` (MVP scope only): seed the global `Channel` registry (DIRECT / AGODA / BOOKING_COM / AIRBNB / EXPEDIA / OTHER), expose `GET /channels` and `GET /reports/channel-mix`
- `POST /bookings` — runs availability check via Stage 5 primitive, calls `guests.findOrCreate`, snapshots `dailyRate` + `guestName`/`guestEmail`/`guestPhone` + computes `nights` at creation, generates `BK-YYYY-NNNNN` ref via Postgres sequence (atomic, never derived); rejects with `GUEST_BLACKLISTED` per BR-G04
- `GET /bookings` with filters (status, checkInFrom, checkInTo, propertyId, unitId) — paginated, merchant-scoped
- `GET /bookings/:id` — full booking detail with `payments[]`, `cleaningLogs[]`, unit→listing→property→merchant chain
- `PATCH /bookings/:id` — limited fields editable (guestName, specialRequest, notes); rate NEVER editable post-creation
- `POST /bookings/:id/cancel` — only if PENDING/CONFIRMED, emits `booking.cancelled` event
- `POST /bookings/:id/check-in` — only if CONFIRMED and `date >= checkIn`
- `POST /bookings/:id/check-out` — only if CHECKED_IN, emits `booking.checked-out` event (Stage 7 consumes it)
- `payments` module — manual gateway path only this stage: `POST /payments/:bookingId/manual` — PROPERTY_OWNER/STAFF only, `gatewayConfigId: null`, `status: PAID` immediately, audit-logged per BR-103
- `GET /bookings/:id/payments` — list payments for a booking
- Payment status calculator (BR-101): UNPAID / PARTIAL / PAID / REFUNDED from sum of payments — recalc fires on every payment create
- Booking auto-confirm (BR-102): PENDING → CONFIRMED on PAID, OR PARTIAL + `merchant.settings.deposit_confirms_booking`
- Portal `/bookings` — list with filters (including channel filter) + create form (date picker, unit selector, guest details, **channel dropdown defaulting to DIRECT**, optional `externalBookingRef`)
- Portal `/bookings/:id` — detail view with lifecycle action buttons, payment panel with "Record manual payment" form, **channel badge**, guest mini-card with VIP/blacklist badges + link to `/guests/:id`
- Portal `/guests` — guestbook DataGrid (name, contact, total bookings, last stay, VIP/blacklist status)
- Portal `/guests/:id` — guest detail with booking history table and notes editor
- Dashboard — "Channel mix" card (last 30 days bookings + revenue grouped by channel, fed by `/reports/channel-mix`)
- Event emission via BullMQ for `booking.created` / `booking.confirmed` / `booking.cancelled` / `booking.checked-in` / `booking.checked-out` — handlers are no-ops for now, just observable in queue
- e2e: create booking → record full manual payment → assert auto-confirmed → check-in → check-out → see `booking.checked-out` event in queue

### Deliverables

Bookings module · Guests module (guestbook) · Channels registry + channel tagging on bookings · Manual payments · Payment status calc · Auto-confirmation logic · Booking UI · Guest UI · Channel-mix dashboard · Event emission

### Runs Independently

A complete cash-only booking lifecycle works end-to-end with NO online gateways and NO cleaning module. The full revenue path (create → pay → confirm → check-in → check-out) is provable in isolation.

### Rationale

v1 lumped cleaning + notifications into this stage — they're now their own stages so the booking core stays narrow. Booking + manual payments together still makes sense: payments without a booking is meaningless, and manual payments need ZERO external integration.

---

## Stage 7 — Cleaning Workflow + Notifications

**Focus:** Event consumers · Cleaning state machine · Email + in-app delivery

### Tasks

- `cleaning` module: controller, service, repository + `/listeners/booking-checked-out.listener.ts` subscribing via `@OnEvent` (BullMQ-backed)
- On `booking.checked-out`: auto-create `CleaningLog` with status PENDING (BR-201). Single CleaningLog per checkout; re-cleaning creates a new log preserving the previous (BR-203)
- `POST /cleaning/:bookingId/start` — PENDING → IN_PROGRESS, sets `startedAt`
- `POST /cleaning/:bookingId/complete` — IN_PROGRESS → DONE, sets `completedAt`, accepts `imageUrls[]` for proof
- `POST /cleaning/:bookingId/skip` — → SKIPPED, requires notes
- `PATCH /cleaning/:id/assign` — assign to a STAFF user
- `POST /cleaning/:bookingId/recreate` — create a fresh PENDING log (re-cleaning after issue)
- `GET /cleaning` queue — default filter `status=PENDING`, sortable by `checkOut` date (oldest waiting first), filterable by `assignedTo` + `propertyId`
- Reject invalid state transitions with `INVALID_CLEANING_TRANSITION` error code
- `notifications` module: Notification model writes for every event, hard-deleted per DL-010 exception (no audit value)
- Email driver: integrate Resend SDK (or Postmark) behind a `NotificationChannel` interface — keep it swappable
- Listeners subscribe to: `booking.created`, `booking.confirmed`, `booking.cancelled`, `booking.checked-in`, `booking.checked-out`, `payment.received`, `cleaning.completed` (per `notifications.md`)
- Template rendering: simple MJML or Handlebars templates with merchant branding pulled from `merchant.settings`
- In-app inbox: `GET /notifications` + `PATCH /notifications/:id/read`; composite index on `(userId, isRead)` for unread badge
- Portal `/cleaning` — cleaning queue UI: kanban-style PENDING / IN_PROGRESS / DONE columns, assign action, complete with photo upload placeholder
- Portal header: unread notification badge + dropdown showing latest 10 + "mark all read"
- Test: complete a booking → cleaning log auto-appears → assign → start → done → verify customer + merchant got the appropriate emails (use Resend sandbox or mailtrap)

### Deliverables

Cleaning module · Event consumers wired · Notification module · Email driver (Resend) · In-app inbox · Cleaning UI + notification UI

### Runs Independently

Two independent capabilities sharing the event bus from Stage 2. Cleaning queue runs whether or not notifications are configured. Notifications work even without cleaning. Both subscribe to Stage 6 booking events — they observe, they don't mutate booking state.

### Rationale

Split out of Stage 6 in v1. These are both event consumers — they share the same architectural pattern (subscribe to BullMQ, do their thing) and never break the booking flow if they fail.

---

## Stage 8 — Multi-Gateway Online Payments

**Focus:** Gateway registry · Billplz · Fiuu · Webhook idempotency · Credential encryption

### Tasks

- `PaymentGateway` interface (`initiate`, `verifyWebhook`, `parseWebhook`, `refund`, `validateCredentials`) per `payments.md`
- `GatewayRegistry` — NestJS-DI-injected `Map<GatewayName, PaymentGateway>`; throws `PAYMENT_GATEWAY_NOT_CONFIGURED` on unknown
- Credential encryption helper — AES-256-GCM, key from `GATEWAY_CREDENTIALS_ENCRYPTION_KEY` env, encrypt on save, decrypt on use, never serialize raw
- Credential masking helper — returns `"sk_…7f2a"` style for API responses
- `PaymentGatewayConfig` CRUD module: POST/GET/PATCH/DELETE `/gateway-configs`, `POST /:id/set-default` (enforces single default per merchant atomically), `POST /:id/test` (calls gateway-specific connectivity check)
- Deactivation guard: `GATEWAY_CONFIG_HAS_PENDING` if any UNPAID payments reference this config
- `BillplzGateway`: `initiate` uses `apiKey` + `collectionId` → returns `paymentUrl` + `gatewayRefId`; `verifyWebhook` uses `xSignatureKey` HMAC; `parseWebhook` maps Billplz states
- `FiuuGateway`: `initiate` uses `merchantId` + `verifyKey` + `secretKey`; `verifyWebhook` uses Fiuu signature scheme; `parseWebhook` maps Fiuu states
- `POST /payments/:bookingId/initiate` — body `{ gatewayConfigId? }` → resolves config (explicit OR merchant default) → `gateway.initiate()` → creates Payment row `{ status: UNPAID, gatewayConfigId, gateway, gatewayRefId }` → returns `paymentUrl`
- Webhook controllers: `POST /webhooks/billplz`, `POST /webhooks/fiuu` — public but signature-verified. Per BR-104: lookup by `gatewayRefId`, idempotent (same payload returns 200 without duplicating), uses `payment.gatewayConfigId` to load correct credentials
- Webhook flow updates `payment.status` + `paidAt` + `gatewayResponse` (raw payload preserved), emits `payment.received` → triggers payment status recalc → booking auto-confirm
- Portal `/settings/payment-gateways` — list configs with masked creds + status, add config form (gateway selector dynamically renders the right credential fields), set-default button, test-connectivity button
- Portal booking detail: alongside "Record manual payment", new "Pay online" → opens gateway selector (if multiple configs) or uses default → redirects to `paymentUrl`
- e2e test with Billplz sandbox: create config → test connectivity → initiate payment → simulate webhook → assert booking auto-confirmed → loyalty event NOT emitted (Stage 2 / loyalty still dormant)
- Test multi-gateway isolation: merchant A's Billplz webhook never resolves to merchant B's config; signature verification uses the right creds per payment

### Deliverables

Gateway interface + registry · Billplz gateway · Fiuu gateway · Credential encryption · Webhook handlers · Gateway config UI · Online payment UX

### Runs Independently

Online payments are ADDITIVE — Stage 6's manual payment path is untouched and continues to work. A merchant with no gateway config still operates fully on cash. A merchant with Billplz only / Fiuu only / both all work independently.

### Rationale

Webhook idempotency, encryption, and gateway-aware signature verification are emphasized because they're the most common production failure modes.

---

## Stage 9 — Deployment, Observability & Hardening

**Focus:** Cloudflare Workers · API hosting · Logging · Backups · Rate limiting

### Tasks

- Deploy `apps/portal` to Cloudflare Workers via `@opennextjs/cloudflare` (DL-013) — wrangler config, custom domain, env secrets
- Deploy `apps/api` to a Node-friendly host (Fly.io / Railway / Render / Hetzner + Coolify — pick one that supports BullMQ + Redis colocation) — DL needs writing for whichever is picked
- Managed Postgres provider with daily backups (Neon / Supabase / Railway Postgres / AWS RDS) — verify backup restore once before going live
- Managed Redis for BullMQ (Upstash / Railway Redis)
- Object storage: configure Cloudflare R2 bucket + signed-URL upload endpoint for property/cleaning images
- Image upload module: `POST /uploads/presign` returns presigned R2 URL; portal uploads direct-to-R2; backend only stores the resulting URL on `Property.imageUrls` / `CleaningLog.imageUrls`
- Structured logging via pino — JSON logs, request ID middleware, redact sensitive fields (`passwordHash`, credentials JSON)
- Sentry (or equivalent) wired for both API and portal — source maps uploaded in CI
- Rate limiting via `@nestjs/throttler` on `/auth/login` (5/min/IP), webhook endpoints (60/min), generic API (100/min/user)
- Helmet, CORS allowlist (portal domain only), trust proxy headers correctly behind Cloudflare
- Database connection pooling — Prisma + PgBouncer or the managed provider's built-in pooler
- Production env secrets management — no `.env` files in prod, use the host's secret manager
- Health endpoints: `/healthz` (liveness) + `/readyz` (DB + Redis ping)
- CI/CD: GitHub Actions deploys portal on main merge (`wrangler deploy`), deploys API on main merge (host CLI), runs migrations as a deploy step
- Runbook documented in `docs/operations.md`: rollback procedure, common incidents, how to rotate gateway encryption key
- Smoke test suite that runs against staging after every deploy: login, create booking, record payment, webhook simulation — block production deploy if any fail

### Deliverables

Portal on Cloudflare Workers · API on managed host · Postgres + Redis production · R2 image uploads · Logging + Sentry · Rate limiting · CI/CD deploy pipeline · Operations runbook

### Runs Independently

Everything from Stages 1-8 deploys to a real environment. Image uploads (previously placeholder URLs in Stages 5 and 7) now use R2. This stage doesn't change feature behavior — it makes what was already working production-ready.

### Rationale

DL-013 already committed to Cloudflare Workers for portal but no stage owned actually getting there. Image uploads were referenced in Stages 5 & 7 as "placeholder" — this is where they become real.

---

## Stage Acceptance Criteria — Quick Reference

Before moving from stage N to stage N+1, verify:

1. **All endpoints from that stage return correctly via curl/Postman.**
2. **The stage's e2e or integration tests pass in CI.**
3. **The portal page(s) for that stage render and complete a happy-path flow.**
4. **Audit log entries are produced for every mutation in that stage.**
5. **Multi-tenancy is verified: a user from merchant A cannot see/touch merchant B's data.**
6. **Relevant `docs/modules/*.md` and `decision-log.md` entries are reviewed — no contradictions.**
7. **The "Runs Independently" criterion for that stage is demonstrably true.**

---

## Out of Scope (Stage 2 of the Product Roadmap)

These remain dormant during the 9 stages above and activate later:

- Public customer booking site (`apps/web`)
- Customer registration (`POST /auth/register`)
- Loyalty module activation (schema exists per DL-009 — wire endpoints, listeners, expiry cron)
- Stripe gateway (additional implementation against the same `PaymentGateway` interface — zero changes to existing code per DL-011)
- **Channel sync** — `ChannelAccount` (encrypted credentials), `ChannelListing` (per-listing mapping), outbound availability/rate push, inbound booking webhooks, channel-aware cancellation. Schema scaffolded in `data-models.md` and dormant in MVP; activated in Stage 2 per `channels.md`.
- Bahasa Malaysia + Chinese Simplified i18n (BR-603)
- Mobile apps (Stage 3 of product roadmap)

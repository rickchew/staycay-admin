# Data Models

> Single source of truth: `packages/database/prisma/schema.prisma`
> This document explains *why* the schema is the way it is.

---

## Entity Relationship Overview

```
User ─────┬───→ MerchantMember ───→ Merchant
          │                           │
          │                           └───→ PaymentGatewayConfig
          │
          ├───→ Booking ───→ ListingUnit ───→ Listing ───→ Property ───→ Merchant
          │       │
          │       ├───→ Payment ───→ PaymentGatewayConfig
          │       └───→ CleaningLog
          │
          ├───→ LoyaltyAccount ───→ LoyaltyTransaction
          ├───→ Notification
          ├───→ RefreshToken
          └───→ AuditLog
```

---

## Entity Reference

### User
Single table for all user types. Role determines access.

| Field | Notes |
|---|---|
| `email` | Unique, used for login |
| `phone` | Unique, optional, for SMS notifications |
| `role` | `SUPER_ADMIN` / `PROPERTY_OWNER` / `STAFF` / `CUSTOMER` |
| `isActive` | Soft delete flag |
| `passwordHash` | bcrypt hash, never return in API responses |

### Merchant
Represents a business owner who manages one or more properties.

| Field | Notes |
|---|---|
| `businessRegNo` | SSM registration number (Malaysia) |
| `settings` | JSON blob for merchant-specific config (timezone, currency, branding) |

### MerchantMember
Junction table linking users to merchants. A user can only belong to one merchant (1:1 enforced via `@unique` on `userId`).

### Property
Physical location belonging to a merchant.

- One merchant can have many properties
- Each property has geo coordinates for future map features
- `imageUrls` is a string array — gallery images

### Listing
Represents a *room type* or *unit type* offered at a property.

| Field | Critical Logic |
|---|---|
| `quantity` | Total number of physical units of this type |
| `isSingle` | UI flag — `true` shows check/cross, `false` shows `x/total` |
| `dailyRate` | Default rate per night |
| `depositAmount` | Optional deposit required at booking |

### ListingUnit
Each physical, individually trackable unit within a listing.

- A listing with `quantity: 8` has 8 `ListingUnit` records
- Each unit has a merchant-defined name (e.g., "Suite 101", "Cabin A")
- Bookings reference `unitId`, never `listingId`

### Booking
Core transactional entity.

| Field | Notes |
|---|---|
| `bookingRef` | Human-readable reference, format `BK-YYYY-NNNNN` |
| `unitId` | Specific unit being booked |
| `checkIn` / `checkOut` | Date only, no time component |
| `nights` | Computed at creation, never derived at query time |
| `dailyRate` | **Snapshot** at booking time, not a foreign reference |
| `status` | Booking lifecycle state |
| `cleaningStatus` | Independent of booking status |
| `paymentStatus` | Independent of booking status |

**Important:** `dailyRate` is copied from `Listing.dailyRate` at booking creation. Never join back to `Listing` for historical pricing.

### PaymentGatewayConfig
Per-merchant gateway credentials. A merchant can have multiple configs (e.g., Billplz for FPX + Fiuu for cards).

| Field | Notes |
|---|---|
| `id` | cuid PK |
| `merchantId` | FK to Merchant |
| `gateway` | `BILLPLZ` / `FIUU` / `STRIPE` / `MANUAL` (enum, extensible) |
| `displayName` | Merchant-facing label, e.g. "Billplz FPX" |
| `credentials` | Encrypted JSON blob — API keys, secrets, collection IDs per gateway |
| `isDefault` | Only one config per merchant can be default |
| `isSandbox` | Whether this config uses the gateway's sandbox/test environment |
| `isActive` | Soft delete flag |
| `createdAt` | |
| `updatedAt` | |

**Important:** `credentials` is encrypted at rest. Never return raw credentials in API responses — return masked values only (e.g., `"api_key": "sk_...7f2a"`).

Each gateway type has its own credential shape stored in the JSON blob:
- **Billplz:** `{ apiKey, collectionId, xSignatureKey }`
- **Fiuu:** `{ merchantId, verifyKey, secretKey }`
- **Stripe:** `{ secretKey, webhookSecret }`

### Payment
One booking can have multiple payments (deposit + final, partial refunds, etc.).

| Field | Notes |
|---|---|
| `gatewayConfigId` | FK to PaymentGatewayConfig (null for MANUAL) |
| `gateway` | Denormalized from config: `BILLPLZ` / `FIUU` / `STRIPE` / `MANUAL` |
| `gatewayRefId` | External ID for reconciliation |
| `gatewayResponse` | Full webhook payload preserved as JSON |

### CleaningLog
Records cleaning activity per booking. Multiple logs possible if cleaning is redone.

### LoyaltyAccount / LoyaltyTransaction
Stage 2 feature. Schema exists but dormant in Stage 1.

- Each `LoyaltyTransaction` stores `balance` after the transaction (running balance pattern)
- `points` is signed: positive = earned, negative = redeemed/expired

### Notification
Multi-channel delivery log. `data` field stores extra payload like `bookingId`, `propertyName` for templating.

### AuditLog
Captures every state-changing action with before/after JSON snapshots. Wired in via NestJS interceptor.

---

## Indexing Strategy

Already declared in schema:
- `bookings` — composite index on `(checkIn, checkOut)` for availability queries
- `bookings` — index on `unitId` for occupancy lookups
- `bookings` — index on `bookingRef` for customer support lookups
- `payment_gateway_configs` — unique index on `(merchantId, gateway, isDefault)` where `isDefault = true`
- `payments` — index on `gatewayConfigId` for gateway-scoped queries
- `payments` — index on `gatewayRefId` for webhook lookups
- `audit_logs` — composite index on `(entity, entityId)` for entity history
- `notifications` — composite index on `(userId, isRead)` for unread badge queries

---

## What NOT to Add

- **No `merchant_id` denormalization on Booking.** Always join through `ListingUnit -> Listing -> Property -> Merchant`. Adding a denormalized field creates drift risk. Use a SQL view if performance becomes a problem.
- **No `Float` for money.** Always `Decimal(10, 2)`.
- **No hard deletes** on user-facing entities. Use `isActive`.
- **No raw IDs in URLs** for sensitive resources. Always validate access via guards.

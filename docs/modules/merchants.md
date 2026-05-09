# Merchants Module

> Manages merchant (tenant) accounts and membership.
> Location: `apps/api/src/modules/merchants/`

---

## Responsibilities

- CRUD for merchant accounts
- Manage merchant members (link users to merchants via `MerchantMember`)
- Merchant settings management (branding, payment config, policies)

## What This Module Does NOT Do

- User account creation (delegated to `users` module)
- Property management (delegated to `properties` module)

---

## Data Model Reference

- `Merchant` — the tenant entity with `businessRegNo`, `settings` JSON
- `MerchantMember` — junction table linking `User` to `Merchant` (1:1 on userId)

---

## Endpoints

```
GET    /api/v1/merchants                    SUPER_ADMIN — list all
POST   /api/v1/merchants                    SUPER_ADMIN — create
GET    /api/v1/merchants/:id                SUPER_ADMIN
PATCH  /api/v1/merchants/:id                SUPER_ADMIN
DELETE /api/v1/merchants/:id                SUPER_ADMIN — soft delete

GET    /api/v1/merchants/me                 MERCHANT_OWNER — own merchant
PATCH  /api/v1/merchants/me                 MERCHANT_OWNER — update own
PATCH  /api/v1/merchants/me/settings        MERCHANT_OWNER — update settings

GET    /api/v1/merchants/me/members         MERCHANT_OWNER — list members
POST   /api/v1/merchants/me/members         MERCHANT_OWNER — add member
DELETE /api/v1/merchants/me/members/:id     MERCHANT_OWNER — remove member
```

---

## Business Rules

- Only `SUPER_ADMIN` can create/list/delete merchants.
- `MERCHANT_OWNER` can update their own merchant details and settings.
- Soft-deleting a merchant sets `isActive: false`. All associated data remains but becomes inaccessible.
- A merchant cannot be deactivated if it has active bookings (CONFIRMED or CHECKED_IN).
- `businessRegNo` (SSM number) is optional but must be unique if provided.
- `settings` JSON stores merchant-specific config: branding, policy toggles (e.g., `deposit_confirms_booking`, `accept_manual_payments`). Payment gateway credentials are stored separately in `PaymentGatewayConfig` records (see payments module).
- A user can only belong to one merchant (enforced by `@unique` on `MerchantMember.userId`).

---

## Events Emitted

| Event | When |
|---|---|
| `merchant.created` | New merchant created |
| `merchant.deactivated` | Merchant soft-deleted |

## Events Consumed

None.

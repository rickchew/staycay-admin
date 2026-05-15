# Business Rules

> Cross-cutting business rules that apply across modules.
> AI agents must respect these rules — never override without updating this document.

---

## Booking Rules

### BR-001 — Date Validation
- `checkIn` must be in the future (or today)
- `checkOut` must be strictly after `checkIn`
- Minimum stay: 1 night
- Maximum stay: 365 nights (configurable per merchant)

### BR-002 — Unit Availability
A unit is **unavailable** for a date range `[checkIn, checkOut)` if there exists any booking on that unit with status not in `[CANCELLED, NO_SHOW]` where:
```
existing.checkIn  < checkOut  AND
existing.checkOut > checkIn
```
Note: `checkOut` of an existing booking equals `checkIn` of a new booking is **allowed** (same-day turnover).

### BR-003 — Booking Reference Format
Format: `BK-YYYY-NNNNN`
- `YYYY` = year of booking creation
- `NNNNN` = zero-padded sequential counter, resets each year
- Generated atomically — must not be derivable from other fields

### BR-004 — Daily Rate Snapshot
- `dailyRate` on `Booking` is captured at booking creation
- Never recalculated when `Listing.dailyRate` changes
- `totalAmount` = `dailyRate * nights`

### BR-005 — Cancellation
- Can be cancelled if status is `PENDING` or `CONFIRMED`
- Cannot be cancelled after `CHECKED_IN`
- Cancelled bookings do not block availability
- Refund eligibility is determined by merchant policy (Stage 2)

### BR-006 — Check-in / Check-out
- Check-in only allowed if status is `CONFIRMED`
- Check-in only allowed on or after `checkIn` date
- Check-out only allowed if status is `CHECKED_IN`
- Auto-trigger cleaning workflow on check-out

---

## Payment Rules

### BR-101 — Payment Status Derivation
A booking's `paymentStatus` is computed from sum of associated payments:
- `UNPAID` — no successful payments
- `PARTIAL` — sum of paid < totalAmount
- `PAID` — sum of paid >= totalAmount
- `REFUNDED` — sum of refunds equals or exceeds total paid

Updated automatically when payment status changes.

### BR-102 — Booking Confirmation
A booking transitions from `PENDING` to `CONFIRMED` when:
- `paymentStatus` becomes `PAID`, OR
- `paymentStatus` becomes `PARTIAL` and merchant has "deposit confirms booking" policy enabled

### BR-103 — Manual Payments
Merchant staff can record manual payments (cash, bank transfer):
- Requires `PROPERTY_OWNER` or `STAFF` role
- Audit log entry mandatory
- No webhook flow

### BR-104 — Gateway Idempotency
Webhook handlers must be idempotent:
- Check `gatewayRefId` before creating new payment record
- If exists, update existing record (do not create duplicate)
- Always return 200 to gateway, even on duplicate

### BR-105 — Gateway Configuration
- Each merchant can configure multiple payment gateways (e.g., Billplz for FPX, Fiuu for cards)
- Exactly one gateway config per merchant must be marked `isDefault`
- Gateway credentials are encrypted at rest and never returned in full via the API
- A gateway config cannot be deactivated if it has pending (UNPAID) payments
- When initiating a payment, the merchant can specify which gateway config to use; if omitted, the default is used

### BR-106 — Gateway Routing
- Each payment is tied to a specific `PaymentGatewayConfig` via `gatewayConfigId`
- Webhooks are routed to the correct gateway handler based on the webhook URL path (`/webhooks/billplz`, `/webhooks/fiuu`, etc.)
- The gateway handler resolves the `PaymentGatewayConfig` from the payment's `gatewayConfigId` to verify signatures using the correct credentials
- `MANUAL` payments do not require a gateway config — `gatewayConfigId` is null

---

## Cleaning Rules

### BR-201 — Cleaning Trigger
- Cleaning workflow triggers on booking `CHECKED_OUT`
- Initial `CleaningLog` created with status `PENDING`
- No auto-assignment to staff (manual for Stage 1)

### BR-202 — Cleaning Status Lifecycle
```
PENDING -> IN_PROGRESS -> DONE
                       -> SKIPPED (with notes)
```
Once `DONE`, unit is ready for next booking.

### BR-203 — Re-cleaning
If quality issues found, a new `CleaningLog` can be created. The previous log is preserved for audit.

---

## Multi-Tenancy Rules

### BR-301 — Merchant Scoping
Every authenticated request from a merchant role must be scoped to that merchant:
- Resolve `merchantId` from `MerchantMember` linked to `userId`
- Never accept `merchantId` from client request body or query
- Apply scope at service layer, not just controller

### BR-302 — Cross-Merchant Access
- `SUPER_ADMIN` can read all merchants
- `SUPER_ADMIN` mutations on merchant data must be logged with explicit reason
- `PROPERTY_OWNER` cannot access another merchant's data, even with their ID

### BR-303 — Customer Scoping
- Customers see only their own bookings
- Customer search/listing endpoints must filter by `customerId = currentUser.id`

---

## Loyalty Rules (Stage 2)

### BR-401 — Earning
- 1 point earned per RM 1 spent on confirmed bookings
- Points credited when `paymentStatus` becomes `PAID`
- Points reverse if booking is later refunded

### BR-402 — Tiers
| Tier | Lifetime Points | Benefits |
|---|---|---|
| Bronze | 0 — 999 | Standard rate |
| Silver | 1,000 — 4,999 | 5% discount |
| Gold | 5,000+ | 10% discount + early check-in |

### BR-403 — Expiry
Points expire 24 months after earning if not redeemed.

### BR-404 — Redemption
- 100 points = RM 1 discount
- Redemption applied at booking creation
- Cannot be combined with promo codes
- Redemption is immutable once booking is confirmed

---

## Audit Rules

### BR-501 — Audit Coverage
The following actions must produce an `AuditLog` entry:
- Booking create / update / cancel / check-in / check-out
- Payment create / refund
- Payment gateway config create / update / deactivate
- User role changes
- Merchant settings changes
- Listing rate changes

### BR-502 — Audit Immutability
- `AuditLog` entries are append-only
- No updates or deletes allowed
- Retain indefinitely (or per merchant data retention policy)

---

## Currency & Localization

### BR-601 — Currency
- Default currency: MYR
- All prices stored as `Decimal(10, 2)`
- Display format: `RM 250.00`

### BR-602 — Timezone
- Server timezone: `Asia/Kuala_Lumpur` (UTC+8)
- All `@db.Date` fields are interpreted in this timezone
- API timestamps are returned as ISO 8601 with `+08:00` offset

### BR-603 — Language
- Stage 1: English only
- Stage 2: Add Bahasa Malaysia + Chinese (Simplified)

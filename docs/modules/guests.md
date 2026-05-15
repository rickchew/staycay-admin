# Guests Module

> Per-merchant guestbook. Backs the `/guests` portal page and the
> guest-history view inside booking detail.
> Location: `apps/api/src/modules/guests/`

---

## Responsibilities

- Maintain a Guest record per `(merchantId, contact)` combination
- Resolve `bookings.guestId` on booking creation via find-or-create
- Surface guest history, total spend, repeat-stay indicators
- Manage VIP / blacklist flags at the merchant level
- Provide search and filter for the merchant's guest list

## What This Module Does NOT Do

- Authentication — guests are not platform users (no login). Authentication of guests for Stage 2 customer site is owned by `auth`
- Loyalty point math — `loyalty` module reads from `Guest` but owns its own state (Stage 2)
- Sending guest-facing emails — `notifications` module handles that

---

## Data Model Reference

Primary entity: `Guest` (see `data-models.md`)

Related entities:
- `Merchant` (owner of the guest record)
- `Booking` (many-to-one — many bookings per guest)
- `LoyaltyAccount` (Stage 2 — one-to-one per guest, dormant for now)

---

## Multi-Tenancy

Every endpoint scopes by `merchantId` resolved from `MerchantGuard`. Same email registered at two merchants produces two separate `Guest` rows — that's intentional and prevents one merchant from leaking guest data into another's view.

SUPER_ADMIN can read across merchants via `/admin/guests` (cross-tenant read-only).

---

## Endpoints (Stage 6)

| Method | Path | Who | Notes |
|---|---|---|---|
| `GET` | `/guests` | OWNER, STAFF | List own merchant's guests; supports `?search=`, `?vip=true`, `?blacklisted=true`, `?sort=lastBookingAt` |
| `GET` | `/guests/:id` | OWNER, STAFF | Single guest detail incl. recent bookings |
| `GET` | `/guests/:id/bookings` | OWNER, STAFF | Paginated booking history |
| `PATCH` | `/guests/:id` | OWNER, STAFF | Update notes, VIP flag, nationality, ID details |
| `POST` | `/guests/:id/blacklist` | OWNER | Sets `isBlacklisted=true` + `blacklistReason` |
| `DELETE` | `/guests/:id/blacklist` | OWNER | Reverses blacklist |
| `GET` | `/admin/guests` | SUPER_ADMIN | Cross-merchant view (read-only) |

No `POST /guests` endpoint — guests are created implicitly by the bookings flow.

---

## Find-or-Create Logic (consumed by `bookings`)

```
On POST /bookings:
  1. resolve merchantId from auth
  2. if body.guestEmail:
       guest = upsert by (merchantId, email)
     elif body.guestPhone:
       guest = upsert by (merchantId, phone)
     else:
       guest = create anonymous row (merchantId, name only)
  3. booking.guestId = guest.id
  4. snapshot guestName/guestEmail/guestPhone onto the booking row
```

The snapshot fields on `Booking` are the source of truth for historical reporting. The `Guest` row is the source of truth for *current* contact info.

---

## Denormalized Counters

`Guest.totalBookings`, `Guest.totalSpent`, `Guest.firstBookingAt`, `Guest.lastBookingAt` are maintained by an event listener:

- `booking.confirmed` → increment counters, update `lastBookingAt`
- `booking.cancelled` → decrement counters
- `payment.received` → update `totalSpent`
- `payment.refunded` → decrement `totalSpent`

These are denormalized for read performance on the guest-list page. Reconciliation job runs nightly to repair drift.

---

## Portal Pages

| Path | Description |
|---|---|
| `/guests` | DataGrid of current merchant's guests; columns: name, email, phone, total bookings, last stay, status (active / VIP / blacklisted) |
| `/guests/[id]` | Guest detail: profile, booking history, notes editor |
| `/admin/guests` | SUPER_ADMIN cross-merchant view |

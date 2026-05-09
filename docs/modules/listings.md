# Listings Module

> Manages room types (Listings) and their individual physical units (ListingUnits).
> Location: `apps/api/src/modules/listings/`

---

## Responsibilities

- Listing CRUD (room types with quantity, pricing, deposit)
- ListingUnit CRUD (individual trackable rooms/units)
- Listing image management

## What This Module Does NOT Do

- Handle bookings or availability (delegated to `bookings` module)
- Manage rate plans or seasonal pricing (future enhancement)

---

## Data Model Reference

- `Listing` — room type within a property. Key fields: `quantity`, `isSingle`, `dailyRate`, `depositAmount`
- `ListingUnit` — individual physical unit. Each listing with `quantity: N` has N `ListingUnit` records.

See DL-002 in `decision-log.md` for the Listing vs ListingUnit split rationale.

---

## Endpoints

### Listings

```
GET    /api/v1/properties/:propertyId/listings     MERCHANT_OWNER, MERCHANT_STAFF
POST   /api/v1/properties/:propertyId/listings     MERCHANT_OWNER
GET    /api/v1/listings/:id                        MERCHANT_OWNER, MERCHANT_STAFF
PATCH  /api/v1/listings/:id                        MERCHANT_OWNER
DELETE /api/v1/listings/:id                        MERCHANT_OWNER — soft delete
```

### ListingUnits

```
GET    /api/v1/listings/:id/units                  MERCHANT_OWNER, MERCHANT_STAFF
POST   /api/v1/listings/:id/units                  MERCHANT_OWNER
PATCH  /api/v1/listing-units/:id                   MERCHANT_OWNER
DELETE /api/v1/listing-units/:id                   MERCHANT_OWNER — soft delete
```

---

## Business Rules

- All queries scoped by merchant via `Listing -> Property -> Merchant`.
- A listing cannot be deactivated if it has units with active bookings.
- A listing unit cannot be deactivated if it has active bookings.
- `dailyRate` must be > 0, stored as `Decimal(10, 2)`.
- `depositAmount` is optional, defaults to 0.
- `quantity` on Listing represents total units of this type. When creating a listing, `quantity` ListingUnit records should be created.
- `isSingle` is a UI flag: `true` = single-unit listing (show available/unavailable), `false` = multi-unit (show `x/total` count).
- Each ListingUnit has a merchant-defined `name` (e.g., "Suite 101", "Cabin A").

---

## Events Emitted

None.

## Events Consumed

None.

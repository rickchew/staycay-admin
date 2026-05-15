# Properties Module

> Manages physical properties (hotels, homestays, apartments).
> Location: `apps/api/src/modules/properties/`

---

## Responsibilities

- Property CRUD
- Property image gallery management
- Geo coordinates for future map features

## What This Module Does NOT Do

- Manage listings/units within a property (delegated to `listings` module)
- Handle bookings (delegated to `bookings` module)

---

## Data Model Reference

- `Property` — physical location belonging to a merchant
- Key fields: `name`, `address`, `city`, `state`, `postcode`, `latitude`, `longitude`, `imageUrls` (string array), `checkInTime`, `checkOutTime`

---

## Endpoints

```
GET    /api/v1/properties                   PROPERTY_OWNER, STAFF
POST   /api/v1/properties                   PROPERTY_OWNER
GET    /api/v1/properties/:id               PROPERTY_OWNER, STAFF
PATCH  /api/v1/properties/:id               PROPERTY_OWNER
DELETE /api/v1/properties/:id               PROPERTY_OWNER — soft delete
```

---

## Business Rules

- All queries scoped by `merchantId` resolved from `MerchantMember`.
- A property cannot be deactivated if it has listings with units that have active bookings.
- `checkInTime` and `checkOutTime` validated as `HH:mm` 24-hour format.
- `postcode` validated as 5-digit Malaysian format.
- `imageUrls` managed via file upload — backend uploads to Cloudflare R2 / Supabase Storage.

---

## Events Emitted

| Event | When |
|---|---|
| `property.created` | New property created |
| `property.deactivated` | Property soft-deleted |

## Events Consumed

None.

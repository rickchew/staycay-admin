# Users Module

> Manages user accounts for all roles.
> Location: `apps/api/src/modules/users/`

---

## Responsibilities

- User CRUD for all roles
- Password management
- Role assignment
- Account activation/deactivation

## What This Module Does NOT Do

- Handle authentication (delegated to `auth` module)
- Manage merchant membership (delegated to `merchants` module)
- Handle customer registration on public site (Stage 2)

---

## Data Model Reference

Single `User` table for all user types (see DL-004 in `decision-log.md`).

Key fields: `email` (unique), `phone` (unique, optional), `passwordHash`, `role`, `isActive`.

---

## Endpoints

```
GET    /api/v1/users                        SUPER_ADMIN — list all users
POST   /api/v1/users                        SUPER_ADMIN — create any user
GET    /api/v1/users/:id                    SUPER_ADMIN
PATCH  /api/v1/users/:id                    SUPER_ADMIN
DELETE /api/v1/users/:id                    SUPER_ADMIN — soft delete

GET    /api/v1/merchants/me/staff           MERCHANT_OWNER — list merchant staff
POST   /api/v1/merchants/me/staff           MERCHANT_OWNER — create staff user
PATCH  /api/v1/merchants/me/staff/:id       MERCHANT_OWNER — update staff
DELETE /api/v1/merchants/me/staff/:id       MERCHANT_OWNER — soft delete staff

PATCH  /api/v1/users/me/password            Authenticated — change own password
```

---

## Business Rules

- `email` must be globally unique across all users.
- `phone` must be globally unique if provided.
- Only `SUPER_ADMIN` can create `MERCHANT_OWNER` users.
- `MERCHANT_OWNER` can create `MERCHANT_STAFF` users within their merchant.
- When creating a merchant-scoped user, a `MerchantMember` record is also created.
- Users cannot delete their own account.
- Users cannot change their own role.
- Password minimum: 8 characters. Hashed with bcrypt.
- A user cannot be soft-deleted if they are the last `MERCHANT_OWNER` in a merchant.
- `passwordHash` must never be returned in any API response.

---

## Events Emitted

None.

## Events Consumed

None.

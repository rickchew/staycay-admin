# Auth Module

> Authentication and session management.
> Location: `apps/api/src/modules/auth/`

---

## Responsibilities

- Email + password login for all user types
- JWT access + refresh token issuance
- Token refresh and rotation
- Logout (refresh token revocation)
- Current user profile retrieval

## What This Module Does NOT Do

- Manage user accounts (delegated to `users` module)
- Handle merchant membership (delegated to `merchants` module)
- Registration for customers (Stage 2)

---

## Endpoints

```
POST   /api/v1/auth/register       Public (Stage 2 — customer registration)
POST   /api/v1/auth/login          Public
POST   /api/v1/auth/refresh        Public (uses refresh token cookie)
POST   /api/v1/auth/logout         Authenticated
GET    /api/v1/auth/me             Authenticated
```

---

## Login Flow

1. Client sends `{ email, password }`.
2. Service looks up user by email, verifies password hash (bcrypt).
3. On success: returns `{ accessToken }` in body, sets `refreshToken` as HTTP-only secure cookie.
4. Access token is short-lived (15 min), contains `{ userId, role }`.
5. Refresh token is long-lived (7 days), stored in `RefreshToken` table, rotated on every refresh.

---

## Token Payload

```typescript
interface JwtPayload {
  sub: string;       // userId
  role: 'SUPER_ADMIN' | 'PROPERTY_OWNER' | 'STAFF' | 'CUSTOMER';
  iat: number;
  exp: number;
}
```

Note: `merchantId` is NOT in the token. It is resolved at runtime via `MerchantMember` lookup from `userId`. This avoids stale merchant references in long-lived tokens.

---

## Guards

| Guard | Purpose |
|---|---|
| `JwtAuthGuard` | Validates access token on protected routes. Attaches user to request. |
| `RolesGuard` | Checks user role against `@Roles()` decorator on the endpoint. |
| `MerchantGuard` | Resolves `merchantId` via `MerchantMember` and attaches to request. Rejects if user has no merchant membership. |

---

## Refresh Token Rotation

On every `/auth/refresh` call:
1. Validate the incoming refresh token against the `RefreshToken` table.
2. If valid: delete the old token, create a new one, return new access + refresh pair.
3. If invalid or expired: return 401, force re-login.

`RefreshToken` records are hard-deleted (not soft-deleted) — they have no audit value.

---

## Events Emitted

None.

## Events Consumed

None.

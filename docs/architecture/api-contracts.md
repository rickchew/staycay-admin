# API Contracts

> NestJS REST API conventions. All clients (portal, web, mobile) consume the same API.

---

## Base URL Structure

```
/api/v1/...
```

- Always versioned, even in v1
- Future breaking changes go to `/v2`, `/v1` continues to serve old clients

---

## Authentication

### Token Strategy
- **Access token** — short-lived JWT (15 min), sent in `Authorization: Bearer <token>` header
- **Refresh token** — long-lived (7 days), stored in DB, rotated on every refresh

### Auth Endpoints
```
POST   /api/v1/auth/register       Public
POST   /api/v1/auth/login          Public
POST   /api/v1/auth/refresh        Public (uses refresh token)
POST   /api/v1/auth/logout         Authenticated
GET    /api/v1/auth/me             Authenticated
```

---

## Response Shape (Universal)

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 145
  }
}
```

`meta` is only present for paginated responses.

### Error
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_UNAVAILABLE",
    "message": "Selected unit is not available for these dates",
    "details": { "unitId": "...", "conflictingBookingId": "..." }
  }
}
```

`details` is optional, used for actionable client feedback.

### Standard HTTP Codes
| Code | When |
|---|---|
| 200 | Successful GET / PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE |
| 400 | Validation error |
| 401 | No or invalid token |
| 403 | Authenticated but lacks permission |
| 404 | Resource not found |
| 409 | Conflict (e.g., booking overlap, duplicate email) |
| 422 | Business rule violation |
| 500 | Server error |

---

## Pagination

All list endpoints support:
```
?page=1&limit=20&sort=createdAt&order=desc
```

| Param | Default | Notes |
|---|---|---|
| `page` | 1 | 1-indexed |
| `limit` | 20 | Max 100 |
| `sort` | `createdAt` | Whitelisted per resource |
| `order` | `desc` | `asc` or `desc` |

Filtering uses resource-specific query params:
```
GET /api/v1/bookings?status=CONFIRMED&checkInFrom=2026-05-01
```

---

## Resource Endpoints (Stage 1)

### Merchants (Super Admin)
```
GET    /api/v1/merchants
POST   /api/v1/merchants
GET    /api/v1/merchants/:id
PATCH  /api/v1/merchants/:id
DELETE /api/v1/merchants/:id
```

### Properties (Merchant scope)
```
GET    /api/v1/properties
POST   /api/v1/properties
GET    /api/v1/properties/:id
PATCH  /api/v1/properties/:id
DELETE /api/v1/properties/:id
```

### Listings
```
GET    /api/v1/properties/:propertyId/listings
POST   /api/v1/properties/:propertyId/listings
GET    /api/v1/listings/:id
PATCH  /api/v1/listings/:id
DELETE /api/v1/listings/:id

GET    /api/v1/listings/:id/units
POST   /api/v1/listings/:id/units
PATCH  /api/v1/listing-units/:id
DELETE /api/v1/listing-units/:id
```

### Bookings
```
GET    /api/v1/bookings                                List with filters
POST   /api/v1/bookings                                Create booking
GET    /api/v1/bookings/:id
PATCH  /api/v1/bookings/:id                            Update booking
POST   /api/v1/bookings/:id/cancel
POST   /api/v1/bookings/:id/check-in
POST   /api/v1/bookings/:id/check-out

GET    /api/v1/listings/:id/availability?from=&to=     Check availability
GET    /api/v1/listings/:id/occupancy?date=            Get x/total for a date
```

### Cleaning
```
GET    /api/v1/cleaning                                Cleaning queue
POST   /api/v1/cleaning/:bookingId/start
POST   /api/v1/cleaning/:bookingId/complete
PATCH  /api/v1/cleaning/:bookingId/assign              Assign to staff
```

### Payments
```
POST   /api/v1/payments/:bookingId/manual              Record manual payment
POST   /api/v1/payments/:bookingId/billplz             Initiate Billplz bill
POST   /api/v1/webhooks/billplz                        Billplz callback
```

---

## Validation

All request bodies are validated via `class-validator` DTOs.

```typescript
export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsOptional()
  @IsString()
  guestName?: string;

  @IsOptional()
  @IsString()
  specialRequest?: string;
}
```

Failed validation returns 400 with field-level errors:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "checkIn": ["must be a valid date string"]
    }
  }
}
```

---

## Authorization

Use `@Roles()` decorator at the controller method level:

```typescript
@Get()
@Roles(UserRole.MERCHANT_OWNER, UserRole.MERCHANT_STAFF)
@UseGuards(JwtAuthGuard, RolesGuard)
async getProperties(@CurrentUser() user: User) {
  return this.propertiesService.findByMerchant(user.merchantId);
}
```

Multi-tenancy is enforced in the service layer — never trust client-provided `merchantId`.

---

## Webhooks

Inbound webhooks (Billplz, Stripe) follow this pattern:
1. Verify signature
2. Persist raw payload to `payments.gatewayResponse`
3. Update payment + booking status atomically
4. Return 200 immediately
5. Trigger downstream notifications via queue

---

## Error Codes (Domain-Specific)

| Code | Meaning |
|---|---|
| `BOOKING_UNAVAILABLE` | Unit not available for date range |
| `BOOKING_INVALID_DATES` | checkOut <= checkIn |
| `BOOKING_ALREADY_CANCELLED` | Cancel attempt on cancelled booking |
| `PAYMENT_GATEWAY_ERROR` | External gateway failure |
| `MERCHANT_INACTIVE` | Operation on disabled merchant |
| `UNIT_INACTIVE` | Operation on deactivated unit |
| `INSUFFICIENT_LOYALTY_POINTS` | Stage 2 — redemption failure |

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

### Guests (Merchant scope)
```
GET    /api/v1/guests                                  List guestbook (search, vip, blacklisted, sort)
GET    /api/v1/guests/:id                              Guest profile + recent bookings
GET    /api/v1/guests/:id/bookings                     Paginated booking history
PATCH  /api/v1/guests/:id                              Update notes, VIP flag, identity fields
POST   /api/v1/guests/:id/blacklist                    Blacklist (requires reason)
DELETE /api/v1/guests/:id/blacklist                    Lift blacklist
GET    /api/v1/admin/guests                            SUPER_ADMIN cross-merchant view
```
Note: there is intentionally **no `POST /guests`** endpoint — guest rows are created implicitly by the booking flow (BR-G02).

### Channels (MVP — registry + reporting)
```
GET    /api/v1/channels                                List active channels (global registry)
GET    /api/v1/reports/channel-mix?from=&to=           Booking + revenue breakdown by channel
```
`POST /bookings` accepts `channelId` and `externalBookingRef` in the body (BR-CH02).

### Channel Accounts & Listings *(Stage 2 of product roadmap — placeholder)*
```
GET    /api/v1/channel-accounts                        List merchant's connected channels
POST   /api/v1/channel-accounts                        Connect a channel (encrypted creds)
PATCH  /api/v1/channel-accounts/:id                    Update creds / commission
POST   /api/v1/channel-accounts/:id/test               Validate credentials
GET    /api/v1/listings/:id/channel-listings           Per-listing channel sync status
POST   /api/v1/listings/:id/channel-listings           Map listing to a channel account
PATCH  /api/v1/channel-listings/:id                    Update external ID / rate adjustment
POST   /api/v1/channel-listings/:id/resync             Force re-push of rates & availability
```

### Payment Gateway Configs (Merchant scope)
```
GET    /api/v1/gateway-configs                         List merchant's gateway configs
POST   /api/v1/gateway-configs                         Create gateway config
GET    /api/v1/gateway-configs/:id                     Get config (masked credentials)
PATCH  /api/v1/gateway-configs/:id                     Update config
DELETE /api/v1/gateway-configs/:id                     Soft-delete config
POST   /api/v1/gateway-configs/:id/set-default         Set as default gateway
POST   /api/v1/gateway-configs/:id/test                Test gateway connectivity
```

### Payments
```
GET    /api/v1/bookings/:id/payments                   List payments for booking
POST   /api/v1/payments/:bookingId/manual              Record manual payment
POST   /api/v1/payments/:bookingId/initiate            Initiate online payment (gateway-agnostic)

POST   /api/v1/webhooks/billplz                        Billplz callback
POST   /api/v1/webhooks/fiuu                           Fiuu callback
POST   /api/v1/webhooks/stripe                         Stripe callback
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
@Roles(UserRole.PROPERTY_OWNER, UserRole.STAFF)
@UseGuards(JwtAuthGuard, RolesGuard)
async getProperties(@CurrentUser() user: User) {
  return this.propertiesService.findByMerchant(user.merchantId);
}
```

Multi-tenancy is enforced in the service layer — never trust client-provided `merchantId`.

---

## Webhooks

Each payment gateway has its own webhook endpoint (`/api/v1/webhooks/:gateway`). All follow this pattern:
1. Route to the gateway-specific webhook controller
2. Resolve `PaymentGatewayConfig` from the payment record's `gatewayConfigId`
3. Verify signature using that config's credentials
4. Persist raw payload to `payments.gatewayResponse`
5. Update payment + booking status atomically
6. Return 200 immediately
7. Trigger downstream notifications via queue

---

## Error Codes (Domain-Specific)

| Code | Meaning |
|---|---|
| `BOOKING_UNAVAILABLE` | Unit not available for date range |
| `BOOKING_INVALID_DATES` | checkOut <= checkIn |
| `BOOKING_ALREADY_CANCELLED` | Cancel attempt on cancelled booking |
| `PAYMENT_GATEWAY_ERROR` | External gateway failure |
| `PAYMENT_GATEWAY_NOT_CONFIGURED` | Merchant has no active config for requested gateway |
| `PAYMENT_GATEWAY_CONFIG_INVALID` | Gateway credentials failed validation or connectivity test |
| `MERCHANT_INACTIVE` | Operation on disabled merchant |
| `UNIT_INACTIVE` | Operation on deactivated unit |
| `GUEST_BLACKLISTED` | Booking attempt for a blacklisted guest at this merchant (BR-G04) |
| `CHANNEL_UNKNOWN` | `channelId` does not exist in the global registry (BR-CH01) |
| `CHANNEL_SYNC_FAILED` | Stage 2 — outbound rate/availability push failed |
| `CHANNEL_CREDENTIALS_INVALID` | Stage 2 — connect/test failed against the channel API |
| `INSUFFICIENT_LOYALTY_POINTS` | Stage 2 — redemption failure |

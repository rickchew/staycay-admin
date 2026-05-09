# Bookings Module

> Core revenue-generating module. Highest complexity in Stage 1.
> Location: `apps/api/src/modules/bookings/`

---

## Responsibilities

- Create, read, update, cancel bookings
- Enforce availability rules (no double-booking)
- Manage booking lifecycle (PENDING -> CONFIRMED -> CHECKED_IN -> CHECKED_OUT)
- Generate booking references
- Snapshot pricing at booking creation
- Trigger cleaning workflow on check-out
- Trigger payment recording flow

## What This Module Does NOT Do

- Process payments (delegated to `payments` module)
- Handle cleaning operations beyond triggering (delegated to `cleaning` module)
- Calculate loyalty points (delegated to `loyalty` module — Stage 2)
- Send notifications directly (delegated to `notifications` module via queue)

---

## Data Model Reference

Primary entity: `Booking` (see `data-models.md`)

Related entities:
- `ListingUnit` (booked unit)
- `User` (customer)
- `Payment` (1-to-many)
- `CleaningLog` (1-to-many)

---

## Module Structure

```
/apps/api/src/modules/bookings
  bookings.module.ts
  bookings.controller.ts
  bookings.service.ts
  bookings.repository.ts

  /dto
    create-booking.dto.ts
    update-booking.dto.ts
    cancel-booking.dto.ts
    booking-filter.dto.ts
    booking-response.dto.ts

  /helpers
    booking-ref.generator.ts
    availability.checker.ts
    nights.calculator.ts

  /events
    booking-created.event.ts
    booking-confirmed.event.ts
    booking-cancelled.event.ts
    booking-checked-out.event.ts
```

---

## Key Endpoints

```
GET    /api/v1/bookings
POST   /api/v1/bookings
GET    /api/v1/bookings/:id
PATCH  /api/v1/bookings/:id
POST   /api/v1/bookings/:id/cancel
POST   /api/v1/bookings/:id/check-in
POST   /api/v1/bookings/:id/check-out

GET    /api/v1/listings/:id/availability?from=&to=
GET    /api/v1/listings/:id/occupancy?date=
```

---

## Core Algorithms

### Availability Check
```typescript
async getAvailableUnits(listingId: string, checkIn: Date, checkOut: Date) {
  const blocked = await this.prisma.booking.findMany({
    where: {
      unit: { listingId },
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      AND: [
        { checkIn:  { lt: checkOut } },
        { checkOut: { gt: checkIn } },
      ],
    },
    select: { unitId: true },
  });

  return this.prisma.listingUnit.findMany({
    where: {
      listingId,
      isActive: true,
      id: { notIn: blocked.map(b => b.unitId) },
    },
  });
}
```

### Occupancy Count (Summary View)
```typescript
async getListingOccupancy(listingId: string, date: Date) {
  const [booked, listing] = await Promise.all([
    this.prisma.booking.count({
      where: {
        unit: { listingId },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        checkIn:  { lte: date },
        checkOut: { gt: date },
      },
    }),
    this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { quantity: true, isSingle: true },
    }),
  ]);

  return {
    booked,
    total: listing.quantity,
    isSingle: listing.isSingle,
  };
}
```

### Booking Reference Generation
```typescript
async generateBookingRef(): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await this.prisma.$queryRaw`
    SELECT nextval('booking_ref_seq_${year}')
  `;
  return `BK-${year}-${String(seq).padStart(5, '0')}`;
}
```

---

## Business Rules Applied
See `business-rules.md` for full list. Module enforces:
- BR-001 — Date validation
- BR-002 — Availability check
- BR-003 — Booking reference format
- BR-004 — Daily rate snapshot
- BR-005 — Cancellation rules
- BR-006 — Check-in/out workflow

---

## Events Emitted

| Event | Trigger | Subscribers |
|---|---|---|
| `booking.created` | New booking created | notifications, audit |
| `booking.confirmed` | Payment received | notifications, loyalty |
| `booking.cancelled` | Booking cancelled | notifications, payments (refund) |
| `booking.checked-in` | Guest arrived | notifications |
| `booking.checked-out` | Guest left | cleaning, notifications |

Events go through BullMQ. No direct cross-module method calls.

---

## Error Codes
- `BOOKING_UNAVAILABLE` — unit not free for date range
- `BOOKING_INVALID_DATES` — checkOut <= checkIn or past dates
- `BOOKING_ALREADY_CANCELLED` — cancel attempt on cancelled booking
- `BOOKING_CANNOT_CANCEL` — booking is already CHECKED_IN
- `BOOKING_CANNOT_CHECK_IN` — booking not CONFIRMED or before checkIn date
- `UNIT_INACTIVE` — selected unit is deactivated

---

## Testing Priorities

1. Availability check with edge cases (same-day turnover, cancelled bookings, overlapping ranges)
2. Booking reference uniqueness under concurrent creation
3. State transitions (only valid transitions allowed)
4. Multi-tenancy — merchant A cannot see merchant B's bookings
5. Daily rate snapshot remains accurate when listing rate changes

---

## Common Tasks

### Add a new booking status
1. Update `BookingStatus` enum in `schema.prisma`
2. Run migration
3. Update state transition logic in `bookings.service.ts`
4. Update business rule BR-002 if it affects availability
5. Update `decision-log.md` with new entry

### Add a new filter to list endpoint
1. Add field to `BookingFilterDto`
2. Add to repository's filter builder
3. Add to controller route's query schema
4. Add API contract to `api-contracts.md`

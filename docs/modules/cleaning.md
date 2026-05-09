# Cleaning Module

> Manages cleaning workflow for booked units after check-out.
> Location: `apps/api/src/modules/cleaning/`

---

## Responsibilities

- Track cleaning status per booking
- Assign cleaning tasks to staff
- Record completion with optional photo proof
- Block unit availability until cleaning is `DONE`
- Surface cleaning queue to merchant staff

## What This Module Does NOT Do

- Trigger booking events (booking module emits, this module subscribes)
- Manage staff scheduling (out of scope for Stage 1)
- Send customer notifications about cleaning

---

## Data Model Reference

Primary entity: `CleaningLog`

| Field | Notes |
|---|---|
| `bookingId` | FK to booking |
| `assignedTo` | FK to user (staff) — optional |
| `status` | PENDING / IN_PROGRESS / DONE / SKIPPED |
| `notes` | Free-text cleaning notes |
| `imageUrls` | Array of proof photos |
| `startedAt` / `completedAt` | Timestamps |

A booking can have multiple `CleaningLog` records (e.g., re-cleaning after quality issue).

---

## Module Structure

```
/apps/api/src/modules/cleaning
  cleaning.module.ts
  cleaning.controller.ts
  cleaning.service.ts
  cleaning.repository.ts

  /dto
    assign-cleaning.dto.ts
    complete-cleaning.dto.ts
    cleaning-filter.dto.ts
    cleaning-response.dto.ts

  /listeners
    booking-checked-out.listener.ts
```

---

## Key Endpoints

```
GET    /api/v1/cleaning                                Cleaning queue (filtered)
GET    /api/v1/cleaning/:id
POST   /api/v1/cleaning/:bookingId/start               Mark IN_PROGRESS
POST   /api/v1/cleaning/:bookingId/complete            Mark DONE with proof
POST   /api/v1/cleaning/:bookingId/skip                Mark SKIPPED with reason
PATCH  /api/v1/cleaning/:id/assign                     Assign to staff
POST   /api/v1/cleaning/:bookingId/recreate            New log (re-cleaning)
```

---

## Workflow

```
Booking checked-out
  |
Auto-create CleaningLog (status: PENDING)
  |
Staff manually starts cleaning -> status: IN_PROGRESS, startedAt set
  |
Staff completes cleaning -> status: DONE, completedAt set, imageUrls optional
  |
Unit available for next booking
```

Alternative flow:
```
Issue found after DONE
  |
Create new CleaningLog (status: PENDING)
  |
Previous log preserved for audit
```

---

## State Transitions

```
PENDING --> IN_PROGRESS --> DONE
                        --> SKIPPED
```

Invalid transitions return error `INVALID_CLEANING_TRANSITION`.

---

## Business Rules Applied
See `business-rules.md`:
- BR-201 — Auto-trigger on check-out
- BR-202 — State lifecycle
- BR-203 — Re-cleaning preserves history

---

## Events

### Subscribed
- `booking.checked-out` — creates initial CleaningLog

### Emitted
- `cleaning.started`
- `cleaning.completed`
- `cleaning.skipped`

---

## Cleaning Queue Logic

Default queue view sorted by:
1. `bookings.checkOut` (oldest first — longest waiting)
2. `cleaningLogs.createdAt`

Filterable by:
- `status` (PENDING by default)
- `assignedTo` (current staff member)
- `propertyId`

---

## Photo Upload

`imageUrls` are populated via separate file upload endpoint:
```
POST /api/v1/cleaning/:id/photos    multipart/form-data
```

Backend uploads to Cloudflare R2, returns URLs, then updates the cleaning log.

---

## Error Codes
- `INVALID_CLEANING_TRANSITION` — invalid state transition attempt
- `CLEANING_LOG_NOT_FOUND`
- `CLEANING_NOT_ASSIGNED` — operation requires assignment
- `CLEANING_ALREADY_COMPLETED` — operation on DONE log

---

## Testing Priorities

1. Auto-create on `booking.checked-out` event
2. State transition validation
3. Multi-log per booking (re-cleaning scenario)
4. Multi-tenancy — staff sees only their merchant's queue
5. Photo upload integration

---

## Future Enhancements (Out of Scope for Stage 1)

- Cleaning checklist templates per property
- SLA tracking (cleaning duration)
- IoT-triggered cleaning (motion sensor / door sensor on check-out)
- Auto-assignment based on staff availability
- Cleaning service ratings from next guest

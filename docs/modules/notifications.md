# Notifications Module

> Multi-channel notification delivery (email, in-app).
> Location: `apps/api/src/modules/notifications/`

---

## Responsibilities

- Send email notifications via Resend or Postmark
- Store in-app notification records
- Track read/unread status
- Deliver notifications triggered by other module events

## What This Module Does NOT Do

- Decide when to notify (subscribes to events from other modules)
- Manage notification preferences (future enhancement)

---

## Data Model Reference

- `Notification` — delivery log with `userId`, `type`, `channel`, `isRead`, `data` (JSON payload for templating)

`Notification` records use hard deletes (not soft delete) — see DL-010 exception.

---

## Events Consumed

| Event | Notification |
|---|---|
| `booking.created` | Email to merchant staff |
| `booking.confirmed` | Email to customer |
| `booking.cancelled` | Email to customer + merchant |
| `booking.checked-in` | In-app to merchant |
| `booking.checked-out` | In-app to merchant |
| `payment.received` | Email receipt to customer |
| `cleaning.completed` | In-app to merchant staff |
| `loyalty.tier-upgraded` | Email to customer (Stage 2) |

---

## Events Emitted

None.

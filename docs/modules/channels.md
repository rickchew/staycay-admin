# Channels Module

> Channel = a distribution channel where a property is listed.
> MVP scope is **origin tagging + reporting only** — full OTA sync is
> Stage 2 of the product roadmap.
> Location: `apps/api/src/modules/channels/`

---

## Scope Split

| Capability | Phase |
|---|---|
| Global `Channel` registry (seeded list of OTAs + DIRECT) | **MVP (Stage 6)** |
| `Booking.channelId` + `externalBookingRef` fields | **MVP (Stage 6)** |
| Manual channel tagging on booking create | **MVP (Stage 6)** |
| Channel-mix dashboard / report | **MVP (Stage 6)** |
| `ChannelAccount` (encrypted creds per merchant per channel) | **Stage 2 roadmap** |
| `ChannelListing` (per-listing mapping to external listing) | **Stage 2 roadmap** |
| Outbound availability/rate push to channels | **Stage 2 roadmap** |
| Inbound booking webhooks from channels | **Stage 2 roadmap** |

Keeping MVP narrow lets us track where bookings come from from day one without committing to building API integrations against every OTA.

---

## Data Model Reference

Primary entities: `Channel`, `ChannelAccount`, `ChannelListing` (see `data-models.md`).

Seeded channels (MVP):
- `DIRECT` (own website / walk-in / phone)
- `AGODA`
- `BOOKING_COM`
- `AIRBNB`
- `EXPEDIA`
- `OTHER` (free-text fallback when staff doesn't know which channel)

---

## MVP Behaviour

### Booking create flow
1. `POST /bookings` accepts `channelId` (defaults to `DIRECT`) and optional `externalBookingRef`.
2. Service validates `channelId` exists; rejects with `CHANNEL_UNKNOWN` if not.
3. Booking row stores both fields. No external sync happens.

### Reporting
- `GET /reports/channel-mix?from=&to=` returns:
  ```json
  {
    "byChannel": [
      { "channelCode": "DIRECT",      "bookings": 42, "revenue": 12500.00 },
      { "channelCode": "AGODA",       "bookings": 17, "revenue":  6300.00 },
      { "channelCode": "BOOKING_COM", "bookings":  9, "revenue":  3950.00 }
    ],
    "from": "2026-04-01",
    "to":   "2026-04-30"
  }
  ```
- Dashboard pie chart consumes this.

---

## Stage 2 Roadmap — OTA Sync

When this stage lands:

1. **Onboarding** — Each merchant connects channels via `POST /channel-accounts` with encrypted credentials (same pattern as `PaymentGatewayConfig`). Connectivity verified by `POST /channel-accounts/:id/test`.
2. **Listing mapping** — For each `Listing`, operator creates `ChannelListing` rows linking to external listing IDs and setting per-channel rate adjustments.
3. **Outbound sync** — On `booking.confirmed` / `booking.cancelled`, a BullMQ job pushes availability changes for the affected unit to every active `ChannelListing` for its `Listing`.
4. **Inbound webhooks** — `/webhooks/channels/:channelCode` endpoints receive booking events from channels. Service resolves the matching merchant + listing via `ChannelListing.externalListingId`, runs guest find-or-create per `guests.md`, and creates the local `Booking` with `channelId` and `externalBookingRef` set.
5. **Reconciliation job** — Nightly job compares local availability against each channel's pulled inventory and flags mismatches in `ChannelListing.syncStatus = OUT_OF_SYNC`.

### Channel-aware Cancellation
Direct cancellation of a channel booking must also notify the channel — BR-CH06 details retry and surfacing.

---

## Portal Pages

### MVP
| Path | Description |
|---|---|
| `/bookings/new` | Channel dropdown in the create form (defaults to DIRECT) |
| `/bookings/:id` | Channel badge on the booking; `externalBookingRef` shown if present |
| Dashboard | "Channel mix" card showing booking count + revenue split by channel |

### Stage 2 roadmap
| Path | Description |
|---|---|
| `/settings/channels` | Connected channel accounts with masked credentials + sync status |
| `/listings/:id` | Per-channel sync panel: which channels carry this listing, current sync status, last sync time |

---

## What This Module Does NOT Do

- **Authentication into channels** — handled by per-channel adapter implementations (Stage 2).
- **Rate parity enforcement** — operators decide rate adjustments per channel; we never auto-equalise prices.
- **Guest data merge across channels** — each channel-originated booking flows through `guests.findOrCreate` like any other; merging Agoda's "John Doe" with Booking.com's "John D." is a future problem.

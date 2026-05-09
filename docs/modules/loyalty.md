# Loyalty Module (Stage 2)

> Customer retention via points-based rewards.
> Status: **Schema ready, implementation pending Stage 2.**
> Location: `apps/api/src/modules/loyalty/`

---

## Responsibilities

- Maintain per-customer points balance
- Credit points on confirmed payments
- Reverse points on refunds
- Allow redemption at booking checkout
- Track tier progression (Bronze, Silver, Gold)
- Expire points after 24 months

## What This Module Does NOT Do

- Process payments (delegated to `payments`)
- Calculate booking totals (delegated to `bookings`)
- Send tier upgrade notifications directly (events to `notifications`)

---

## Data Model Reference

Primary entities:
- `LoyaltyAccount` — one per customer (auto-created on first qualifying booking)
- `LoyaltyTransaction` — append-only ledger of all point movements

Both already exist in the Prisma schema. No migration needed when activating Stage 2.

---

## Module Structure (Planned)

```
/apps/api/src/modules/loyalty
  loyalty.module.ts
  loyalty.controller.ts
  loyalty.service.ts
  loyalty.repository.ts

  /dto
    redeem-points.dto.ts
    loyalty-account-response.dto.ts
    loyalty-transaction-response.dto.ts

  /helpers
    points-calculator.ts
    tier-resolver.ts
    expiry-scheduler.ts

  /listeners
    payment-received.listener.ts        # earn points
    booking-cancelled.listener.ts       # reverse points
```

---

## Key Endpoints (Planned)

```
GET    /api/v1/loyalty/me                          Customer's account + balance
GET    /api/v1/loyalty/me/transactions             Transaction history
POST   /api/v1/loyalty/me/redeem                   Redeem points (returns voucher code)

GET    /api/v1/loyalty/customers/:id               Admin view
POST   /api/v1/loyalty/customers/:id/adjust        Admin manual adjustment
```

---

## Earning Logic

```typescript
calculatePointsEarned(amount: Decimal): number {
  // BR-401: 1 point per RM 1 spent
  return Math.floor(amount.toNumber());
}
```

Triggered on `payment.received` event when booking transitions to PAID.

```typescript
@OnEvent('payment.received')
async handlePaymentReceived(event: PaymentReceivedEvent) {
  const booking = await this.bookings.findById(event.bookingId);
  if (booking.paymentStatus !== 'PAID') return;
  if (booking.loyaltyTransactionId) return; // already credited

  const account = await this.getOrCreateAccount(booking.customerId);
  const points = this.calculatePointsEarned(booking.totalAmount);

  await this.creditPoints(account.id, points, {
    type: 'EARNED',
    description: `Booking ${booking.bookingRef}`,
    bookingId: booking.id,
    expiresAt: addMonths(new Date(), 24),
  });
}
```

---

## Redemption Logic

```typescript
async redeemPoints(userId: string, points: number) {
  const account = await this.repo.findByUser(userId);

  if (account.balance < points) {
    throw new ApiException('INSUFFICIENT_LOYALTY_POINTS');
  }

  // 100 points = RM 1 discount
  const discountAmount = new Decimal(points).div(100);

  await this.debitPoints(account.id, points, {
    type: 'REDEEMED',
    description: `Redeemed ${points} points for RM ${discountAmount}`,
  });

  return { discountAmount, voucherCode: this.generateVoucher() };
}
```

---

## Tier System

```typescript
const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 5000,
};

resolveTier(lifetimeEarned: number): Tier {
  if (lifetimeEarned >= 5000) return 'GOLD';
  if (lifetimeEarned >= 1000) return 'SILVER';
  return 'BRONZE';
}
```

Tier is recalculated on every credit. Demotion happens only on manual admin adjustment.

---

## Expiry Job

Daily cron job:
```typescript
@Cron('0 2 * * *')  // 2 AM daily
async expireOldPoints() {
  const expired = await this.repo.findExpiredEarnings();

  for (const earning of expired) {
    await this.debitPoints(earning.accountId, earning.points, {
      type: 'EXPIRED',
      description: `Points from ${earning.createdAt.toISOString()} expired`,
    });
  }
}
```

---

## Running Balance Pattern

Every `LoyaltyTransaction` stores `balance` after the transaction. This makes:
- History queries fast (no SUM aggregation)
- Audit reconstruction simple
- Reversals straightforward (debit creates new row, never modifies past)

```typescript
async creditPoints(accountId, points, meta) {
  return this.prisma.$transaction(async tx => {
    const account = await tx.loyaltyAccount.update({
      where: { id: accountId },
      data: {
        balance: { increment: points },
        lifetimeEarned: { increment: points },
      },
    });

    await tx.loyaltyTransaction.create({
      data: {
        accountId,
        type: meta.type,
        points: points,           // positive
        balance: account.balance, // running balance
        description: meta.description,
        bookingId: meta.bookingId,
        expiresAt: meta.expiresAt,
      },
    });

    // Update tier if changed
    const newTier = this.resolveTier(account.lifetimeEarned);
    if (newTier !== account.tier) {
      await tx.loyaltyAccount.update({
        where: { id: accountId },
        data: { tier: newTier },
      });
      this.events.emit('loyalty.tier-upgraded', { accountId, tier: newTier });
    }
  });
}
```

---

## Business Rules Applied
- BR-401 — Earning rate (1 point per RM 1)
- BR-402 — Tier thresholds and benefits
- BR-403 — 24-month expiry
- BR-404 — Redemption rules

---

## Events

### Subscribed
- `payment.received` — credit points
- `booking.cancelled` — reverse points (if previously credited)
- `payment.refunded` — reverse proportional points

### Emitted
- `loyalty.points-earned`
- `loyalty.points-redeemed`
- `loyalty.points-expired`
- `loyalty.tier-upgraded`

---

## Error Codes
- `INSUFFICIENT_LOYALTY_POINTS`
- `LOYALTY_ACCOUNT_INACTIVE`
- `LOYALTY_REDEMPTION_NOT_ALLOWED` — tried to redeem on already-confirmed booking

---

## Testing Priorities

1. Concurrent earnings don't double-credit
2. Cancellation correctly reverses earned points
3. Expiry job handles partial-month edge cases
4. Tier transitions emit events correctly
5. Redemption + booking creation is atomic

---

## Activation Checklist (When Moving to Stage 2)

- [ ] Wire `LoyaltyModule` into `AppModule`
- [ ] Implement `payment-received` listener
- [ ] Add public-facing endpoints to customer site
- [ ] Set up cron job for expiry
- [ ] Backfill existing customers' lifetime points (if any)
- [ ] Add tier display to customer profile UI
- [ ] Update `decision-log.md` with activation entry

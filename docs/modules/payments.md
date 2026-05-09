# Payments Module

> Gateway-agnostic payment processing for bookings.
> Location: `apps/api/src/modules/payments/`

---

## Responsibilities

- Record manual payments (cash, bank transfer)
- Initiate Billplz bills for online FPX/card payments
- Handle webhook callbacks from gateways
- Update booking `paymentStatus` based on aggregated payments
- Trigger booking confirmation when fully paid
- Process refunds (Stage 2)

## What This Module Does NOT Do

- Calculate booking totals (booking module handles)
- Manage gateway credentials per merchant (settings module)
- Send payment receipt emails (notifications module)

---

## Data Model Reference

Primary entity: `Payment`

A `Booking` has many `Payment` records. Booking's `paymentStatus` is derived from sum of payments.

---

## Module Structure

```
/apps/api/src/modules/payments
  payments.module.ts
  payments.controller.ts
  payments.service.ts
  payments.repository.ts

  /gateways
    payment-gateway.interface.ts
    billplz.gateway.ts
    stripe.gateway.ts          # Stage 2
    manual.gateway.ts

  /webhooks
    billplz-webhook.controller.ts
    stripe-webhook.controller.ts  # Stage 2

  /dto
    record-manual-payment.dto.ts
    initiate-billplz.dto.ts
    refund-payment.dto.ts

  /helpers
    payment-status.calculator.ts
    signature-verifier.ts
```

---

## Gateway Abstraction

All gateways implement a common interface:

```typescript
interface PaymentGateway {
  name: PaymentGatewayName;

  initiate(booking: Booking, amount: Decimal): Promise<{
    gatewayRefId: string;
    paymentUrl?: string;
    rawResponse: any;
  }>;

  verifyWebhook(payload: any, signature: string): boolean;

  parseWebhook(payload: any): {
    gatewayRefId: string;
    status: PaymentStatus;
    paidAt?: Date;
  };

  refund(payment: Payment, reason: string): Promise<{
    gatewayRefId: string;
    rawResponse: any;
  }>;
}
```

This lets the service layer be gateway-agnostic. Adding a new gateway only requires implementing the interface.

---

## Key Endpoints

```
GET    /api/v1/bookings/:id/payments                  List payments for booking
POST   /api/v1/payments/:bookingId/manual             Record manual payment
POST   /api/v1/payments/:bookingId/billplz            Initiate Billplz bill
POST   /api/v1/payments/:id/refund                    Refund payment (Stage 2)

POST   /api/v1/webhooks/billplz                       Public webhook endpoint
POST   /api/v1/webhooks/stripe                        Public webhook endpoint (Stage 2)
```

Webhooks are public (no auth) but verified via signature.

---

## Payment Flow — Billplz

```
1. Customer clicks "Pay Now"
   |
2. Frontend calls POST /payments/:bookingId/billplz
   |
3. Backend creates Payment row (status: UNPAID)
   |
4. Backend calls Billplz API -> receives bill_id + payment_url
   |
5. Backend stores bill_id in Payment.gatewayRefId
   |
6. Frontend redirects customer to payment_url
   |
7. Customer completes payment on Billplz hosted page
   |
8. Billplz sends webhook -> POST /webhooks/billplz
   |
9. Backend verifies signature
   |
10. Backend updates Payment status + gatewayResponse
    |
11. If status = PAID, emit payment.received event
    |
12. Bookings module subscribes -> updates booking paymentStatus
    |
13. If fully paid, transition booking to CONFIRMED
```

---

## Payment Flow — Manual

```
1. Customer pays cash/bank transfer offline
   |
2. Merchant staff opens booking in portal
   |
3. Staff records payment via POST /payments/:bookingId/manual
   |
4. Backend creates Payment row (status: PAID immediately)
   |
5. Audit log entry created
   |
6. Same downstream flow (booking confirmation)
```

---

## Webhook Idempotency

Critical pattern — Billplz may retry webhooks:

```typescript
async handleBillplzWebhook(payload, signature) {
  if (!this.gateway.verifyWebhook(payload, signature)) {
    throw new UnauthorizedException();
  }

  const parsed = this.gateway.parseWebhook(payload);
  const existing = await this.repo.findByGatewayRefId(parsed.gatewayRefId);

  if (!existing) {
    this.logger.warn('Webhook for unknown payment', parsed);
    return; // 200 to gateway, ignore
  }

  if (existing.status === parsed.status) {
    return; // Already processed, idempotent return
  }

  await this.repo.update(existing.id, {
    status: parsed.status,
    paidAt: parsed.paidAt,
    gatewayResponse: payload,
  });

  this.events.emit('payment.received', { paymentId: existing.id });
}
```

---

## Payment Status Calculator

```typescript
calculateBookingPaymentStatus(payments: Payment[], totalAmount: Decimal): PaymentStatus {
  const paid = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum.add(p.amount), new Decimal(0));

  const refunded = payments
    .filter(p => p.status === 'REFUNDED')
    .reduce((sum, p) => sum.add(p.amount), new Decimal(0));

  if (refunded.gte(paid) && paid.gt(0)) return 'REFUNDED';
  if (paid.gte(totalAmount)) return 'PAID';
  if (paid.gt(0)) return 'PARTIAL';
  return 'UNPAID';
}
```

---

## Business Rules Applied
- BR-101 — Payment status derivation
- BR-102 — Booking confirmation trigger
- BR-103 — Manual payment requires merchant role
- BR-104 — Webhook idempotency

---

## Events Emitted

| Event | Trigger |
|---|---|
| `payment.recorded` | Manual payment created |
| `payment.initiated` | Online payment started |
| `payment.received` | Webhook confirms payment |
| `payment.failed` | Webhook reports failure |
| `payment.refunded` | Refund processed |

---

## Configuration

Per-environment via env variables:
```
BILLPLZ_API_KEY=
BILLPLZ_COLLECTION_ID=
BILLPLZ_X_SIGNATURE_KEY=
BILLPLZ_SANDBOX=true|false
```

Per-merchant config (in `merchants.settings` JSON):
- `billplz_collection_id_override` — if merchant has own collection
- `accept_manual_payments` — boolean

---

## Error Codes
- `PAYMENT_GATEWAY_ERROR` — gateway returned error
- `PAYMENT_INVALID_SIGNATURE` — webhook signature failed
- `PAYMENT_AMOUNT_MISMATCH` — webhook amount doesn't match payment record
- `PAYMENT_ALREADY_PAID` — duplicate payment attempt
- `REFUND_AMOUNT_EXCEEDS_PAID` — refund > paid amount

---

## Testing Priorities

1. Webhook idempotency under retries
2. Signature verification rejects tampered payloads
3. Payment status calculation across multiple payments + refunds
4. Concurrent webhook handling (race conditions)
5. Manual payment audit logging

---

## Stage 2 Additions
- Stripe gateway implementation
- Recurring payments for loyalty subscriptions
- Refund flow with merchant approval
- Multi-currency (USD, SGD)

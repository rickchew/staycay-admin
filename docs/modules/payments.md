# Payments Module

> Modular, multi-gateway payment processing for bookings.
> Location: `apps/api/src/modules/payments/`

---

## Responsibilities

- Record manual payments (cash, bank transfer)
- Initiate online payments via any configured gateway (Billplz, Fiuu, Stripe, etc.)
- Handle webhook callbacks from all gateways
- Update booking `paymentStatus` based on aggregated payments
- Trigger booking confirmation when fully paid
- Manage per-merchant gateway configurations
- Process refunds (Stage 2)

## What This Module Does NOT Do

- Calculate booking totals (booking module handles)
- Send payment receipt emails (notifications module)

---

## Data Model Reference

Primary entities:
- `Payment` — individual payment record, linked to a booking and optionally to a gateway config
- `PaymentGatewayConfig` — per-merchant gateway credentials (encrypted)

A `Booking` has many `Payment` records. Booking's `paymentStatus` is derived from sum of payments.

---

## Module Structure

```
/apps/api/src/modules/payments
  payments.module.ts
  payments.controller.ts
  payments.service.ts
  payments.repository.ts

  /gateway-configs
    gateway-config.controller.ts
    gateway-config.service.ts
    gateway-config.repository.ts
    gateway-config.dto.ts

  /gateways
    payment-gateway.interface.ts
    gateway.registry.ts
    billplz.gateway.ts
    fiuu.gateway.ts
    stripe.gateway.ts
    manual.gateway.ts

  /webhooks
    webhook-router.controller.ts
    billplz-webhook.handler.ts
    fiuu-webhook.handler.ts
    stripe-webhook.handler.ts

  /dto
    record-manual-payment.dto.ts
    initiate-payment.dto.ts
    refund-payment.dto.ts
    create-gateway-config.dto.ts
    update-gateway-config.dto.ts

  /helpers
    payment-status.calculator.ts
    credential-encryption.ts
```

---

## Gateway Abstraction

All gateways implement a common interface:

```typescript
interface PaymentGateway {
  name: PaymentGatewayName;

  validateCredentials(credentials: Record<string, any>): ValidationResult;

  initiate(config: PaymentGatewayConfig, booking: Booking, amount: Decimal): Promise<{
    gatewayRefId: string;
    paymentUrl?: string;
    rawResponse: any;
  }>;

  verifyWebhook(config: PaymentGatewayConfig, payload: any, signature: string): boolean;

  parseWebhook(payload: any): {
    gatewayRefId: string;
    status: PaymentStatus;
    paidAt?: Date;
  };

  refund(config: PaymentGatewayConfig, payment: Payment, reason: string): Promise<{
    gatewayRefId: string;
    rawResponse: any;
  }>;
}
```

Key difference from single-gateway design: every method receives the `PaymentGatewayConfig` so it can use the correct merchant-specific credentials.

---

## Gateway Registry

Gateways are registered in a central registry, injected via NestJS DI:

```typescript
@Injectable()
class GatewayRegistry {
  private gateways = new Map<PaymentGatewayName, PaymentGateway>();

  register(gateway: PaymentGateway) {
    this.gateways.set(gateway.name, gateway);
  }

  get(name: PaymentGatewayName): PaymentGateway {
    const gw = this.gateways.get(name);
    if (!gw) throw new ApiException('PAYMENT_GATEWAY_NOT_CONFIGURED');
    return gw;
  }

  list(): PaymentGatewayName[] {
    return [...this.gateways.keys()];
  }
}
```

Adding a new gateway = implement the interface + register in the module. Zero changes to the service layer.

---

## Gateway Credential Shapes

Each gateway type expects a specific JSON shape in `PaymentGatewayConfig.credentials`:

| Gateway | Credential Fields |
|---|---|
| `BILLPLZ` | `apiKey`, `collectionId`, `xSignatureKey` |
| `FIUU` | `merchantId`, `verifyKey`, `secretKey` |
| `STRIPE` | `secretKey`, `webhookSecret` |
| `MANUAL` | _(no config needed — special case)_ |

Credentials are validated against the gateway's schema at config creation time via `gateway.validateCredentials()`.

---

## Key Endpoints

### Gateway Configs (Merchant scope)
```
GET    /api/v1/gateway-configs                         List merchant's configs
POST   /api/v1/gateway-configs                         Create config
GET    /api/v1/gateway-configs/:id                     Get config (masked creds)
PATCH  /api/v1/gateway-configs/:id                     Update config
DELETE /api/v1/gateway-configs/:id                     Soft-delete
POST   /api/v1/gateway-configs/:id/set-default         Set as default
POST   /api/v1/gateway-configs/:id/test                Test connectivity
```

### Payments
```
GET    /api/v1/bookings/:id/payments                   List payments for booking
POST   /api/v1/payments/:bookingId/manual              Record manual payment
POST   /api/v1/payments/:bookingId/initiate            Initiate online payment
POST   /api/v1/payments/:id/refund                     Refund payment (Stage 2)
```

### Webhooks (Public, signature-verified)
```
POST   /api/v1/webhooks/billplz
POST   /api/v1/webhooks/fiuu
POST   /api/v1/webhooks/stripe
```

---

## Payment Initiation Flow

```
1. Frontend calls POST /payments/:bookingId/initiate
   Body: { gatewayConfigId?: string }   (optional — uses default if omitted)
   |
2. Service resolves PaymentGatewayConfig:
   - If gatewayConfigId provided → fetch and verify it belongs to merchant
   - If omitted → fetch merchant's default config (isDefault = true)
   |
3. Service gets gateway from registry: registry.get(config.gateway)
   |
4. Service calls gateway.initiate(config, booking, amount)
   |
5. Gateway calls external API using config.credentials
   → receives gatewayRefId + paymentUrl
   |
6. Service creates Payment row:
   { gatewayConfigId, gateway, gatewayRefId, status: UNPAID }
   |
7. Returns paymentUrl to frontend for redirect
```

---

## Payment Flow — Manual

```
1. Customer pays cash/bank transfer offline
   |
2. Merchant staff calls POST /payments/:bookingId/manual
   |
3. Service creates Payment row:
   { gatewayConfigId: null, gateway: MANUAL, status: PAID }
   |
4. Audit log entry created
   |
5. Same downstream flow (payment status recalc → booking confirmation)
```

---

## Webhook Flow (All Gateways)

```
1. Gateway sends webhook → POST /webhooks/:gatewayName
   |
2. Webhook handler parses payload → extracts gatewayRefId
   |
3. Look up Payment by gatewayRefId
   |
4. Load PaymentGatewayConfig from payment.gatewayConfigId
   |
5. Verify signature using config.credentials:
   gateway.verifyWebhook(config, payload, signature)
   |
6. Parse status: gateway.parseWebhook(payload)
   |
7. Update Payment row (status, paidAt, gatewayResponse)
   |
8. Emit payment.received event → booking status update
```

---

## Webhook Idempotency

Critical pattern — gateways may retry webhooks:

```typescript
async handleWebhook(gatewayName: PaymentGatewayName, payload: any, signature: string) {
  const gateway = this.registry.get(gatewayName);
  const parsed = gateway.parseWebhook(payload);

  const payment = await this.repo.findByGatewayRefId(parsed.gatewayRefId);
  if (!payment) {
    this.logger.warn('Webhook for unknown payment', { gatewayName, ...parsed });
    return;
  }

  const config = await this.configRepo.findById(payment.gatewayConfigId);
  if (!gateway.verifyWebhook(config, payload, signature)) {
    throw new UnauthorizedException();
  }

  if (payment.status === parsed.status) {
    return; // Already processed, idempotent
  }

  await this.repo.update(payment.id, {
    status: parsed.status,
    paidAt: parsed.paidAt,
    gatewayResponse: payload,
  });

  this.events.emit('payment.received', { paymentId: payment.id });
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

## Gateway Config Business Rules

- Each merchant can have multiple gateway configs (hybrid setup)
- Exactly one config per merchant must be `isDefault = true`
- Creating the first config auto-sets it as default
- Credentials are encrypted at rest using AES-256
- API responses mask credentials (e.g., `"apiKey": "sk_...7f2a"`)
- A config cannot be deactivated if it has pending (UNPAID) payments
- `POST /gateway-configs/:id/test` calls the gateway's API with the stored credentials to verify connectivity
- Gateway config changes are audit-logged

---

## Business Rules Applied
- BR-101 — Payment status derivation
- BR-102 — Booking confirmation trigger
- BR-103 — Manual payment requires merchant role
- BR-104 — Webhook idempotency
- BR-105 — Gateway configuration rules
- BR-106 — Gateway routing

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

## Credential Encryption

```typescript
// credentials stored as encrypted JSON in PaymentGatewayConfig
encrypt(credentials: Record<string, string>): string
decrypt(encryptedCredentials: string): Record<string, string>
mask(credentials: Record<string, string>): Record<string, string>
```

Encryption key is stored in environment: `GATEWAY_CREDENTIALS_ENCRYPTION_KEY`.

---

## Configuration

Environment variables (platform-level):
```
GATEWAY_CREDENTIALS_ENCRYPTION_KEY=    AES-256 key for credential encryption
```

Per-merchant config is now stored in `PaymentGatewayConfig` records, not in `merchants.settings` JSON.

Retained in `merchants.settings`:
- `accept_manual_payments` — boolean
- `deposit_confirms_booking` — boolean

---

## Error Codes
- `PAYMENT_GATEWAY_ERROR` — gateway returned error
- `PAYMENT_GATEWAY_NOT_CONFIGURED` — merchant has no active config for requested gateway
- `PAYMENT_GATEWAY_CONFIG_INVALID` — credentials failed validation or connectivity test
- `PAYMENT_INVALID_SIGNATURE` — webhook signature failed
- `PAYMENT_AMOUNT_MISMATCH` — webhook amount doesn't match payment record
- `PAYMENT_ALREADY_PAID` — duplicate payment attempt
- `REFUND_AMOUNT_EXCEEDS_PAID` — refund > paid amount
- `GATEWAY_CONFIG_HAS_PENDING` — cannot deactivate config with pending payments

---

## Testing Priorities

1. Multi-gateway: same merchant uses Billplz + Fiuu for different payments
2. Webhook idempotency under retries per gateway
3. Signature verification uses correct merchant credentials (not another merchant's)
4. Gateway registry returns correct handler per gateway name
5. Credential encryption round-trip (encrypt → store → decrypt → use)
6. Payment status calculation across multiple payments from different gateways
7. Default gateway fallback when `gatewayConfigId` not specified
8. Manual payment audit logging

---

## Adding a New Gateway

1. Implement `PaymentGateway` interface in `/gateways/{name}.gateway.ts`
2. Add credential shape validation in `validateCredentials()`
3. Add webhook handler in `/webhooks/{name}-webhook.handler.ts`
4. Register gateway in `payments.module.ts` providers
5. Add gateway name to `PaymentGatewayName` enum in Prisma schema
6. Run migration
7. Add webhook endpoint to `api-contracts.md`

No changes needed to: service layer, payment status calculator, or existing gateway implementations.

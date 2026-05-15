import { faker } from '@faker-js/faker';
import { MOCK_BOOKINGS } from './bookings';

export type PaymentMethod = 'MANUAL' | 'BILLPLZ' | 'FIUU';

export type Payment = {
  id: string;
  bookingId: string;
  bookingRef: string;
  amount: number;
  method: PaymentMethod;
  status: 'PAID' | 'UNPAID' | 'REFUNDED';
  reference: string;
  paidAt: string;
};

faker.seed(606);

export const MOCK_PAYMENTS: Payment[] = MOCK_BOOKINGS.filter((b) => b.paidAmount > 0).map((b) => ({
  id: faker.string.alphanumeric(12),
  bookingId: b.id,
  bookingRef: b.ref,
  amount: b.paidAmount,
  method: faker.helpers.arrayElement<PaymentMethod>(['MANUAL', 'BILLPLZ', 'FIUU']),
  status: b.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'PAID',
  reference: faker.string.alphanumeric(16).toUpperCase(),
  paidAt: b.createdAt,
}));

export type GatewayConfig = {
  id: string;
  gateway: 'BILLPLZ' | 'FIUU';
  label: string;
  isDefault: boolean;
  isActive: boolean;
  maskedKey: string;
};

export const MOCK_GATEWAY_CONFIGS: GatewayConfig[] = [
  { id: 'gw_1', gateway: 'BILLPLZ', label: 'Billplz Main', isDefault: true, isActive: true, maskedKey: 'bplz_…a82f' },
  { id: 'gw_2', gateway: 'FIUU', label: 'Fiuu Backup', isDefault: false, isActive: true, maskedKey: 'fiuu_…7d1c' },
];

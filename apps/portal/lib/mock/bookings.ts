import { faker } from '@faker-js/faker';
import { MOCK_LISTINGS } from './listings';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';

export type Booking = {
  id: string;
  ref: string;
  merchantId: string;
  listingId: string;
  listingName: string;
  propertyName: string;
  unitId: string;
  unitName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  dailyRate: number;
  subtotal: number;
  paidAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  specialRequest: string | null;
  createdAt: string;
};

faker.seed(505);

const today = new Date();
function daysFromNow(days: number) {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d;
}
function diffDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export const MOCK_BOOKINGS: Booking[] = Array.from({ length: 60 }, (_, i) => {
  const listing = faker.helpers.arrayElement(MOCK_LISTINGS);
  const unit = faker.helpers.arrayElement(listing.units);
  const offset = faker.number.int({ min: -45, max: 60 });
  const nights = faker.number.int({ min: 1, max: 7 });
  const checkIn = daysFromNow(offset);
  const checkOut = daysFromNow(offset + nights);

  let status: BookingStatus;
  if (offset > 5) status = faker.helpers.arrayElement<BookingStatus>(['PENDING', 'CONFIRMED']);
  else if (offset > -1) status = 'CONFIRMED';
  else if (offset + nights >= 0) status = 'CHECKED_IN';
  else status = faker.helpers.arrayElement<BookingStatus>(['CHECKED_OUT', 'CHECKED_OUT', 'CANCELLED']);

  const subtotal = nights * listing.dailyRate;
  let paidAmount = 0;
  let paymentStatus: PaymentStatus = 'UNPAID';
  if (status === 'CANCELLED') {
    paidAmount = faker.datatype.boolean() ? subtotal : 0;
    paymentStatus = paidAmount > 0 ? 'REFUNDED' : 'UNPAID';
  } else if (status === 'PENDING') {
    paidAmount = faker.datatype.boolean({ probability: 0.4 }) ? Math.round(subtotal * 0.3) : 0;
    paymentStatus = paidAmount > 0 ? 'PARTIAL' : 'UNPAID';
  } else {
    paidAmount = subtotal;
    paymentStatus = 'PAID';
  }

  return {
    id: faker.string.alphanumeric(12),
    ref: `BK-2026-${String(10000 + i).padStart(5, '0')}`,
    merchantId: listing.merchantId,
    listingId: listing.id,
    listingName: listing.name,
    propertyName: listing.propertyName,
    unitId: unit.id,
    unitName: unit.name,
    guestName: faker.person.fullName(),
    guestEmail: faker.internet.email().toLowerCase(),
    guestPhone: `+60 1${faker.number.int({ min: 0, max: 9 })}-${faker.number.int({ min: 1000000, max: 9999999 })}`,
    checkIn: checkIn.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
    nights,
    dailyRate: listing.dailyRate,
    subtotal,
    paidAmount,
    status,
    paymentStatus,
    specialRequest: faker.datatype.boolean({ probability: 0.25 }) ? faker.lorem.sentence() : null,
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
  };
});

export const BOOKINGS_KPI = {
  totalThisMonth: MOCK_BOOKINGS.filter((b) => new Date(b.checkIn).getMonth() === today.getMonth()).length,
  revenueThisMonth: MOCK_BOOKINGS.filter((b) => b.paymentStatus === 'PAID' && new Date(b.checkIn).getMonth() === today.getMonth()).reduce((s, b) => s + b.paidAmount, 0),
  upcomingCheckIns: MOCK_BOOKINGS.filter((b) => b.status === 'CONFIRMED' && new Date(b.checkIn) >= new Date(today.toDateString()) && diffDays(new Date(today.toDateString()), new Date(b.checkIn)) <= 7).length,
  occupiedNow: MOCK_BOOKINGS.filter((b) => b.status === 'CHECKED_IN').length,
};

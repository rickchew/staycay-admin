import { faker } from '@faker-js/faker';

export type NotificationType =
  | 'BOOKING_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_RECEIVED'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'CLEANING_DONE';

export type StaycayNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
};

faker.seed(808);

const TEMPLATES: { type: NotificationType; title: string }[] = [
  { type: 'BOOKING_CREATED', title: 'New booking received' },
  { type: 'BOOKING_CONFIRMED', title: 'Booking confirmed' },
  { type: 'BOOKING_CANCELLED', title: 'Booking cancelled' },
  { type: 'PAYMENT_RECEIVED', title: 'Payment received' },
  { type: 'CHECK_IN', title: 'Guest checked in' },
  { type: 'CHECK_OUT', title: 'Guest checked out' },
  { type: 'CLEANING_DONE', title: 'Cleaning completed' },
];

export const MOCK_NOTIFICATIONS: StaycayNotification[] = Array.from({ length: 12 }, () => {
  const t = faker.helpers.arrayElement(TEMPLATES);
  return {
    id: faker.string.alphanumeric(12),
    type: t.type,
    title: t.title,
    body: `${faker.person.firstName()} · ${faker.helpers.arrayElement(['Soho Suite', 'Garden Villa', 'City Studio'])}`,
    createdAt: faker.date.recent({ days: 5 }).toISOString(),
    isRead: faker.datatype.boolean({ probability: 0.4 }),
  };
});

export const UNREAD_NOTIFICATION_COUNT = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

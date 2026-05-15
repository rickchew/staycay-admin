import { faker } from '@faker-js/faker';
import { MOCK_BOOKINGS } from './bookings';
import { MOCK_USERS } from './users';

export type CleaningStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'SKIPPED';

export type CleaningLog = {
  id: string;
  bookingId: string;
  bookingRef: string;
  propertyName: string;
  unitName: string;
  status: CleaningStatus;
  assignedToName: string | null;
  scheduledFor: string;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
};

faker.seed(707);

const staff = MOCK_USERS.filter((u) => u.role === 'STAFF');

export const MOCK_CLEANING_LOGS: CleaningLog[] = MOCK_BOOKINGS.filter((b) =>
  ['CHECKED_OUT', 'CHECKED_IN'].includes(b.status),
)
  .slice(0, 24)
  .map((b, i) => {
    const status: CleaningStatus =
      b.status === 'CHECKED_IN'
        ? 'PENDING'
        : i % 4 === 0
          ? 'PENDING'
          : i % 4 === 1
            ? 'IN_PROGRESS'
            : i % 4 === 2
              ? 'DONE'
              : 'SKIPPED';
    return {
      id: faker.string.alphanumeric(12),
      bookingId: b.id,
      bookingRef: b.ref,
      propertyName: b.propertyName,
      unitName: b.unitName,
      status,
      assignedToName: status === 'PENDING' ? null : faker.helpers.arrayElement(staff).name,
      scheduledFor: b.checkOut,
      startedAt: status === 'PENDING' ? null : faker.date.recent({ days: 3 }).toISOString(),
      completedAt: status === 'DONE' ? faker.date.recent({ days: 2 }).toISOString() : null,
      notes: status === 'SKIPPED' ? 'Guest extended stay' : null,
    };
  });

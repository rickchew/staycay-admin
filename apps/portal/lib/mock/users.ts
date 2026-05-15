import { faker } from '@faker-js/faker';
import { MOCK_MERCHANTS } from './merchants';
import type { StaycayRole } from './roles';

export type StaycayUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaycayRole;
  merchantId: string | null;
  merchantName: string | null;
  avatarUrl: string;
  isActive: boolean;
  lastLoginAt: string;
};

faker.seed(202);

export const MOCK_USERS: StaycayUser[] = Array.from({ length: 25 }, (_, i) => {
  const role: StaycayRole =
    i === 0
      ? 'SUPER_ADMIN'
      : i < 6
        ? 'PROPERTY_OWNER'
        : 'STAFF';
  const merchant = role === 'SUPER_ADMIN' ? null : faker.helpers.arrayElement(MOCK_MERCHANTS);
  const first = faker.person.firstName();
  const last = faker.person.lastName();
  return {
    id: faker.string.alphanumeric(12),
    name: `${first} ${last}`,
    email: faker.internet.email({ firstName: first, lastName: last }).toLowerCase(),
    phone: `+60 1${faker.number.int({ min: 0, max: 9 })}-${faker.number.int({ min: 1000000, max: 9999999 })}`,
    role,
    merchantId: merchant?.id ?? null,
    merchantName: merchant?.name ?? null,
    avatarUrl: faker.image.avatar(),
    isActive: faker.datatype.boolean({ probability: 0.92 }),
    lastLoginAt: faker.date.recent({ days: 14 }).toISOString(),
  };
});

export const CURRENT_USER: StaycayUser = {
  id: 'cu_current',
  name: 'Rick Chew',
  email: 'rick@staycay.my',
  phone: '+60 12-3456789',
  role: 'SUPER_ADMIN',
  merchantId: null,
  merchantName: null,
  avatarUrl: faker.image.avatar(),
  isActive: true,
  lastLoginAt: new Date().toISOString(),
};

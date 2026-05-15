import { faker } from '@faker-js/faker';
import { MOCK_MERCHANTS } from './merchants';

export type Guest = {
  id: string;
  merchantId: string;
  merchantName: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  idType: 'NRIC' | 'Passport';
  idNumber: string;
  notes: string | null;
  vip: boolean;
  isBlacklisted: boolean;
  blacklistReason: string | null;
  firstBookingAt: string;
  lastBookingAt: string;
  totalBookings: number;
  totalSpent: number;
  avatarUrl: string;
};

faker.seed(1010);

const NATIONALITIES = ['Malaysian', 'Singaporean', 'Indonesian', 'Thai', 'Chinese', 'Australian', 'British', 'American'];

export const MOCK_GUESTS: Guest[] = MOCK_MERCHANTS.flatMap((merchant) =>
  Array.from({ length: faker.number.int({ min: 4, max: 10 }) }, () => {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const totalBookings = faker.number.int({ min: 1, max: 14 });
    const totalSpent = faker.number.int({ min: 200, max: 12000 });
    const lastBookingAt = faker.date.recent({ days: 90 }).toISOString();
    const firstBookingAt = faker.date.past({ years: 2 }).toISOString();
    const nationality = faker.helpers.arrayElement(NATIONALITIES);
    const idType: 'NRIC' | 'Passport' = nationality === 'Malaysian' ? 'NRIC' : 'Passport';
    return {
      id: faker.string.alphanumeric(12),
      merchantId: merchant.id,
      merchantName: merchant.name,
      name: `${first} ${last}`,
      email: faker.internet.email({ firstName: first, lastName: last }).toLowerCase(),
      phone: `+60 1${faker.number.int({ min: 0, max: 9 })}-${faker.number.int({ min: 1000000, max: 9999999 })}`,
      nationality,
      idType,
      idNumber:
        idType === 'NRIC'
          ? `${faker.number.int({ min: 700000, max: 999999 })}-${faker.number.int({ min: 10, max: 14 })}-${faker.number.int({ min: 1000, max: 9999 })}`
          : `${faker.string.alpha({ length: 1, casing: 'upper' })}${faker.number.int({ min: 1000000, max: 9999999 })}`,
      notes: faker.datatype.boolean({ probability: 0.25 }) ? faker.lorem.sentence() : null,
      vip: faker.datatype.boolean({ probability: 0.12 }),
      isBlacklisted: faker.datatype.boolean({ probability: 0.04 }),
      blacklistReason: null as string | null,
      firstBookingAt,
      lastBookingAt,
      totalBookings,
      totalSpent,
      avatarUrl: faker.image.avatar(),
    };
  }),
).map((g) => {
  if (g.isBlacklisted) g.blacklistReason = 'Repeat damage to property';
  return g;
});

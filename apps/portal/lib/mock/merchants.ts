import { faker } from '@faker-js/faker';

export type Merchant = {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  city: string;
  isActive: boolean;
  createdAt: string;
};

faker.seed(101);

const MY_CITIES = ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Ipoh', 'Kota Kinabalu', 'Kuching', 'Melaka', 'Shah Alam'];

export const MOCK_MERCHANTS: Merchant[] = Array.from({ length: 12 }, () => {
  const name = `${faker.company.name()} Stays`;
  return {
    id: faker.string.alphanumeric(12),
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    email: faker.internet.email().toLowerCase(),
    phone: `+60 1${faker.number.int({ min: 0, max: 9 })}-${faker.number.int({ min: 1000000, max: 9999999 })}`,
    city: faker.helpers.arrayElement(MY_CITIES),
    isActive: faker.datatype.boolean({ probability: 0.9 }),
    createdAt: faker.date.past({ years: 2 }).toISOString(),
  };
});

export const CURRENT_MERCHANT: Merchant = MOCK_MERCHANTS[0];

/** Lazy stats computed from the actually-generated mock arrays. */
export function getMerchantStats(merchantId: string) {
  // Inline requires avoid circular import at module-init time.
  const { MOCK_PROPERTIES } = require('./properties') as typeof import('./properties');
  const { MOCK_USERS } = require('./users') as typeof import('./users');
  const { MOCK_LISTINGS } = require('./listings') as typeof import('./listings');
  return {
    propertiesCount: MOCK_PROPERTIES.filter((p) => p.merchantId === merchantId).length,
    listingsCount: MOCK_LISTINGS.filter((l) => l.merchantId === merchantId).length,
    membersCount: MOCK_USERS.filter((u) => u.merchantId === merchantId).length,
  };
}

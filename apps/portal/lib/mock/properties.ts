import { faker } from '@faker-js/faker';
import { MOCK_MERCHANTS } from './merchants';

export type Property = {
  id: string;
  merchantId: string;
  merchantName: string;
  name: string;
  address: string;
  postcode: string;
  city: string;
  state: string;
  checkInTime: string;
  checkOutTime: string;
  imageUrls: string[];
  listingsCount: number;
  isActive: boolean;
  createdAt: string;
};

faker.seed(303);

const MY_STATES = ['Selangor', 'Penang', 'Johor', 'Perak', 'Sabah', 'Sarawak', 'Melaka', 'Kuala Lumpur'];
const PROPERTY_TYPES = ['Residence', 'Suites', 'Loft', 'Villa', 'Apartment', 'Studio', 'Heights', 'Cove'];
const IMG_BASE = 'https://images.unsplash.com/';
const PROPERTY_PHOTOS = [
  'photo-1564013799919-ab600027ffc6?w=800',
  'photo-1568605114967-8130f3a36994?w=800',
  'photo-1570129477492-45c003edd2be?w=800',
  'photo-1502672260266-1c1ef2d93688?w=800',
  'photo-1493809842364-78817add7ffb?w=800',
  'photo-1512917774080-9991f1c4c750?w=800',
  'photo-1480074568708-e7b720bb3f09?w=800',
  'photo-1505691938895-1758d7feb511?w=800',
];

export const MOCK_PROPERTIES: Property[] = Array.from({ length: 18 }, () => {
  const merchant = faker.helpers.arrayElement(MOCK_MERCHANTS);
  const type = faker.helpers.arrayElement(PROPERTY_TYPES);
  return {
    id: faker.string.alphanumeric(12),
    merchantId: merchant.id,
    merchantName: merchant.name,
    name: `${faker.location.city()} ${type}`,
    address: faker.location.streetAddress(),
    postcode: faker.number.int({ min: 10000, max: 99999 }).toString(),
    city: merchant.city,
    state: faker.helpers.arrayElement(MY_STATES),
    checkInTime: '15:00',
    checkOutTime: '12:00',
    imageUrls: faker.helpers
      .arrayElements(PROPERTY_PHOTOS, faker.number.int({ min: 1, max: 4 }))
      .map((p) => `${IMG_BASE}${p}`),
    listingsCount: faker.number.int({ min: 1, max: 5 }),
    isActive: faker.datatype.boolean({ probability: 0.95 }),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  };
});

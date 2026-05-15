import { faker } from '@faker-js/faker';
import { MOCK_BUILDINGS } from './buildings';
import { MOCK_MERCHANTS } from './merchants';

export type Property = {
  id: string;
  merchantId: string;
  merchantName: string;
  buildingId: string | null;
  buildingName: string | null;
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

const stirling = MOCK_BUILDINGS.find((b) => b.id === 'bld_stirling_miri')!;
const klRes = MOCK_BUILDINGS.find((b) => b.id === 'bld_kl_residences')!;
const penang = MOCK_BUILDINGS.find((b) => b.id === 'bld_penang_suites')!;

// Anchor properties: three different merchants in Stirling Suite Miri to
// exercise the multi-owner-building scenario.
const ANCHOR_PROPERTIES: Property[] = [
  {
    id: 'prop_stirling_a',
    merchantId: MOCK_MERCHANTS[0].id,
    merchantName: MOCK_MERCHANTS[0].name,
    buildingId: stirling.id,
    buildingName: stirling.name,
    name: 'Stirling Suite Miri — Level 8 & 9',
    address: stirling.address,
    postcode: stirling.postcode,
    city: stirling.city,
    state: stirling.state,
    checkInTime: '15:00',
    checkOutTime: '12:00',
    imageUrls: [`${IMG_BASE}${PROPERTY_PHOTOS[0]}`, `${IMG_BASE}${PROPERTY_PHOTOS[1]}`],
    listingsCount: 2,
    isActive: true,
    createdAt: '2025-02-12T00:00:00.000Z',
  },
  {
    id: 'prop_stirling_b',
    merchantId: MOCK_MERCHANTS[1].id,
    merchantName: MOCK_MERCHANTS[1].name,
    buildingId: stirling.id,
    buildingName: stirling.name,
    name: 'Stirling Suite Miri — Level 5',
    address: stirling.address,
    postcode: stirling.postcode,
    city: stirling.city,
    state: stirling.state,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    imageUrls: [`${IMG_BASE}${PROPERTY_PHOTOS[2]}`],
    listingsCount: 1,
    isActive: true,
    createdAt: '2025-04-05T00:00:00.000Z',
  },
  {
    id: 'prop_stirling_c',
    merchantId: MOCK_MERCHANTS[2].id,
    merchantName: MOCK_MERCHANTS[2].name,
    buildingId: stirling.id,
    buildingName: stirling.name,
    name: 'Stirling Suite Miri — Level 11 Penthouse',
    address: stirling.address,
    postcode: stirling.postcode,
    city: stirling.city,
    state: stirling.state,
    checkInTime: '16:00',
    checkOutTime: '12:00',
    imageUrls: [`${IMG_BASE}${PROPERTY_PHOTOS[3]}`, `${IMG_BASE}${PROPERTY_PHOTOS[4]}`],
    listingsCount: 1,
    isActive: true,
    createdAt: '2025-07-18T00:00:00.000Z',
  },
  {
    id: 'prop_bbr_a',
    merchantId: MOCK_MERCHANTS[0].id,
    merchantName: MOCK_MERCHANTS[0].name,
    buildingId: klRes.id,
    buildingName: klRes.name,
    name: 'Bukit Bintang Residences — Sky Tower',
    address: klRes.address,
    postcode: klRes.postcode,
    city: klRes.city,
    state: klRes.state,
    checkInTime: '15:00',
    checkOutTime: '12:00',
    imageUrls: [`${IMG_BASE}${PROPERTY_PHOTOS[5]}`, `${IMG_BASE}${PROPERTY_PHOTOS[6]}`],
    listingsCount: 3,
    isActive: true,
    createdAt: '2025-03-01T00:00:00.000Z',
  },
  {
    id: 'prop_gurney_a',
    merchantId: MOCK_MERCHANTS[3].id,
    merchantName: MOCK_MERCHANTS[3].name,
    buildingId: penang.id,
    buildingName: penang.name,
    name: 'Gurney Skyline — North Block',
    address: penang.address,
    postcode: penang.postcode,
    city: penang.city,
    state: penang.state,
    checkInTime: '15:00',
    checkOutTime: '12:00',
    imageUrls: [`${IMG_BASE}${PROPERTY_PHOTOS[7]}`],
    listingsCount: 2,
    isActive: true,
    createdAt: '2025-05-20T00:00:00.000Z',
  },
];

// Standalone (single-owner, no shared building) properties — fill out
// the dataset for richer tables.
const STANDALONE: Property[] = Array.from({ length: 13 }, () => {
  const merchant = faker.helpers.arrayElement(MOCK_MERCHANTS);
  const type = faker.helpers.arrayElement(PROPERTY_TYPES);
  return {
    id: faker.string.alphanumeric(12),
    merchantId: merchant.id,
    merchantName: merchant.name,
    buildingId: null,
    buildingName: null,
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

export const MOCK_PROPERTIES: Property[] = [...ANCHOR_PROPERTIES, ...STANDALONE];

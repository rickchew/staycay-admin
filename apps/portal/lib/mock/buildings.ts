import { faker } from '@faker-js/faker';

export type Building = {
  id: string;
  name: string;
  address: string;
  postcode: string;
  city: string;
  state: string;
  totalFloors: number;
  parkingInfo: string;
  wifiName: string;
  sharedPhotos: string[];
  notes: string | null;
  createdAt: string;
};

faker.seed(909);

const IMG_BASE = 'https://images.unsplash.com/';
const BUILDING_PHOTOS = [
  'photo-1545324418-cc1a3fa10c00?w=800',
  'photo-1486325212027-8081e485255e?w=800',
  'photo-1582407947304-fd86f028f716?w=800',
  'photo-1551038247-3d9af20df552?w=800',
];

export const MOCK_BUILDINGS: Building[] = [
  {
    id: 'bld_stirling_miri',
    name: 'Stirling Suite Miri',
    address: 'Jalan Pujut 7, Miri',
    postcode: '98000',
    city: 'Miri',
    state: 'Sarawak',
    totalFloors: 12,
    parkingInfo: 'Covered basement parking · RM10/night',
    wifiName: 'StirlingGuest',
    sharedPhotos: BUILDING_PHOTOS.slice(0, 3).map((p) => `${IMG_BASE}${p}`),
    notes: 'Three operators share this building. Lift access via card only.',
    createdAt: '2024-08-10T00:00:00.000Z',
  },
  {
    id: 'bld_kl_residences',
    name: 'Bukit Bintang Residences',
    address: 'Jalan Bukit Bintang, Kuala Lumpur',
    postcode: '55100',
    city: 'Kuala Lumpur',
    state: 'Kuala Lumpur',
    totalFloors: 28,
    parkingInfo: 'Multi-storey · RM15/night',
    wifiName: 'BBR-Guest',
    sharedPhotos: [BUILDING_PHOTOS[1], BUILDING_PHOTOS[3]].map((p) => `${IMG_BASE}${p}`),
    notes: null,
    createdAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 'bld_penang_suites',
    name: 'Gurney Skyline Suites',
    address: 'Persiaran Gurney, Penang',
    postcode: '10250',
    city: 'George Town',
    state: 'Penang',
    totalFloors: 18,
    parkingInfo: 'Open-air lot · free',
    wifiName: 'GurneyGuest',
    sharedPhotos: [BUILDING_PHOTOS[2]].map((p) => `${IMG_BASE}${p}`),
    notes: null,
    createdAt: '2025-03-22T00:00:00.000Z',
  },
];

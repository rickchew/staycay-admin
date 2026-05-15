import { faker } from '@faker-js/faker';
import { MOCK_PROPERTIES } from './properties';

export type ListingUnit = {
  id: string;
  listingId: string;
  name: string;
  isActive: boolean;
};

export type Listing = {
  id: string;
  propertyId: string;
  propertyName: string;
  merchantId: string;
  name: string;
  description: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  dailyRate: number;
  quantity: number;
  isSingle: boolean;
  isActive: boolean;
  units: ListingUnit[];
};

faker.seed(404);

const LISTING_NAMES = ['Soho Suite', 'Garden Villa', 'Cozy Studio', 'Family Loft', 'Sky Penthouse', 'Heritage Room', 'Beachfront Cabin', 'City View Suite'];

export const MOCK_LISTINGS: Listing[] = MOCK_PROPERTIES.flatMap((property) =>
  Array.from({ length: property.listingsCount }, () => {
    const quantity = faker.number.int({ min: 1, max: 10 });
    const isSingle = quantity === 1;
    const id = faker.string.alphanumeric(12);
    return {
      id,
      propertyId: property.id,
      propertyName: property.name,
      merchantId: property.merchantId,
      name: faker.helpers.arrayElement(LISTING_NAMES),
      description: faker.lorem.sentences(2),
      maxGuests: faker.number.int({ min: 1, max: 8 }),
      bedrooms: faker.number.int({ min: 1, max: 4 }),
      bathrooms: faker.number.int({ min: 1, max: 3 }),
      dailyRate: faker.number.int({ min: 80, max: 600 }),
      quantity,
      isSingle,
      isActive: faker.datatype.boolean({ probability: 0.95 }),
      units: Array.from({ length: quantity }, (_, i) => ({
        id: faker.string.alphanumeric(12),
        listingId: id,
        name: `Unit ${i + 1}`,
        isActive: true,
      })),
    };
  }),
);

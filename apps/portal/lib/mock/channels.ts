export type ChannelCode =
  | 'DIRECT'
  | 'AGODA'
  | 'BOOKING_COM'
  | 'AIRBNB'
  | 'EXPEDIA'
  | 'OTHER';

export type Channel = {
  code: ChannelCode;
  name: string;
  type: 'DIRECT' | 'OTA';
  commissionDefaultPct: number;
  /** Tailwind class for a coloured dot/badge background */
  color: string;
  /** Short identifier rendered inside a coloured badge when no SVG ships */
  initial: string;
  /** Optional path to a brand SVG under /public/media/brand-logos */
  iconUrl?: string;
};

export const MOCK_CHANNELS: Channel[] = [
  {
    code: 'DIRECT',
    name: 'Direct',
    type: 'DIRECT',
    commissionDefaultPct: 0,
    color: 'bg-emerald-500',
    initial: 'D',
  },
  {
    code: 'AGODA',
    name: 'Agoda',
    type: 'OTA',
    commissionDefaultPct: 15,
    color: 'bg-red-500',
    initial: 'A',
  },
  {
    code: 'BOOKING_COM',
    name: 'Booking.com',
    type: 'OTA',
    commissionDefaultPct: 15,
    color: 'bg-blue-600',
    initial: 'B',
    iconUrl: '/media/brand-logos/bookingcom.svg',
  },
  {
    code: 'AIRBNB',
    name: 'Airbnb',
    type: 'OTA',
    commissionDefaultPct: 14,
    color: 'bg-pink-500',
    initial: 'A',
    iconUrl: '/media/brand-logos/airbnb-2.svg',
  },
  {
    code: 'EXPEDIA',
    name: 'Expedia',
    type: 'OTA',
    commissionDefaultPct: 18,
    color: 'bg-yellow-500',
    initial: 'E',
  },
  {
    code: 'OTHER',
    name: 'Other',
    type: 'OTA',
    commissionDefaultPct: 10,
    color: 'bg-gray-500',
    initial: 'O',
  },
];

export function getChannel(code: ChannelCode): Channel {
  return MOCK_CHANNELS.find((c) => c.code === code) ?? MOCK_CHANNELS[0];
}

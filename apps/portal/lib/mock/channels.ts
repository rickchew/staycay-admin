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
  color: string;
};

export const MOCK_CHANNELS: Channel[] = [
  { code: 'DIRECT', name: 'Direct', type: 'DIRECT', commissionDefaultPct: 0, color: 'bg-emerald-500' },
  { code: 'AGODA', name: 'Agoda', type: 'OTA', commissionDefaultPct: 15, color: 'bg-red-500' },
  { code: 'BOOKING_COM', name: 'Booking.com', type: 'OTA', commissionDefaultPct: 15, color: 'bg-blue-600' },
  { code: 'AIRBNB', name: 'Airbnb', type: 'OTA', commissionDefaultPct: 14, color: 'bg-pink-500' },
  { code: 'EXPEDIA', name: 'Expedia', type: 'OTA', commissionDefaultPct: 18, color: 'bg-yellow-500' },
  { code: 'OTHER', name: 'Other', type: 'OTA', commissionDefaultPct: 10, color: 'bg-gray-500' },
];

export function getChannel(code: ChannelCode): Channel {
  return MOCK_CHANNELS.find((c) => c.code === code) ?? MOCK_CHANNELS[0];
}

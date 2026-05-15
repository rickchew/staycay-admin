export type StaycayRole = 'SUPER_ADMIN' | 'PROPERTY_OWNER' | 'STAFF';

export const STAYCAY_ROLES: { value: StaycayRole; label: string; description: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', description: 'Platform-wide access' },
  { value: 'PROPERTY_OWNER', label: 'Property Owner', description: 'Full business access' },
  { value: 'STAFF', label: 'Staff', description: 'Operational access' },
];

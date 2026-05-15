import type { StaycayRole } from './roles';

/** Routes only Super Admin can reach. */
const SUPER_ADMIN_ONLY_PREFIXES = ['/admin', '/buildings'];

/** Routes available to PROPERTY_OWNER (and SUPER_ADMIN) but not STAFF. */
const OWNER_AND_ADMIN_PREFIXES = ['/settings'];

export function isPathAllowedForRole(path: string, role: StaycayRole): boolean {
  if (role === 'SUPER_ADMIN') return true;
  if (
    SUPER_ADMIN_ONLY_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))
  ) {
    return false;
  }
  if (
    role === 'STAFF' &&
    OWNER_AND_ADMIN_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))
  ) {
    return false;
  }
  return true;
}

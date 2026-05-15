'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isPathAllowedForRole, useStaycayRole } from '@/lib/mock';

/** Redirects to `/` if the current role can't access the path. */
export function RoleRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useStaycayRole();

  useEffect(() => {
    if (!isPathAllowedForRole(pathname, role)) {
      router.replace('/');
    }
  }, [pathname, role, router]);

  if (!isPathAllowedForRole(pathname, role)) return null;
  return <>{children}</>;
}

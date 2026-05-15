'use client';

import { useCallback, useEffect, useState } from 'react';
import { STAYCAY_ROLES, type StaycayRole } from './roles';

const STORAGE_KEY = 'staycay.role';
const DEFAULT_ROLE: StaycayRole = 'SUPER_ADMIN';

type Listener = (role: StaycayRole) => void;
const listeners = new Set<Listener>();

function read(): StaycayRole {
  if (typeof window === 'undefined') return DEFAULT_ROLE;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === 'SUPER_ADMIN' || v === 'PROPERTY_OWNER' || v === 'STAFF') return v;
  return DEFAULT_ROLE;
}

export function useStaycayRole() {
  const [role, setRole] = useState<StaycayRole>(DEFAULT_ROLE);

  useEffect(() => {
    setRole(read());
    const listener: Listener = (r) => setRole(r);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const changeRole = useCallback((next: StaycayRole) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    listeners.forEach((l) => l(next));
  }, []);

  const meta = STAYCAY_ROLES.find((r) => r.value === role)!;

  return { role, changeRole, label: meta.label, description: meta.description };
}

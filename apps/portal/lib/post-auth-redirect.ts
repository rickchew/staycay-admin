import { DEMO_SEGMENT_RE, type DemoId } from '@/lib/demo-id';

function withSearch(path: string, search: string): string {
  if (!search) return path;
  const q = search.startsWith('?') ? search.slice(1) : search;
  return q ? `${path}?${q}` : path;
}

/**
 * Builds the post-sign-in path. Staycay uses unprefixed routes (the multi-demo
 * URL scheme from the Metronic template was dropped), so this just returns the
 * current pathname unchanged — stripping any legacy `/demoN` prefix if present.
 */
export function callbackPathForDemoRoute(
  _demo: DemoId,
  pathname: string,
  search: string,
): string {
  const normalized = pathname && pathname !== '' ? pathname : '/';
  const seg = normalized.match(DEMO_SEGMENT_RE);
  const stripped = seg ? seg[2] || '/' : normalized;
  return withSearch(stripped, search);
}

/** Reject open redirects; only same-origin relative paths. */
export function safeCallbackUrl(
  raw: string | null | undefined,
  fallback = '/',
): string {
  if (raw == null || raw === '') return fallback;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw.trim());
  } catch {
    return fallback;
  }
  if (!decoded.startsWith('/') || decoded.startsWith('//')) {
    return fallback;
  }
  return decoded;
}

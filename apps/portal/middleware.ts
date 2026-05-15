import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEMO_SEGMENT_RE } from '@/lib/demo-id';

/**
 * Staycay uses unprefixed routes. The Metronic template shipped a
 * middleware that wrapped every URL in `/demoN/...` for its multi-demo
 * preview scheme — we don't use that, so this middleware only handles
 * one thing: rewriting any leftover `/demoN/...` request back to its
 * unprefixed equivalent so old bookmarks and post-auth callbacks don't
 * land on 404s.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const demoMatch = pathname.match(DEMO_SEGMENT_RE);
  if (demoMatch) {
    const rest = demoMatch[2] ?? '/';
    const url = request.nextUrl.clone();
    url.pathname = rest === '' ? '/' : rest;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico).*)'],
};

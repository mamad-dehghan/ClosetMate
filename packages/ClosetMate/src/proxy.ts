import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "cm_guest",
];

/**
 * Next 16 proxy (formerly middleware). It only checks that *a* session cookie
 * exists — real validation happens in the app layout with a database lookup.
 * Visitors without any session are routed through guest creation first.
 */
export default function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some(
    (name) => Boolean(request.cookies.get(name)?.value),
  );

  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/api/guest";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/app/:path*"],
};

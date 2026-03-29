import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPrefix = "/app";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith(protectedPrefix)) {
    return NextResponse.next();
  }

  const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "moneymate_session";
  const hasSession = Boolean(request.cookies.get(sessionCookieName)?.value);

  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/app/:path*"]
};


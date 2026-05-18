import {type NextRequest, NextResponse} from "next/server";
import {getSessionCookie} from "better-auth/cookies";

const PROTECTED_PREFIXES = ["/dashboard", "/clients", "/invoices", "/profile", "/settings"];

export function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/auth") && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/invoices/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/auth/:path*",
  ],
};

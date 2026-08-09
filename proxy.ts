import { NextRequest, NextResponse } from "next/server";

const VISITOR_COOKIE_NAME = "visitor_uuid";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0];
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  let response: NextResponse;

  if (pathname.startsWith("/api")) {
    response = NextResponse.next();
  } else if (hostname === "test.da-nya.com") {
    url.pathname = `/corporate${pathname}`;
    response = NextResponse.rewrite(url);
  } else if (hostname === "app.da-nya.com") {
    url.pathname = `/main${pathname}`;
    response = NextResponse.rewrite(url);
  } else if (hostname === "test.pet-taxi-airport.com") {
    url.pathname = `/airport${pathname}`;
    response = NextResponse.rewrite(url);
  } else {
    response = NextResponse.next();
  }

  const visitorUuid = request.cookies.get(VISITOR_COOKIE_NAME)?.value;

  if (!visitorUuid) {
    response.cookies.set({
      name: VISITOR_COOKIE_NAME,
      value: crypto.randomUUID(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: VISITOR_COOKIE_MAX_AGE,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
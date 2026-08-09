import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0];
  const url = request.nextUrl.clone();

  if (hostname === "test.da-nya.com") {
    url.pathname = `/corporate${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (hostname === "app.da-nya.com") {
    url.pathname = `/main${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (hostname === "test.pet-taxi-airport.com") {
    url.pathname = `/airport${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
import type { NextProxy } from "next/server";
import { NextResponse } from "next/server";

import { debugDispatcher } from "@/lib/debug";
import { identityDispatcher } from "@/lib/identity";
import { notifySecurityDispatcher } from "@/lib/notify";

const VISITOR_COOKIE_NAME = "visitor_uuid";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const APPLICATION_HOSTNAMES = new Set([
  "test.da-nya.com",
  "app.da-nya.com",
  "test.pet-taxi-airport.com",
]);

const BLOCKED_PATH_PATTERNS = [
  /^\/@fs(?:\/|$)/i,
  /^\/\.aws(?:\/|$)/i,
  /^\/\.env(?:[./]|$)/i,
  /^\/\.git(?:\/|$)/i,
  /\/\.aws\/credentials(?:\/|$)/i,
];

function getBlockedPathReason(pathname: string) {
  let normalizedPathname: string;

  try {
    normalizedPathname = decodeURIComponent(pathname);
  } catch {
    return "malformed_path_encoding";
  }

  const isBlocked = BLOCKED_PATH_PATTERNS.some((pattern) =>
    pattern.test(normalizedPathname),
  );

  return isBlocked ? "sensitive_file_probe" : undefined;
}

async function createVisitorReference(visitorUuid: string) {
  const encodedUuid = new TextEncoder().encode(visitorUuid);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedUuid);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 12);
}

export const proxy: NextProxy = (request, event) => {
  const hostname = request.headers.get("host")?.split(":")[0];
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();
  const blockedPathReason = getBlockedPathReason(pathname);
  const isApplicationHostname = hostname
    ? APPLICATION_HOSTNAMES.has(hostname)
    : false;

  if (blockedPathReason) {
    event.waitUntil(
      notifySecurityDispatcher({
        event: "suspicious_request_blocked",
        hostname,
        pathname,
        reason: blockedPathReason,
      }),
    );

    return NextResponse.json(
      { error: "Not Found" },
      { status: 404 },
    );
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const isLineInAppBrowser = userAgent.includes("Line/");
  const isLiffEntrance =
    hostname === "app.da-nya.com" &&
    (pathname === "/liff" ||
      pathname.startsWith("/liff/") ||
      isLineInAppBrowser);
  const entrySource = isLiffEntrance ? "liff" : "web";
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-entry-source", entrySource);

  let response: NextResponse;

  if (pathname.startsWith("/api")) {
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } else if (hostname === "test.da-nya.com") {
    url.pathname = `/corporate${pathname}`;
    response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  } else if (isLiffEntrance) {
    const liffPath = pathname.slice("/liff".length);

    url.pathname = `/main${liffPath}`;
    response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  } else if (hostname === "app.da-nya.com") {
    url.pathname = `/main${pathname}`;
    response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  } else if (hostname === "test.pet-taxi-airport.com") {
    url.pathname = `/airport${pathname}`;
    response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  } else {
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const acceptsHtml = request.headers.get("accept")?.includes("text/html");
  const isHtmlPageRequest = request.method === "GET" && acceptsHtml;
  const isLocalDevelopment =
    process.env.NODE_ENV !== "production" &&
    (hostname === "localhost" || hostname === "127.0.0.1");

  if (!isHtmlPageRequest || (!isApplicationHostname && !isLocalDevelopment)) {
    return response;
  }

  const existingVisitorUuid = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
  const visitorUuid = existingVisitorUuid ?? crypto.randomUUID();
  const visitorCookieStatus = existingVisitorUuid ? "existing" : "created";

  if (!existingVisitorUuid) {
    response.cookies.set({
      name: VISITOR_COOKIE_NAME,
      value: visitorUuid,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: VISITOR_COOKIE_MAX_AGE,
    });
  }

  event.waitUntil(
    (async () => {
      let visitorDatabaseStatus = existingVisitorUuid
        ? "not_required"
        : "skipped_local_development";

      if (!existingVisitorUuid && isApplicationHostname) {
        try {
          await identityDispatcher({
            action: "register_visitor",
            visitorUuid,
            entrySource,
          });
          visitorDatabaseStatus = "registered";
        } catch {
          visitorDatabaseStatus = "failed";
          console.error("[IDENTITY] Visitor registration failed.");
        }
      }

      const visitorReference = await createVisitorReference(visitorUuid);

      await debugDispatcher({
        level: visitorDatabaseStatus === "failed" ? "error" : "info",
        event: "visitor_cookie_checked",
        data: {
          visitorCookieStatus,
          visitorReference,
          visitorDatabaseStatus,
          hostname,
          pathname,
          entrySource,
          isLineInAppBrowser,
        },
      });
    })(),
  );

  return response;
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
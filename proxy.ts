import type { NextProxy } from "next/server";
import { NextResponse } from "next/server";

import { identityDispatcher } from "@/lib/identity";
import { notifyDispatcher } from "@/lib/notify";

const VISITOR_COOKIE_NAME = "visitor_uuid";
const VISITOR_DATABASE_SYNC_COOKIE_NAME = "visitor_db_synced";
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

export const proxy: NextProxy = async (request, event) => {
  const hostname = request.headers.get("host")?.split(":")[0];
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();
  const blockedPathReason = getBlockedPathReason(pathname);
  const isApplicationHostname = hostname
    ? APPLICATION_HOSTNAMES.has(hostname)
    : false;

  if (blockedPathReason) {
    event.waitUntil(
      notifyDispatcher({
        level: "warning",
        event: "suspicious_request_blocked",
        data: {
          action: "blocked",
          hostname: hostname ?? "unknown",
          pathname,
          reason: blockedPathReason,
        },
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
  const isPublicAsset =
    pathname.startsWith("/icons/") || pathname.startsWith("/images/");

  requestHeaders.set("x-entry-source", entrySource);

  let response: NextResponse;

  if (pathname.startsWith("/api") || isPublicAsset) {
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
    const liffPath =
      pathname === "/liff" || pathname.startsWith("/liff/")
        ? pathname.slice("/liff".length)
        : pathname;

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
  const isVisitorDatabaseSynced =
    request.cookies.get(VISITOR_DATABASE_SYNC_COOKIE_NAME)?.value === "1";
  const visitorUuid = existingVisitorUuid ?? crypto.randomUUID();
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

  let visitorDatabaseStatus = isLocalDevelopment
    ? "skipped_local_development"
    : isVisitorDatabaseSynced
      ? "already_registered"
      : "pending";

  if (isApplicationHostname && !isVisitorDatabaseSynced) {
    try {
      await identityDispatcher({
        action: "register_visitor",
        visitorUuid,
        entrySource,
      });
      visitorDatabaseStatus = existingVisitorUuid
        ? "synchronized"
        : "registered";

      response.cookies.set({
        name: VISITOR_DATABASE_SYNC_COOKIE_NAME,
        value: "1",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: VISITOR_COOKIE_MAX_AGE,
      });
    } catch {
      visitorDatabaseStatus = "failed";
      console.error("[IDENTITY] Visitor registration failed.");
    }
  }

  const visitorReference = await createVisitorReference(visitorUuid);

  if (
    visitorDatabaseStatus === "registered" ||
    visitorDatabaseStatus === "synchronized"
  ) {
    event.waitUntil(
      notifyDispatcher({
        level: "info",
        event:
          visitorDatabaseStatus === "registered"
            ? "visitor_registered"
            : "visitor_database_synchronized",
        data: {
          visitorReference,
          hostname,
          pathname,
          entrySource,
        },
      }),
    );
  } else if (visitorDatabaseStatus === "failed") {
    event.waitUntil(
      notifyDispatcher({
        level: "error",
        event: "visitor_registration_failed",
        data: {
          hostname,
          pathname,
          entrySource,
        },
      }),
    );
  }

  return response;
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

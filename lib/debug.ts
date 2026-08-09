import "server-only";

type DebugLevel = "info" | "warn" | "error";

type DebugRequest = {
  level?: DebugLevel;
  event: string;
  data?: Record<string, unknown>;
};

const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "email",
  "idtoken",
  "password",
  "token",
]);

function sanitizeData(data?: Record<string, unknown>) {
  if (!data) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      SENSITIVE_KEYS.has(key.toLowerCase()) ? "[REDACTED]" : value,
    ]),
  );
}

export function debugDispatcher({
  level = "info",
  event,
  data,
}: DebugRequest) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const payload = {
    event,
    data: sanitizeData(data),
    timestamp: new Date().toISOString(),
  };

  switch (level) {
    case "info":
      console.info("[DEBUG]", payload);
      return;

    case "warn":
      console.warn("[DEBUG]", payload);
      return;

    case "error":
      console.error("[DEBUG]", payload);
      return;

    default: {
      const exhaustiveCheck: never = level;
      return exhaustiveCheck;
    }
  }
}

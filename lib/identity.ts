import "server-only";

import { createClient } from "@supabase/supabase-js";

import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  type Language,
} from "@/lib/i18n";

type EntrySource = "liff" | "web" | "pwa";

export const SESSION_COOKIE_NAME = "session_token";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type IdentityRequest =
  | {
      action: "register_visitor";
      visitorUuid: string;
      entrySource: EntrySource;
    }
  | {
      action: "resolve_line_user";
      visitorUuid: string;
      idToken: string;
      nonce?: string;
    }
  | {
      action: "resolve_google_user";
      visitorUuid: string;
      accessToken: string;
    }
  | {
      action: "resolve_email_user";
      visitorUuid: string;
      accessToken: string;
    }
  | {
      action: "link_visitor";
      visitorUuid: string;
      userUuid: string;
    }
  | {
      action: "create_session";
      userUuid: string;
    }
  | {
      action: "resolve_session";
      sessionToken: string;
      loginType?: "line" | "google" | "email";
    }
  | {
      action: "resolve_session_user";
      userUuid: string;
    }
  | {
      action: "revoke_session";
      sessionToken: string;
    }
  | {
      action: "update_session_language";
      sessionToken: string;
      language: Language;
    }
  | {
      action: "create_auth_token";
      visitorUuid: string;
      tokenHash: string;
      stateHash: string;
      nonce: string;
      returnTo: string;
      expiresAt: string;
    }
  | {
      action: "resolve_auth_token";
      tokenUuid: string;
      stateHash: string;
    }
  | {
      action: "complete_auth_token";
      tokenUuid: string;
      userUuid: string;
      displayName: string;
      pictureUrl: string | null;
    }
  | {
      action: "consume_auth_token";
      tokenUuid: string;
      tokenHash: string;
    };

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

type LineIdentityResult = {
  userUuid: string;
  displayName: string;
  pictureUrl: string | null;
  status: "existing" | "created";
  role: string;
  tier: string;
  language: Language;
};

type GoogleIdentityResult = LineIdentityResult;
type EmailIdentityResult = LineIdentityResult;

type SessionResult = {
  userUuid: string;
  displayName: string;
  pictureUrl: string | null;
  role: string;
  tier: string;
  language: Language;
  expiresAt: string;
};

function normalizeLanguage(language: unknown): Language {
  return isSupportedLanguage(language) ? language : DEFAULT_LANGUAGE;
}

export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "register_visitor" }>,
): Promise<{ visitorUuid: string }>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "resolve_line_user" }>,
): Promise<LineIdentityResult>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "resolve_google_user" }>,
): Promise<GoogleIdentityResult>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "resolve_email_user" }>,
): Promise<EmailIdentityResult>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "create_session" }>,
): Promise<{ sessionToken: string; expiresAt: string }>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "resolve_session" }>,
): Promise<SessionResult | null>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "resolve_session_user" }>,
): Promise<SessionResult>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "revoke_session" }>,
): Promise<{ revoked: boolean }>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "update_session_language" }>,
): Promise<{ language: Language }>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "create_auth_token" }>,
): Promise<{ tokenUuid: string }>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "resolve_auth_token" }>,
): Promise<{
  visitorUuid: string;
  nonce: string;
  returnTo: string;
} | null>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "complete_auth_token" }>,
): Promise<{ completed: boolean }>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "consume_auth_token" }>,
): Promise<{
  userUuid: string;
  displayName: string | null;
  pictureUrl: string | null;
} | null>;
export function identityDispatcher(request: IdentityRequest): Promise<unknown>;
export async function identityDispatcher(request: IdentityRequest) {
  switch (request.action) {
    case "register_visitor": {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from("visitors").upsert(
        {
          visitor_uuid: request.visitorUuid,
          entry_source: request.entrySource,
        },
        {
          onConflict: "visitor_uuid",
          ignoreDuplicates: true,
        },
      );

      if (error) {
        throw new Error(`Visitor registration failed: ${error.message}`);
      }

      return { visitorUuid: request.visitorUuid };
    }

    case "resolve_line_user":
      return resolveLineUser(request);

    case "resolve_google_user":
      return resolveGoogleUser(request);

    case "resolve_email_user":
      return resolveEmailUser(request);

    case "link_visitor":
      throw new Error("Visitor linking is not implemented.");

    case "create_session":
      return createSession(request.userUuid);

    case "resolve_session":
      return resolveSession(request.sessionToken, request.loginType);

    case "resolve_session_user":
      return resolveSessionUser(request.userUuid);

    case "revoke_session":
      return revokeSession(request.sessionToken);

    case "update_session_language":
      return updateSessionLanguage(request.sessionToken, request.language);

    case "create_auth_token":
      return createAuthToken(request);

    case "resolve_auth_token":
      return resolveAuthToken(request);

    case "complete_auth_token":
      return completeAuthToken(request);

    case "consume_auth_token":
      return consumeAuthToken(request);

    default: {
      const exhaustiveCheck: never = request;
      return exhaustiveCheck;
    }
  }
}

async function createAuthToken(
  request: Extract<IdentityRequest, { action: "create_auth_token" }>,
) {
  const supabase = getSupabaseAdmin();
  const tokenUuid = crypto.randomUUID();
  const { error } = await supabase.from("auth_tokens").insert({
    token_uuid: tokenUuid,
    visitor_uuid: request.visitorUuid,
    token_type: "line_login",
    token_hash: request.tokenHash,
    state_hash: request.stateHash,
    nonce: request.nonce,
    status: "pending",
    metadata: { returnTo: request.returnTo },
    expires_at: request.expiresAt,
  });

  if (error) {
    throw new Error(`Authentication token creation failed: ${error.message}`);
  }

  return { tokenUuid };
}

async function resolveAuthToken(
  request: Extract<IdentityRequest, { action: "resolve_auth_token" }>,
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("auth_tokens")
    .select("visitor_uuid, nonce, metadata")
    .eq("token_uuid", request.tokenUuid)
    .eq("token_type", "line_login")
    .eq("state_hash", request.stateHash)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    throw new Error(`Authentication token lookup failed: ${error.message}`);
  }

  if (!data) return null;

  const metadata = data.metadata as { returnTo?: unknown } | null;
  return {
    visitorUuid: data.visitor_uuid as string,
    nonce: data.nonce as string,
    returnTo:
      typeof metadata?.returnTo === "string" ? metadata.returnTo : "/",
  };
}

async function completeAuthToken(
  request: Extract<IdentityRequest, { action: "complete_auth_token" }>,
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("auth_tokens")
    .update({
      user_uuid: request.userUuid,
      status: "completed",
      completed_at: new Date().toISOString(),
      metadata: {
        displayName: request.displayName,
        pictureUrl: request.pictureUrl,
      },
    })
    .eq("token_uuid", request.tokenUuid)
    .eq("token_type", "line_login")
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .select("token_uuid")
    .maybeSingle();

  if (error) {
    throw new Error(`Authentication token completion failed: ${error.message}`);
  }

  return { completed: Boolean(data) };
}

async function consumeAuthToken(
  request: Extract<IdentityRequest, { action: "consume_auth_token" }>,
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("auth_tokens")
    .update({
      status: "consumed",
      consumed_at: new Date().toISOString(),
    })
    .eq("token_uuid", request.tokenUuid)
    .eq("token_type", "line_login")
    .eq("token_hash", request.tokenHash)
    .eq("status", "completed")
    .gt("expires_at", new Date().toISOString())
    .select("user_uuid, metadata")
    .maybeSingle();

  if (error) {
    throw new Error(`Authentication token consumption failed: ${error.message}`);
  }

  if (!data?.user_uuid) return null;

  const metadata = data.metadata as {
    displayName?: unknown;
    pictureUrl?: unknown;
  } | null;

  return {
    userUuid: data.user_uuid as string,
    displayName:
      typeof metadata?.displayName === "string" ? metadata.displayName : null,
    pictureUrl:
      typeof metadata?.pictureUrl === "string" ? metadata.pictureUrl : null,
  };
}

async function resolveGoogleUser(
  request: Extract<IdentityRequest, { action: "resolve_google_user" }>,
) {
  const supabase = getSupabaseAdmin();
  const { data, error: authError } = await supabase.auth.getUser(
    request.accessToken,
  );

  if (authError || !data.user) {
    throw new Error("Google access token verification failed.");
  }

  const authUser = data.user;

  if (authUser.app_metadata.provider !== "google") {
    throw new Error("Authenticated provider is not Google.");
  }
  const externalUserId = authUser.id;
  const email = authUser.email ?? null;
  const displayName =
    typeof authUser.user_metadata.full_name === "string"
      ? authUser.user_metadata.full_name
      : typeof authUser.user_metadata.name === "string"
        ? authUser.user_metadata.name
        : "Google User";
  const pictureUrl =
    typeof authUser.user_metadata.avatar_url === "string"
      ? authUser.user_metadata.avatar_url
      : typeof authUser.user_metadata.picture === "string"
        ? authUser.user_metadata.picture
        : null;
  const { data: existingAccount, error: accountSearchError } = await supabase
    .from("accounts")
    .select("user_uuid")
    .eq("login_type", "google")
    .eq("external_user_id", externalUserId)
    .maybeSingle();

  if (accountSearchError) {
    throw new Error(`Google account lookup failed: ${accountSearchError.message}`);
  }

  let userUuid = existingAccount?.user_uuid as string | undefined;
  let status: "existing" | "created" = "existing";

  if (!userUuid) {
    userUuid = crypto.randomUUID();
    const { error: userError } = await supabase.from("users").insert({
      user_uuid: userUuid,
      display_name: displayName,
    });

    if (userError) {
      throw new Error(`Google user creation failed: ${userError.message}`);
    }

    const { error: accountError } = await supabase.from("accounts").insert({
      account_uuid: crypto.randomUUID(),
      user_uuid: userUuid,
      login_type: "google",
      external_user_id: externalUserId,
      email,
    });

    if (accountError) {
      throw new Error(`Google account creation failed: ${accountError.message}`);
    }

    status = "created";
  }

  if (displayName || pictureUrl) {
    const { error: pictureError } = await supabase
      .from("accounts")
      .update({
        provider_display_name: displayName,
        picture_url: pictureUrl,
      })
      .eq("login_type", "google")
      .eq("external_user_id", externalUserId);

    if (
      pictureError &&
      pictureError.code !== "42703" &&
      pictureError.code !== "PGRST204"
    ) {
      throw new Error(`Google profile update failed: ${pictureError.message}`);
    }
  }

  const { error: visitorError } = await supabase
    .from("visitors")
    .update({ user_uuid: userUuid })
    .eq("visitor_uuid", request.visitorUuid);

  if (visitorError) {
    throw new Error(`Visitor linking failed: ${visitorError.message}`);
  }

  const { data: user, error: userLookupError } = await supabase
    .from("users")
    .select("display_name, role, tier, language")
    .eq("user_uuid", userUuid)
    .single();

  if (userLookupError) {
    throw new Error(`Google user lookup failed: ${userLookupError.message}`);
  }

  return {
    userUuid,
    displayName: user.display_name ?? displayName,
    pictureUrl,
    status,
    role: user.role,
    tier: user.tier,
    language: normalizeLanguage(user.language),
  };
}

async function resolveEmailUser(
  request: Extract<IdentityRequest, { action: "resolve_email_user" }>,
) {
  const supabase = getSupabaseAdmin();
  const { data, error: authError } = await supabase.auth.getUser(
    request.accessToken,
  );

  if (authError || !data.user) {
    throw new Error("Email access token verification failed.");
  }

  const authUser = data.user;

  if (!authUser.email || !authUser.email_confirmed_at) {
    throw new Error("Email address is not verified.");
  }

  const externalUserId = authUser.id;
  const email = authUser.email;
  const displayName = email.split("@")[0] || "Email User";
  const { data: existingAccount, error: accountSearchError } = await supabase
    .from("accounts")
    .select("user_uuid")
    .eq("login_type", "email")
    .eq("external_user_id", externalUserId)
    .maybeSingle();

  if (accountSearchError) {
    throw new Error(`Email account lookup failed: ${accountSearchError.message}`);
  }

  let userUuid = existingAccount?.user_uuid as string | undefined;
  let status: "existing" | "created" = "existing";

  if (!userUuid) {
    userUuid = crypto.randomUUID();
    const { error: userError } = await supabase.from("users").insert({
      user_uuid: userUuid,
      display_name: displayName,
    });

    if (userError) {
      throw new Error(`Email user creation failed: ${userError.message}`);
    }

    const { error: accountError } = await supabase.from("accounts").insert({
      account_uuid: crypto.randomUUID(),
      user_uuid: userUuid,
      login_type: "email",
      external_user_id: externalUserId,
      email,
    });

    if (accountError) {
      throw new Error(`Email account creation failed: ${accountError.message}`);
    }

    status = "created";
  }

  const { error: visitorError } = await supabase
    .from("visitors")
    .update({ user_uuid: userUuid })
    .eq("visitor_uuid", request.visitorUuid);

  if (visitorError) {
    throw new Error(`Visitor linking failed: ${visitorError.message}`);
  }

  const { data: user, error: userLookupError } = await supabase
    .from("users")
    .select("display_name, role, tier, language")
    .eq("user_uuid", userUuid)
    .single();

  if (userLookupError) {
    throw new Error(`Email user lookup failed: ${userLookupError.message}`);
  }

  return {
    userUuid,
    displayName: user.display_name ?? displayName,
    pictureUrl: null,
    status,
    role: user.role,
    tier: user.tier,
    language: normalizeLanguage(user.language),
  };
}

type LineTokenPayload = {
  sub?: string;
  aud?: string;
  name?: string;
  picture?: string;
  email?: string;
};

async function resolveLineUser(
  request: Extract<IdentityRequest, { action: "resolve_line_user" }>,
) {
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;

  if (!channelId) {
    throw new Error("LINE Login channel ID is missing.");
  }

  const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      id_token: request.idToken,
      client_id: channelId,
      ...(request.nonce ? { nonce: request.nonce } : {}),
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    throw new Error("LINE ID token verification failed.");
  }

  const profile = (await tokenResponse.json()) as LineTokenPayload;

  if (!profile.sub || profile.aud !== channelId) {
    throw new Error("LINE ID token payload is invalid.");
  }

  const supabase = getSupabaseAdmin();
  const { data: existingAccount, error: accountSearchError } = await supabase
    .from("accounts")
    .select("user_uuid")
    .eq("login_type", "line")
    .eq("external_user_id", profile.sub)
    .maybeSingle();

  if (accountSearchError) {
    throw new Error(`LINE account lookup failed: ${accountSearchError.message}`);
  }

  let userUuid = existingAccount?.user_uuid as string | undefined;
  let status: "existing" | "created" = "existing";

  if (!userUuid) {
    userUuid = crypto.randomUUID();

    const { error: userError } = await supabase.from("users").insert({
      user_uuid: userUuid,
      display_name: profile.name ?? "LINE User",
    });

    if (userError) {
      throw new Error(`LINE user creation failed: ${userError.message}`);
    }

    const { error: accountError } = await supabase.from("accounts").insert({
      account_uuid: crypto.randomUUID(),
      user_uuid: userUuid,
      login_type: "line",
      external_user_id: profile.sub,
      email: profile.email ?? null,
    });

    if (accountError) {
      throw new Error(`LINE account creation failed: ${accountError.message}`);
    }

    status = "created";
  }

  if (profile.name || profile.picture) {
    const profileUpdate: {
      provider_display_name?: string;
      picture_url?: string;
    } = {};
    if (profile.name) profileUpdate.provider_display_name = profile.name;
    if (profile.picture) profileUpdate.picture_url = profile.picture;

    const { error: pictureError } = await supabase
      .from("accounts")
      .update(profileUpdate)
      .eq("login_type", "line")
      .eq("external_user_id", profile.sub);

    if (
      pictureError &&
      pictureError.code !== "42703" &&
      pictureError.code !== "PGRST204"
    ) {
      throw new Error(`LINE profile update failed: ${pictureError.message}`);
    }
  }

  const { error: visitorError } = await supabase
    .from("visitors")
    .update({ user_uuid: userUuid })
    .eq("visitor_uuid", request.visitorUuid);

  if (visitorError) {
    throw new Error(`Visitor linking failed: ${visitorError.message}`);
  }

  const { data: user, error: userLookupError } = await supabase
    .from("users")
    .select("display_name, role, tier, language")
    .eq("user_uuid", userUuid)
    .single();

  if (userLookupError) {
    throw new Error(`User role lookup failed: ${userLookupError.message}`);
  }

  return {
    userUuid,
    displayName: user.display_name ?? profile.name ?? "LINE User",
    pictureUrl: profile.picture ?? null,
    status,
    role: user.role,
    tier: user.tier,
    language: normalizeLanguage(user.language),
  };
}

async function hashSessionToken(sessionToken: string) {
  const data = new TextEncoder().encode(sessionToken);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function createSession(userUuid: string) {
  const supabase = getSupabaseAdmin();
  const sessionToken = `${crypto.randomUUID()}${crypto.randomUUID()}`;
  const sessionTokenHash = await hashSessionToken(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1_000).toISOString();
  const { error } = await supabase.from("sessions").insert({
    session_uuid: crypto.randomUUID(),
    user_uuid: userUuid,
    session_token_hash: sessionTokenHash,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(`Session creation failed: ${error.message}`);
  }

  return { sessionToken, expiresAt };
}

async function resolveSession(
  sessionToken: string,
  loginType?: "line" | "google" | "email",
) {
  const supabase = getSupabaseAdmin();
  const sessionTokenHash = await hashSessionToken(sessionToken);
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("user_uuid")
    .eq("session_token_hash", sessionTokenHash)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError) {
    throw new Error(`Session lookup failed: ${sessionError.message}`);
  }

  if (!session) {
    return null;
  }

  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1_000).toISOString();
  const { error: renewalError } = await supabase
    .from("sessions")
    .update({ expires_at: expiresAt })
    .eq("session_token_hash", sessionTokenHash)
    .is("revoked_at", null);

  if (renewalError) {
    throw new Error(`Session renewal failed: ${renewalError.message}`);
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("user_uuid, display_name, role, tier, language")
    .eq("user_uuid", session.user_uuid)
    .maybeSingle();

  if (userError) {
    throw new Error(`Session user lookup failed: ${userError.message}`);
  }

  const { data: accountProfile } = loginType
    ? await supabase
        .from("accounts")
        .select("picture_url")
        .eq("user_uuid", session.user_uuid)
        .eq("login_type", loginType)
        .maybeSingle()
    : { data: null };

  return user
    ? {
        userUuid: user.user_uuid,
        displayName: user.display_name,
        pictureUrl:
          typeof accountProfile?.picture_url === "string"
            ? accountProfile.picture_url
            : null,
        role: user.role,
        tier: user.tier,
        language: normalizeLanguage(user.language),
        expiresAt,
      }
    : null;
}

async function resolveSessionUser(userUuid: string) {
  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from("users")
    .select("user_uuid, display_name, role, tier, language")
    .eq("user_uuid", userUuid)
    .single();

  if (error) {
    throw new Error(`Session user lookup failed: ${error.message}`);
  }

  return {
    userUuid: user.user_uuid,
    displayName: user.display_name,
    pictureUrl: null,
    role: user.role,
    tier: user.tier,
    language: normalizeLanguage(user.language),
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1_000).toISOString(),
  };
}

async function revokeSession(sessionToken: string) {
  const supabase = getSupabaseAdmin();
  const sessionTokenHash = await hashSessionToken(sessionToken);
  const { error } = await supabase
    .from("sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("session_token_hash", sessionTokenHash)
    .is("revoked_at", null);

  if (error) {
    throw new Error(`Session revocation failed: ${error.message}`);
  }

  return { revoked: true };
}

async function updateSessionLanguage(
  sessionToken: string,
  language: Language,
) {
  const supabase = getSupabaseAdmin();
  const sessionTokenHash = await hashSessionToken(sessionToken);
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("user_uuid")
    .eq("session_token_hash", sessionTokenHash)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError) {
    throw new Error(`Session lookup failed: ${sessionError.message}`);
  }

  if (!session) {
    throw new Error("Active session was not found.");
  }

  const { error: userError } = await supabase
    .from("users")
    .update({ language })
    .eq("user_uuid", session.user_uuid);

  if (userError) {
    throw new Error(`Language update failed: ${userError.message}`);
  }

  return { language };
}

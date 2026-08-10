import "server-only";

import { createClient } from "@supabase/supabase-js";

type EntrySource = "liff" | "web" | "pwa";

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
    }
  | {
      action: "resolve_google_user";
      visitorUuid: string;
      idToken: string;
    }
  | {
      action: "resolve_email_user";
      visitorUuid: string;
      email: string;
    }
  | {
      action: "link_visitor";
      visitorUuid: string;
      userUuid: string;
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
};

export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "register_visitor" }>,
): Promise<{ visitorUuid: string }>;
export function identityDispatcher(
  request: Extract<IdentityRequest, { action: "resolve_line_user" }>,
): Promise<LineIdentityResult>;
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
      throw new Error("Google identity resolution is not implemented.");

    case "resolve_email_user":
      throw new Error("Email identity resolution is not implemented.");

    case "link_visitor":
      throw new Error("Visitor linking is not implemented.");

    default: {
      const exhaustiveCheck: never = request;
      return exhaustiveCheck;
    }
  }
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

  const { error: visitorError } = await supabase
    .from("visitors")
    .update({ user_uuid: userUuid })
    .eq("visitor_uuid", request.visitorUuid);

  if (visitorError) {
    throw new Error(`Visitor linking failed: ${visitorError.message}`);
  }

  return {
    userUuid,
    displayName: profile.name ?? "LINE User",
    pictureUrl: profile.picture ?? null,
    status,
  };
}

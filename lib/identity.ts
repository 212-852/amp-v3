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
      throw new Error("LINE identity resolution is not implemented.");

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
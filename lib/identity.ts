import "server-only";

export type IdentityRequest =
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

export async function identityDispatcher(request: IdentityRequest) {
  switch (request.action) {
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
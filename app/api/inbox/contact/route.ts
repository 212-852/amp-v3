import { createContactMessage } from "@/lib/inbox";
import { notifyDispatcher } from "@/lib/notify";

export async function POST(request: Request) {
  const form = await request.formData();
  const language = form.get("lang") === "en" ? "en" : "ja";
  const returnUrl = new URL("/flight/contact", request.url);
  returnUrl.searchParams.set("lang", language);
  returnUrl.searchParams.set("form", "inquiry");
  returnUrl.searchParams.set("direction", form.get("direction") === "inbound" ? "inbound" : "outbound");

  if (String(form.get("company") ?? "").trim()) {
    returnUrl.searchParams.set("sent", "1");
    return Response.redirect(returnUrl, 303);
  }

  try {
    await createContactMessage({
      mailboxAddress: "info@paws-flight.com",
      senderName: String(form.get("name") ?? ""),
      senderAddress: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
      language,
    });
    returnUrl.searchParams.set("sent", "1");
  } catch (error) {
    await notifyDispatcher({ level: "error", event: "flight_contact_failed", data: { reason: error instanceof Error ? error.message : "unknown" } });
    returnUrl.searchParams.set("error", "1");
  }
  return Response.redirect(returnUrl, 303);
}

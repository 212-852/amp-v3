import "server-only";

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

import { createNotification } from "@/lib/notification";
import { notifyDispatcher } from "@/lib/notify";

export type InboxItem = {
  threadUuid: string;
  channel: "email" | "line" | "chat" | "group";
  subject: string;
  senderName: string;
  senderAddress: string;
  preview: string;
  readAt: string | null;
  lastMessageAt: string;
};

export type InboxThread = InboxItem & {
  mailboxAddress: string;
  messages: Array<{
    messageUuid: string;
    direction: "inbound" | "outbound";
    senderAddress: string;
    recipientAddresses: string[];
    subject: string;
    bodyText: string;
    bodyHtml: string | null;
    createdAt: string;
  }>;
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase server configuration is missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function cleanText(value: string, maximum: number) {
  return value.replaceAll("\0", "").trim().slice(0, maximum);
}

function getResend() {
  const apiKey = process.env.AMP_MAIL_RESEND_API_KEY
    ?? process.env.MAIL_RESEND_API_KEY
    ?? process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Resend server configuration is missing.");
  return new Resend(apiKey);
}

function isEmailAddress(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

async function getMailboxRecipients(address: string) {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(address);
  const { data: mailbox, error: mailboxError } = await supabase
    .from("inbox_mailboxes")
    .select("mailbox_uuid, mailbox_type, owner_user_uuid")
    .eq("address", normalized)
    .single();
  if (mailboxError || !mailbox) throw new Error("Inbox mailbox is not configured.");

  if (mailbox.mailbox_type === "personal" && mailbox.owner_user_uuid) {
    return { mailboxUuid: String(mailbox.mailbox_uuid), userUuids: [String(mailbox.owner_user_uuid)] };
  }

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("user_uuid")
    .eq("role", "admin")
    .in("tier", ["owner", "core"]);
  if (usersError) throw new Error("Inbox recipients could not be resolved.");
  return { mailboxUuid: String(mailbox.mailbox_uuid), userUuids: (users ?? []).map((user) => String(user.user_uuid)) };
}

export async function createContactMessage(input: {
  mailboxAddress: string;
  senderName: string;
  senderAddress: string;
  message: string;
  language: "ja" | "en";
}) {
  const senderName = cleanText(input.senderName, 120);
  const senderAddress = normalizeEmail(input.senderAddress);
  const message = cleanText(input.message, 10_000);
  if (!senderName || !message || !/^\S+@\S+\.\S+$/.test(senderAddress)) throw new Error("Contact message is invalid.");

  const mailboxAddress = normalizeEmail(input.mailboxAddress);
  const { mailboxUuid, userUuids } = await getMailboxRecipients(mailboxAddress);
  if (userUuids.length === 0) throw new Error("Inbox recipients are not configured.");
  const subject = input.language === "en" ? `PawsFlight inquiry from ${senderName}` : `PawsFlight お問い合わせ：${senderName}`;
  const preview = message.replace(/\s+/g, " ").slice(0, 160);
  const supabase = getSupabaseAdmin();
  const { data: thread, error: threadError } = await supabase
    .from("inbox_threads")
    .insert({ mailbox_uuid: mailboxUuid, channel: "email", subject, sender_name: senderName, sender_address: senderAddress, preview })
    .select("thread_uuid, created_at")
    .single();
  if (threadError || !thread) throw new Error("Contact thread could not be created.");

  const threadUuid = String(thread.thread_uuid);
  const { error: messageError } = await supabase.from("inbox_messages").insert({
    thread_uuid: threadUuid,
    direction: "inbound",
    sender_address: senderAddress,
    recipient_addresses: [mailboxAddress],
    subject,
    body_text: message,
  });
  if (messageError) throw new Error("Contact message could not be created.");

  const { error: recipientError } = await supabase.from("inbox_recipients").insert(
    userUuids.map((userUuid) => ({ thread_uuid: threadUuid, user_uuid: userUuid })),
  );
  if (recipientError) throw new Error("Contact recipients could not be created.");

  const results = await Promise.allSettled(userUuids.map((userUuid) => createNotification({
    userUuid,
    kind: "message",
    title: { ja: "新しいお問い合わせ", en: "New inquiry" },
    body: { ja: `${senderName}さんからお問い合わせが届きました。`, en: `A new inquiry arrived from ${senderName}.` },
    data: { threadUuid, channel: "email", mailboxAddress },
    actionUrl: `/admin/inbox/${threadUuid}`,
  })));
  if (results.some((result) => result.status === "rejected")) {
    await notifyDispatcher({ level: "error", event: "inbox_notification_failed", data: { threadUuid } });
  }
  return { threadUuid };
}

export async function sendInboxEmail(input: {
  senderUserUuid: string;
  mailboxAddress: string;
  recipientAddress: string;
  subject: string;
  message: string;
}) {
  const mailboxAddress = normalizeEmail(input.mailboxAddress);
  const recipientAddress = normalizeEmail(input.recipientAddress);
  const subject = cleanText(input.subject, 240);
  const message = cleanText(input.message, 50_000);
  if (!isEmailAddress(recipientAddress) || !subject || !message) {
    throw new Error("Outgoing email is invalid.");
  }
  if (mailboxAddress !== "info@paws-flight.com") {
    throw new Error("Outgoing mailbox is not available.");
  }

  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: `PawsFlight Japan <${mailboxAddress}>`,
    to: [recipientAddress],
    subject,
    text: message,
  });
  if (error || !data?.id) {
    await notifyDispatcher({
      level: "error",
      event: "inbox_email_send_failed",
      data: { mailboxAddress, code: error?.name ?? "RESEND_SEND_FAILED" },
    });
    throw new Error(error?.message ?? "Email could not be sent.");
  }

  const { mailboxUuid } = await getMailboxRecipients(mailboxAddress);
  const supabase = getSupabaseAdmin();
  const preview = message.replace(/\s+/g, " ").slice(0, 160);
  const { data: thread, error: threadError } = await supabase
    .from("inbox_threads")
    .insert({
      mailbox_uuid: mailboxUuid,
      channel: "email",
      subject,
      sender_name: recipientAddress,
      sender_address: recipientAddress,
      preview,
    })
    .select("thread_uuid")
    .single();
  if (threadError || !thread) throw new Error("Sent email thread could not be saved.");

  const threadUuid = String(thread.thread_uuid);
  const { error: messageError } = await supabase.from("inbox_messages").insert({
    thread_uuid: threadUuid,
    direction: "outbound",
    sender_address: mailboxAddress,
    recipient_addresses: [recipientAddress],
    subject,
    body_text: message,
    external_id: data.id,
  });
  if (messageError) throw new Error("Sent email could not be saved.");

  const { error: recipientError } = await supabase.from("inbox_recipients").insert({
    thread_uuid: threadUuid,
    user_uuid: input.senderUserUuid,
    read_at: new Date().toISOString(),
  });
  if (recipientError) throw new Error("Sent email recipient could not be saved.");
  return { threadUuid, emailId: data.id };
}

export async function listInbox(userUuid: string, query = "", sort: "newest" | "oldest" = "newest") {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("inbox_recipients")
    .select("read_at, thread:inbox_threads!inner(thread_uuid, channel, subject, sender_name, sender_address, preview, last_message_at)")
    .eq("user_uuid", userUuid)
    .limit(200);
  if (error) throw new Error("Inbox could not be loaded.");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const items = (data ?? []).flatMap((row) => {
    const thread = Array.isArray(row.thread) ? row.thread[0] : row.thread;
    if (!thread) return [];
    const item: InboxItem = {
      threadUuid: String(thread.thread_uuid), channel: thread.channel, subject: thread.subject,
      senderName: thread.sender_name, senderAddress: thread.sender_address, preview: thread.preview,
      readAt: row.read_at, lastMessageAt: thread.last_message_at,
    };
    const searchable = `${item.senderName} ${item.senderAddress} ${item.subject} ${item.preview}`.toLocaleLowerCase();
    return !normalizedQuery || searchable.includes(normalizedQuery) ? [item] : [];
  });
  return items.sort((a, b) => (sort === "oldest" ? 1 : -1) * a.lastMessageAt.localeCompare(b.lastMessageAt));
}

export async function getInboxThread(userUuid: string, threadUuid: string): Promise<InboxThread | null> {
  const supabase = getSupabaseAdmin();
  const { data: recipient } = await supabase.from("inbox_recipients").select("read_at").eq("user_uuid", userUuid).eq("thread_uuid", threadUuid).maybeSingle();
  if (!recipient) return null;
  const { data: thread, error } = await supabase
    .from("inbox_threads")
    .select("thread_uuid, channel, subject, sender_name, sender_address, preview, last_message_at, mailbox:inbox_mailboxes!inner(address), messages:inbox_messages(message_uuid, direction, sender_address, recipient_addresses, subject, body_text, body_html, created_at)")
    .eq("thread_uuid", threadUuid)
    .single();
  if (error || !thread) return null;
  if (!recipient.read_at) await supabase.from("inbox_recipients").update({ read_at: new Date().toISOString() }).eq("user_uuid", userUuid).eq("thread_uuid", threadUuid);
  const mailbox = Array.isArray(thread.mailbox) ? thread.mailbox[0] : thread.mailbox;
  return {
    threadUuid: String(thread.thread_uuid), channel: thread.channel, subject: thread.subject,
    senderName: thread.sender_name, senderAddress: thread.sender_address, preview: thread.preview,
    readAt: recipient.read_at ?? new Date().toISOString(), lastMessageAt: thread.last_message_at,
    mailboxAddress: mailbox?.address ?? "",
    messages: (thread.messages ?? []).map((message) => ({
      messageUuid: String(message.message_uuid), direction: message.direction,
      senderAddress: message.sender_address, recipientAddresses: message.recipient_addresses ?? [],
      subject: message.subject, bodyText: message.body_text, bodyHtml: message.body_html,
      createdAt: message.created_at,
    })).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

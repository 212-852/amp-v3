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
  mailboxAddress: string;
  latestDirection: "inbound" | "outbound";
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
    attachments: Array<{
      attachmentUuid: string;
      filename: string;
      contentType: string;
      sizeBytes: number;
    }>;
    createdAt: string;
  }>;
};

export type InboxAttachmentInput = {
  id: string;
  filename?: string;
  size: number;
  contentType: string;
  contentDisposition: "inline" | "attachment";
  contentId?: string;
  downloadUrl: string;
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

function parseSender(value: string) {
  const match = value.trim().match(/^(.*?)\s*<([^<>]+)>$/);
  const address = normalizeEmail(match?.[2] ?? value);
  const name = cleanText((match?.[1] ?? address).replace(/^['"]|['"]$/g, ""), 120);
  return { name, address };
}

function normalizeSubject(value: string) {
  return value.trim().replace(/^(?:(?:re|fw|fwd)\s*:\s*)+/i, "").toLocaleLowerCase();
}

function safeStorageName(value: string) {
  return value.normalize("NFKC").replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^\.+/, "").slice(0, 160) || "attachment";
}

export async function listSendMailboxes(userUuid: string, tier: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("inbox_mailboxes")
    .select("address, mailbox_type, owner_user_uuid")
    .order("address");
  if (error) throw new Error("Outgoing mailboxes could not be loaded.");
  return (data ?? [])
    .filter((mailbox) => mailbox.mailbox_type === "personal"
      ? mailbox.owner_user_uuid === userUuid
      : ["owner", "core"].includes(tier))
    .map((mailbox) => String(mailbox.address));
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

export async function receiveInboxEmail(input: {
  externalId: string;
  messageId: string;
  sender: string;
  recipients: string[];
  headers: Record<string, string>;
  subject: string;
  text: string | null;
  html: string | null;
  receivedAt: string;
}) {
  const supabase = getSupabaseAdmin();
  const externalId = cleanText(input.externalId, 240);
  const { data: duplicate } = await supabase
    .from("inbox_messages")
    .select("message_uuid")
    .eq("external_id", externalId)
    .maybeSingle();
  if (duplicate) return { ignored: false, duplicate: true, messageUuid: String(duplicate.message_uuid) } as const;

  const headerRecipients = ["to", "x-original-to", "x-forwarded-to", "delivered-to"]
    .flatMap((name) => {
      const value = Object.entries(input.headers).find(([key]) => key.toLowerCase() === name)?.[1] ?? "";
      return value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
    });
  const recipients = [...new Set([...input.recipients, ...headerRecipients].map(normalizeEmail).filter(isEmailAddress))];
  const { data: mailboxes, error: mailboxError } = await supabase
    .from("inbox_mailboxes")
    .select("mailbox_uuid, address")
    .in("address", recipients);
  if (mailboxError) throw new Error("Inbound mailboxes could not be loaded.");
  if (!mailboxes?.length) return { ignored: true, duplicate: false } as const;

  const mailbox = mailboxes[0];
  const mailboxAddress = String(mailbox.address);
  const { userUuids } = await getMailboxRecipients(mailboxAddress);
  const sender = parseSender(input.sender);
  if (!isEmailAddress(sender.address)) throw new Error("Inbound sender address is invalid.");
  const subject = cleanText(input.subject || "(No subject)", 240);
  const bodyHtml = input.html?.trim().slice(0, 250_000) || null;
  const bodyText = cleanText(input.text || bodyHtml?.replace(/<[^>]+>/g, " ") || "", 50_000);
  const preview = bodyText.replace(/\s+/g, " ").slice(0, 160);

  const { data: existingThread } = await supabase
    .from("inbox_threads")
    .select("thread_uuid, subject")
    .eq("mailbox_uuid", mailbox.mailbox_uuid)
    .eq("channel", "email")
    .eq("sender_address", sender.address)
    .eq("status", "open")
    .order("last_message_at", { ascending: false })
    .limit(50);
  const matchingThread = existingThread?.find((thread) => normalizeSubject(String(thread.subject)) === normalizeSubject(subject));
  let threadUuid = matchingThread?.thread_uuid ? String(matchingThread.thread_uuid) : "";
  let createdThread = false;
  if (!threadUuid) {
    const { data: thread, error: threadError } = await supabase.from("inbox_threads").insert({
      mailbox_uuid: mailbox.mailbox_uuid,
      channel: "email",
      subject,
      sender_name: sender.name,
      sender_address: sender.address,
      preview,
      last_message_at: input.receivedAt,
    })
    .select("thread_uuid")
    .single();
    if (threadError || !thread) throw new Error("Inbound email thread could not be created.");
    threadUuid = String(thread.thread_uuid);
    createdThread = true;
  } else {
    const { error: updateError } = await supabase.from("inbox_threads").update({ subject, preview, last_message_at: input.receivedAt }).eq("thread_uuid", threadUuid);
    if (updateError) throw new Error("Inbound email thread could not be updated.");
  }
  const { data: message, error: messageError } = await supabase.from("inbox_messages").insert({
    thread_uuid: threadUuid,
    direction: "inbound",
    sender_address: sender.address,
    recipient_addresses: recipients,
    subject,
    body_text: bodyText,
    body_html: bodyHtml,
    external_id: externalId,
    created_at: input.receivedAt,
  }).select("message_uuid").single();
  if (messageError) {
    if (createdThread) await supabase.from("inbox_threads").delete().eq("thread_uuid", threadUuid);
    if (messageError.code === "23505") {
      const { data: stored } = await supabase.from("inbox_messages").select("message_uuid").eq("external_id", externalId).maybeSingle();
      return { ignored: false, duplicate: true, messageUuid: stored?.message_uuid ? String(stored.message_uuid) : "" } as const;
    }
    throw new Error("Inbound email could not be saved.");
  }
  if (!message) throw new Error("Inbound email identifier could not be resolved.");
  const messageUuid = String(message.message_uuid);

  const { error: recipientError } = await supabase.from("inbox_recipients").upsert(
    userUuids.map((userUuid) => ({ thread_uuid: threadUuid, user_uuid: userUuid, read_at: null })),
    { onConflict: "thread_uuid,user_uuid" },
  );
  if (recipientError) throw new Error("Inbound email recipients could not be saved.");

  const notifications = await Promise.allSettled(userUuids.map((userUuid) => createNotification({
    userUuid,
    kind: "message",
    title: { ja: "新しいメール", en: "New email" },
    body: { ja: `${sender.name}さんから「${subject}」が届きました。`, en: `New email from ${sender.name}: ${subject}` },
    data: { threadUuid, channel: "email", mailboxAddress, messageId: input.messageId },
    actionUrl: `/admin/inbox/${threadUuid}`,
  })));
  if (notifications.some((result) => result.status === "rejected")) {
    await notifyDispatcher({ level: "error", event: "inbox_notification_failed", data: { threadUuid } });
  }
  return { ignored: false, duplicate: false, threadUuid, mailboxAddress, messageUuid } as const;
}

export async function saveInboxAttachments(messageUuid: string, attachments: InboxAttachmentInput[]) {
  if (!messageUuid || attachments.length === 0) return;
  const supabase = getSupabaseAdmin();
  for (const attachment of attachments.slice(0, 40)) {
    const externalId = cleanText(attachment.id, 240);
    const { data: existing } = await supabase.from("inbox_attachments").select("attachment_uuid").eq("message_uuid", messageUuid).eq("external_id", externalId).maybeSingle();
    if (existing) continue;
    if (!attachment.downloadUrl.startsWith("https://") || attachment.size > 40 * 1024 * 1024) continue;
    const response = await fetch(attachment.downloadUrl, { signal: AbortSignal.timeout(25_000) });
    if (!response.ok) throw new Error(`Attachment download failed (${response.status}).`);
    const content = await response.arrayBuffer();
    const filename = cleanText(attachment.filename || "attachment", 240);
    const storagePath = `${messageUuid}/${externalId}-${safeStorageName(filename)}`;
    const { error: uploadError } = await supabase.storage.from("inbox-attachments").upload(storagePath, content, {
      contentType: attachment.contentType || "application/octet-stream",
      upsert: false,
    });
    if (uploadError && !uploadError.message.toLowerCase().includes("already exists")) throw new Error("Attachment could not be stored.");
    const { error: insertError } = await supabase.from("inbox_attachments").insert({
      message_uuid: messageUuid,
      external_id: externalId,
      filename,
      content_type: cleanText(attachment.contentType || "application/octet-stream", 160),
      content_disposition: attachment.contentDisposition,
      content_id: attachment.contentId ? cleanText(attachment.contentId, 240) : null,
      size_bytes: content.byteLength,
      storage_path: storagePath,
    });
    if (insertError && insertError.code !== "23505") throw new Error("Attachment information could not be saved.");
  }
}

export async function createInboxMessageShare(input: {
  userUuid: string;
  messageUuid: string;
  targetType: "order" | "workspace";
  targetReference: string;
  includeBody: boolean;
  includeAttachments: boolean;
  sharedDatetime: string | null;
  note: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data: message } = await supabase.from("inbox_messages").select("thread_uuid").eq("message_uuid", input.messageUuid).maybeSingle();
  if (!message) throw new Error("Message could not be found.");
  const { data: recipient } = await supabase.from("inbox_recipients").select("thread_uuid").eq("thread_uuid", message.thread_uuid).eq("user_uuid", input.userUuid).maybeSingle();
  if (!recipient) throw new Error("Message sharing is not permitted.");
  const targetReference = cleanText(input.targetReference, 160);
  if (!targetReference) throw new Error("A sharing destination is required.");
  const sharedDatetime = input.sharedDatetime && !Number.isNaN(Date.parse(input.sharedDatetime)) ? new Date(input.sharedDatetime).toISOString() : null;
  const { error } = await supabase.from("inbox_message_shares").insert({
    message_uuid: input.messageUuid,
    shared_by_user_uuid: input.userUuid,
    target_type: input.targetType,
    target_reference: targetReference,
    include_body: input.includeBody,
    include_attachments: input.includeAttachments,
    shared_datetime: sharedDatetime,
    note: cleanText(input.note, 2000),
  });
  if (error) throw new Error("Message could not be shared.");
}

export async function downloadInboxAttachment(userUuid: string, attachmentUuid: string) {
  const supabase = getSupabaseAdmin();
  const { data: attachment } = await supabase.from("inbox_attachments").select("filename, content_type, storage_path, message:inbox_messages!inner(thread_uuid)").eq("attachment_uuid", attachmentUuid).maybeSingle();
  if (!attachment) return null;
  const message = Array.isArray(attachment.message) ? attachment.message[0] : attachment.message;
  if (!message) return null;
  const { data: recipient } = await supabase.from("inbox_recipients").select("thread_uuid").eq("thread_uuid", message.thread_uuid).eq("user_uuid", userUuid).maybeSingle();
  if (!recipient) return null;
  const { data, error } = await supabase.storage.from("inbox-attachments").download(attachment.storage_path);
  if (error || !data) return null;
  return { data, filename: String(attachment.filename), contentType: String(attachment.content_type) };
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
  senderTier: string;
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
  const availableMailboxes = await listSendMailboxes(input.senderUserUuid, input.senderTier);
  if (!availableMailboxes.includes(mailboxAddress)) {
    throw new Error("Outgoing mailbox is not available.");
  }

  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: `${mailboxAddress === "info@paws-flight.com" ? "PawsFlight Japan" : "わんだにゃー株式会社"} <${mailboxAddress}>`,
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
  const { data: existingThread } = await supabase
    .from("inbox_threads")
    .select("thread_uuid, subject")
    .eq("mailbox_uuid", mailboxUuid)
    .eq("channel", "email")
    .eq("sender_address", recipientAddress)
    .eq("status", "open")
    .order("last_message_at", { ascending: false })
    .limit(50);
  const matchingThread = existingThread?.find((thread) => normalizeSubject(String(thread.subject)) === normalizeSubject(subject));
  let threadUuid = matchingThread?.thread_uuid ? String(matchingThread.thread_uuid) : "";
  if (!threadUuid) {
    const { data: thread, error: threadError } = await supabase.from("inbox_threads").insert({
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
    threadUuid = String(thread.thread_uuid);
  } else {
    const { error: updateError } = await supabase.from("inbox_threads").update({ subject, preview, last_message_at: new Date().toISOString() }).eq("thread_uuid", threadUuid);
    if (updateError) throw new Error("Sent email thread could not be updated.");
  }
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

  const { error: recipientError } = await supabase.from("inbox_recipients").upsert({
    thread_uuid: threadUuid,
    user_uuid: input.senderUserUuid,
    read_at: new Date().toISOString(),
  }, { onConflict: "thread_uuid,user_uuid" });
  if (recipientError) throw new Error("Sent email recipient could not be saved.");
  return { threadUuid, emailId: data.id };
}

export async function listInbox(userUuid: string, query = "", sort: "newest" | "oldest" = "newest") {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("inbox_recipients")
    .select("read_at, thread:inbox_threads!inner(thread_uuid, channel, subject, sender_name, sender_address, preview, last_message_at, mailbox:inbox_mailboxes!inner(address), messages:inbox_messages(direction, created_at))")
    .eq("user_uuid", userUuid)
    .limit(200);
  if (error) throw new Error("Inbox could not be loaded.");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const items = (data ?? []).flatMap((row) => {
    const thread = Array.isArray(row.thread) ? row.thread[0] : row.thread;
    if (!thread) return [];
    const mailbox = Array.isArray(thread.mailbox) ? thread.mailbox[0] : thread.mailbox;
    const latestMessage = [...(thread.messages ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    const item: InboxItem = {
      threadUuid: String(thread.thread_uuid), channel: thread.channel, subject: thread.subject,
      senderName: thread.sender_name, senderAddress: thread.sender_address, preview: thread.preview,
      mailboxAddress: mailbox?.address ?? "",
      latestDirection: latestMessage?.direction === "outbound" ? "outbound" : "inbound",
      readAt: row.read_at, lastMessageAt: thread.last_message_at,
    };
    const searchable = `${item.senderName} ${item.senderAddress} ${item.subject} ${item.preview}`.toLocaleLowerCase();
    return !normalizedQuery || searchable.includes(normalizedQuery) ? [item] : [];
  });
  return items.sort((a, b) => (sort === "oldest" ? 1 : -1) * a.lastMessageAt.localeCompare(b.lastMessageAt));
}

export async function getInboxUnreadCount(userUuid: string) {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("inbox_recipients")
    .select("thread_uuid", { count: "exact", head: true })
    .eq("user_uuid", userUuid)
    .is("read_at", null);
  if (error) throw new Error("Inbox unread count could not be loaded.");
  return count ?? 0;
}

export async function getInboxThread(userUuid: string, threadUuid: string): Promise<InboxThread | null> {
  const supabase = getSupabaseAdmin();
  const { data: recipient } = await supabase.from("inbox_recipients").select("read_at").eq("user_uuid", userUuid).eq("thread_uuid", threadUuid).maybeSingle();
  if (!recipient) return null;
  const { data: thread, error } = await supabase
    .from("inbox_threads")
    .select("thread_uuid, channel, subject, sender_name, sender_address, preview, last_message_at, mailbox:inbox_mailboxes!inner(address), messages:inbox_messages(message_uuid, direction, sender_address, recipient_addresses, subject, body_text, body_html, created_at, attachments:inbox_attachments(attachment_uuid, filename, content_type, size_bytes))")
    .eq("thread_uuid", threadUuid)
    .single();
  if (error || !thread) return null;
  if (!recipient.read_at) await supabase.from("inbox_recipients").update({ read_at: new Date().toISOString() }).eq("user_uuid", userUuid).eq("thread_uuid", threadUuid);
  const mailbox = Array.isArray(thread.mailbox) ? thread.mailbox[0] : thread.mailbox;
  return {
    threadUuid: String(thread.thread_uuid), channel: thread.channel, subject: thread.subject,
    senderName: thread.sender_name, senderAddress: thread.sender_address, preview: thread.preview,
    mailboxAddress: mailbox?.address ?? "",
    latestDirection: (thread.messages ?? []).at(-1)?.direction === "outbound" ? "outbound" : "inbound",
    readAt: recipient.read_at ?? new Date().toISOString(), lastMessageAt: thread.last_message_at,
    messages: (thread.messages ?? []).map((message) => ({
      messageUuid: String(message.message_uuid), direction: message.direction,
      senderAddress: message.sender_address, recipientAddresses: message.recipient_addresses ?? [],
      subject: message.subject, bodyText: message.body_text, bodyHtml: message.body_html,
      attachments: (message.attachments ?? []).map((attachment) => ({
        attachmentUuid: String(attachment.attachment_uuid), filename: String(attachment.filename),
        contentType: String(attachment.content_type), sizeBytes: Number(attachment.size_bytes),
      })),
      createdAt: message.created_at,
    })).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

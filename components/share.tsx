"use client";

import { CalendarDays, Paperclip, Share2, X } from "lucide-react";
import { useState } from "react";

export function MessageShare({ messageUuid, attachmentCount, language }: { messageUuid: string; attachmentCount: number; language: "ja" | "en" }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function submit(formData: FormData) {
    setSaving(true);
    setNotice("");
    const response = await fetch("/api/inbox/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageUuid,
        targetType: formData.get("targetType"),
        targetReference: formData.get("targetReference"),
        includeBody: formData.get("includeBody") === "on",
        includeAttachments: formData.get("includeAttachments") === "on",
        sharedDatetime: formData.get("sharedDatetime"),
        note: formData.get("note"),
      }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setNotice(result.error ?? (language === "en" ? "Could not share this message." : "共有できませんでした。"));
      return;
    }
    setOpen(false);
    setNotice(language === "en" ? "Message shared." : "メッセージを共有しました。");
    window.setTimeout(() => setNotice(""), 3000);
  }

  return (
    <>
      <button className="adminMessageShareButton" type="button" onClick={() => setOpen(true)}><Share2 aria-hidden="true" />{language === "en" ? "Share" : "共有"}</button>
      {notice ? <p className="adminMessageShareToast" role="status">{notice}</p> : null}
      {open ? <div className="adminMessageShareOverlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <form className="adminMessageShareDialog" action={submit}>
          <header><div><Share2 aria-hidden="true" /><h2>{language === "en" ? "Share message" : "メッセージを共有"}</h2></div><button type="button" aria-label={language === "en" ? "Close" : "閉じる"} onClick={() => setOpen(false)}><X aria-hidden="true" /></button></header>
          <fieldset><legend>{language === "en" ? "Destination" : "共有先"}</legend><label><input type="radio" name="targetType" value="order" defaultChecked />{language === "en" ? "Order" : "オーダー"}</label><label><input type="radio" name="targetType" value="workspace" />{language === "en" ? "Workspace" : "ワークスペース"}</label></fieldset>
          <label>{language === "en" ? "Name or reference" : "共有先の名称・番号"}<input name="targetReference" required placeholder={language === "en" ? "Order number or workspace name" : "オーダー番号またはワークスペース名"} /></label>
          <fieldset><legend>{language === "en" ? "Content" : "共有する内容"}</legend><label><input type="checkbox" name="includeBody" defaultChecked />{language === "en" ? "Message body" : "本文"}</label>{attachmentCount > 0 ? <label><input type="checkbox" name="includeAttachments" defaultChecked /><Paperclip aria-hidden="true" />{language === "en" ? `Attachments (${attachmentCount})` : `添付書類（${attachmentCount}件）`}</label> : null}</fieldset>
          <label><span><CalendarDays aria-hidden="true" />{language === "en" ? "Date and time" : "日時"}</span><input type="datetime-local" name="sharedDatetime" /></label>
          <label>{language === "en" ? "Note" : "メモ"}<textarea name="note" rows={3} /></label>
          {notice ? <p className="adminMessageShareError" role="alert">{notice}</p> : null}
          <button className="adminMessageShareSubmit" type="submit" disabled={saving}>{saving ? language === "en" ? "Sharing…" : "共有中…" : language === "en" ? "Share" : "共有する"}</button>
        </form>
      </div> : null}
    </>
  );
}

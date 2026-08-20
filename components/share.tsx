"use client";

import { CalendarDays, Paperclip, Share2, X } from "lucide-react";
import { useState } from "react";
import type { InboxOrder } from "@/lib/inbox";

export function MessageShare({ messageUuid, attachmentCount, language, orders }: { messageUuid: string; attachmentCount: number; language: "ja" | "en"; orders: InboxOrder[] }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [targetType, setTargetType] = useState<"order" | "workspace">("order");
  const [orderUuid, setOrderUuid] = useState("");

  async function submit(formData: FormData) {
    setSaving(true);
    setNotice("");
    const response = await fetch("/api/inbox/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageUuid,
        targetType: formData.get("targetType"),
        orderUuid: formData.get("orderUuid"),
        businessUnit: formData.get("businessUnit"),
        workType: formData.get("workType"),
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
          <fieldset><legend>{language === "en" ? "Destination" : "共有先"}</legend><label><input type="radio" name="targetType" value="order" checked={targetType === "order"} onChange={() => setTargetType("order")} />{language === "en" ? "Order" : "オーダー"}</label><label><input type="radio" name="targetType" value="workspace" checked={targetType === "workspace"} onChange={() => setTargetType("workspace")} />{language === "en" ? "Workspace" : "ワークスペース"}</label></fieldset>
          {targetType === "order" ? <><label>{language === "en" ? "Order" : "オーダー"}<select name="orderUuid" value={orderUuid} onChange={(event) => setOrderUuid(event.target.value)}><option value="">{language === "en" ? "Create a new order" : "新しいオーダーを作成"}</option>{orders.map((order) => <option key={order.orderUuid} value={order.orderUuid}>{order.orderCode}｜{order.title}{order.customerName ? `｜${order.customerName}` : ""}</option>)}</select></label>{!orderUuid ? <><label>{language === "en" ? "New order name" : "新しいオーダー名"}<input name="targetReference" required placeholder={language === "en" ? "Order name" : "オーダー名"} /></label><label>{language === "en" ? "Business" : "業務区分"}<select name="businessUnit" defaultValue="pawsflight"><option value="pawsflight">PawsFlight</option><option value="wandanya">WanDaNya</option><option value="airport">AirPort</option><option value="tokyo">Tokyo</option></select></label><label>{language === "en" ? "Work type" : "業務種別"}<select name="workType" defaultValue="air_transport"><option value="transport">{language === "en" ? "Transport" : "送迎"}</option><option value="charter">{language === "en" ? "Charter" : "貸切"}</option><option value="airport_shuttle">{language === "en" ? "Airport shuttle" : "空港シャトル"}</option><option value="air_transport">{language === "en" ? "Air transport" : "航空輸送"}</option><option value="quarantine">{language === "en" ? "Quarantine support" : "検疫・手続き"}</option><option value="other">{language === "en" ? "Other" : "その他"}</option></select></label></> : <input type="hidden" name="targetReference" value="" />}</> : <label>{language === "en" ? "Workspace" : "ワークスペース"}<input name="targetReference" required placeholder={language === "en" ? "Workspace name" : "ワークスペース名"} /></label>}
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

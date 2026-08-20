"use client";

import { Languages, ListPlus, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Modal } from "@/components/modal";

type Language = "ja" | "en";
type Suggestion = {
  title: string;
  businessUnit: "pawsflight" | "wandanya" | "airport" | "tokyo";
  workType: "transport" | "charter" | "airport_shuttle" | "air_transport" | "quarantine" | "other";
  scheduledAt: string;
  notes: string;
};

function confirmUrl(url: string, language: Language) {
  if (!/^https?:\/\//i.test(url)) return false;
  return window.confirm(language === "en" ? `Open this URL?\n${url}` : `このURLを開きますか？\n${url}`);
}

function LinkedText({ text, language }: { text: string; language: Language }) {
  const parts = text.split(/(https?:\/\/[^\s<>"']+)/gi);
  return <>{parts.map((part, index) => /^https?:\/\//i.test(part)
    ? <a href={part} key={`${part}-${index}`} onClick={(event) => {
      event.preventDefault();
      if (confirmUrl(part, language)) window.open(part, "_blank", "noopener,noreferrer");
    }}>{part}</a>
    : part)}</>;
}

export function MessageHtml({ htmlDocument, language }: { htmlDocument: string; language: Language }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const parsed = new DOMParser().parseFromString(htmlDocument, "text/html");
    const styles = Array.from(parsed.querySelectorAll("style")).map((style) => style.outerHTML).join("");
    root.innerHTML = `${styles}${parsed.body.innerHTML}`;
    root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
      link.onclick = (event) => {
        event.preventDefault();
        const url = link.href;
        if (confirmUrl(url, language)) window.open(url, "_blank", "noopener,noreferrer");
      };
    });
  }, [htmlDocument, language]);

  return <div ref={hostRef} className="adminMailDocument" role="document" aria-label={language === "en" ? "HTML email content" : "HTMLメール本文"} />;
}

export function MessageBody({ threadUuid, messageUuid, originalText, language }: { threadUuid: string; messageUuid: string; originalText: string; language: Language }) {
  const [translatedText, setTranslatedText] = useState("");
  const [translated, setTranslated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function toggleTranslation() {
    if (translated) {
      setTranslated(false);
      return;
    }
    if (translatedText) {
      setTranslated(true);
      return;
    }
    setLoading(true);
    setNotice(language === "en" ? "Translating…" : "翻訳中…");
    try {
      const response = await fetch("/api/inbox/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "translate", threadUuid, messageUuid, targetLanguage: language }),
        cache: "no-store",
        signal: AbortSignal.timeout(35_000),
      });
      const result = await response.json().catch(() => ({})) as { translatedText?: string; error?: string };
      if (!response.ok || !result.translatedText) {
        setNotice(result.error || (language === "en" ? "Translation failed." : "翻訳できませんでした。"));
        return;
      }
      setTranslatedText(result.translatedText);
      setTranslated(true);
      setNotice("");
    } catch {
      setNotice(language === "en" ? "The translation request timed out." : "翻訳処理がタイムアウトしました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return <div className="messageBody"><div className="adminMailText"><LinkedText text={translated ? translatedText : originalText} language={language} /></div><div className="messageBodyActions"><button type="button" onClick={toggleTranslation} disabled={loading}><Languages aria-hidden="true" />{loading ? language === "en" ? "Translating…" : "翻訳中…" : translated ? language === "en" ? "Original" : "原文" : language === "en" ? "Translate" : "翻訳"}</button>{notice ? <span role="status">{notice}</span> : null}</div>{notice ? <span className="messageAssistToast" role="status">{notice}</span> : null}</div>;
}

export function MessageOrder({ threadUuid, messageUuid, attachmentCount, language }: { threadUuid: string; messageUuid: string; attachmentCount: number; language: Language }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  async function openOrder() {
    setOpen(true);
    setLoading(true);
    setNotice(language === "en" ? "AI is reading the message…" : "AIがメッセージを読み取っています…");
    try {
      const response = await fetch("/api/inbox/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest_order", threadUuid, messageUuid }),
        cache: "no-store",
        signal: AbortSignal.timeout(35_000),
      });
      const result = await response.json().catch(() => ({})) as { suggestion?: Suggestion; error?: string };
      if (!response.ok || !result.suggestion) {
        setNotice(result.error || (language === "en" ? "Could not create a suggestion." : "提案を作成できませんでした。"));
        return;
      }
      setSuggestion(result.suggestion);
      setNotice("");
    } catch {
      setNotice(language === "en" ? "The AI request timed out." : "AIの読み取りがタイムアウトしました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  async function submit(formData: FormData) {
    setSaving(true);
    setNotice(language === "en" ? "Creating order…" : "オーダーを作成中…");
    const response = await fetch("/api/inbox/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageUuid,
        targetType: "order",
        businessUnit: formData.get("businessUnit"),
        workType: formData.get("workType"),
        targetReference: formData.get("title"),
        includeBody: true,
        includeAttachments: formData.get("includeAttachments") === "on",
        sharedDatetime: formData.get("scheduledAt"),
        note: formData.get("notes"),
      }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setNotice(result.error || (language === "en" ? "Could not create order." : "オーダーを作成できませんでした。"));
      return;
    }
    setOpen(false);
    setNotice(language === "en" ? "Order created." : "オーダーを作成しました。ワークスペースで確認できます。 ");
    window.setTimeout(() => setNotice(""), 4000);
  }

  return <><button className="messageOrderButton" type="button" onClick={openOrder} disabled={loading}><ListPlus aria-hidden="true" />{loading ? language === "en" ? "Reading…" : "読取中…" : language === "en" ? "Create order" : "オーダー作成"}</button>{notice ? <span className="messageAssistToast" role="status">{notice}</span> : null}<Modal label={language === "en" ? "Create order from message" : "メッセージからオーダー作成"} open={open} onClose={() => !saving && setOpen(false)} overlayClassName="messageOrderOverlay" panelClassName="messageOrderDialog"><div className="messageOrderHeading"><Sparkles aria-hidden="true" /><h2>{language === "en" ? "Create order" : "オーダー作成"}</h2></div>{loading ? <div className="messageOrderLoading" role="status"><Sparkles aria-hidden="true" /><strong>{notice}</strong></div> : suggestion ? <form className="messageOrderForm" action={submit}><p>{language === "en" ? "AI suggestion. Review and edit before creating." : "AIの提案です。内容を確認・修正してから登録してください。"}</p><label>{language === "en" ? "Order name" : "オーダー名"}<input name="title" defaultValue={suggestion.title} required /></label><label>{language === "en" ? "Business" : "業務区分"}<select name="businessUnit" defaultValue={suggestion.businessUnit}><option value="pawsflight">PawsFlight</option><option value="wandanya">WanDaNya</option><option value="airport">AirPort</option><option value="tokyo">Tokyo</option></select></label><label>{language === "en" ? "Work type" : "業務種別"}<select name="workType" defaultValue={suggestion.workType}><option value="transport">{language === "en" ? "Transport" : "送迎"}</option><option value="charter">{language === "en" ? "Charter" : "貸切"}</option><option value="airport_shuttle">{language === "en" ? "Airport shuttle" : "空港シャトル"}</option><option value="air_transport">{language === "en" ? "Air transport" : "航空輸送"}</option><option value="quarantine">{language === "en" ? "Quarantine" : "検疫・手続き"}</option><option value="other">{language === "en" ? "Other" : "その他"}</option></select></label><label>{language === "en" ? "Date and time" : "日時"}<input type="datetime-local" name="scheduledAt" defaultValue={suggestion.scheduledAt.slice(0, 16)} /></label><label>{language === "en" ? "AI summary / notes" : "AI要約・メモ"}<textarea name="notes" rows={5} defaultValue={suggestion.notes} /></label>{attachmentCount > 0 ? <label className="messageOrderCheck"><input type="checkbox" name="includeAttachments" defaultChecked />{language === "en" ? `Link attachments (${attachmentCount})` : `添付書類も紐づける（${attachmentCount}件）`}</label> : null}{notice ? <p className="messageOrderError" role="alert">{notice}</p> : null}<button type="submit" disabled={saving}>{saving ? language === "en" ? "Creating…" : "作成中…" : language === "en" ? "Create as draft" : "下書きで登録"}</button></form> : <p className="messageOrderError" role="alert">{notice}</p>}</Modal></>;
}

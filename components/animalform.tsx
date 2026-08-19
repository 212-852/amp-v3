"use client";

import { Plus, Search, Save, Unlock, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { AnimalStatus } from "@/lib/identity";

type Text = {
  basic: string;
  details: string;
  nameJa: string;
  nameEn: string;
  tags: string;
  aliases: string;
  summaryJa: string;
  summaryEn: string;
  transportJa: string;
  transportEn: string;
  crateJa: string;
  crateEn: string;
  status: string;
  save: string;
  hint: string;
  statuses: Record<AnimalStatus, string>;
};

type Suggestion = {
  nameJa: string;
  nameEn: string;
  tags: string[];
  aliasesJa: string[];
  aliasesEn: string[];
  sourceUrl: string;
};

const emptySuggestion: Suggestion = { nameJa: "", nameEn: "", tags: [], aliasesJa: [], aliasesEn: [], sourceUrl: "" };

function normalizeTags(value: string, existingTags: string[]) {
  const existing = new Map(existingTags.map((tag) => [tag.toLocaleLowerCase(), tag]));
  return Array.from(new Map(value.split(/[,、]/).map((tag) => tag.trim()).filter(Boolean).map((tag) => {
    const canonical = existing.get(tag.toLocaleLowerCase()) ?? tag;
    return [canonical.toLocaleLowerCase(), canonical];
  })).values());
}

export function AnimalForm({ action, existingTags, language, modal = false, text }: { action: (formData: FormData) => void | Promise<void>; existingTags: string[]; language: "ja" | "en"; modal?: boolean; text: Text }) {
  const [nameJa, setNameJa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [tags, setTags] = useState("");
  const [suggestion, setSuggestion] = useState(emptySuggestion);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const lastRequestedName = useRef("");

  const suggest = useCallback(async (force = false) => {
    const lookupName = nameJa.trim();
    if (!lookupName || (!force && lastRequestedName.current === lookupName)) return;
    lastRequestedName.current = lookupName;
    setLoading(true);
    setMessage(language === "ja" ? "Wikipediaから取得中…" : "Getting information from Wikipedia…");
    try {
      const response = await fetch("/api/animals/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: lookupName }) });
      const result = await response.json() as { suggestion?: Suggestion; error?: string };
      if (!response.ok || !result.suggestion) {
        setMessage(result.error ?? (language === "ja" ? "情報を取得できませんでした。" : "Information could not be retrieved."));
        return;
      }
      setSuggestion(result.suggestion);
      const resolvedName = result.suggestion.nameJa || lookupName;
      lastRequestedName.current = resolvedName;
      setNameJa(resolvedName);
      setNameEn(result.suggestion.nameEn);
      setTags(normalizeTags(result.suggestion.tags.join("、"), existingTags).join("、"));
      setUnlocked(true);
      setMessage(language === "ja" ? "取得しました。内容を確認・修正してください。" : "Information retrieved. Review and edit it before saving.");
    } catch {
      setMessage(language === "ja" ? "情報を取得できませんでした。" : "Information could not be retrieved.");
    } finally {
      setLoading(false);
    }
  }, [existingTags, language, nameJa]);

  useEffect(() => {
    if (!nameJa.trim()) return;
    const timer = window.setTimeout(() => void suggest(), 700);
    return () => window.clearTimeout(timer);
  }, [nameJa, suggest]);

  function addExistingTag(tag: string) {
    setTags(normalizeTags([tags, tag].filter(Boolean).join("、"), existingTags).join("、"));
  }

  const form = <form action={action} className="adminPetForm" onSubmit={() => { if (modal) setModalOpen(false); }}>
    <fieldset><legend>{text.basic}</legend><div className="adminLanguageEditor adminAnimalNameEditor">
      <input defaultChecked id="animalNameLanguageJa" name="nameEditorLanguage" type="radio" value="ja" /><input id="animalNameLanguageEn" name="nameEditorLanguage" type="radio" value="en" />
      <div className="adminLanguageTabs"><label htmlFor="animalNameLanguageJa">日本語</label><label htmlFor="animalNameLanguageEn">English</label></div>
      <div className="adminLanguagePanels">
        <div className="adminLanguagePanel adminLanguagePanel--ja"><label>{text.nameJa}<span className="adminAnimalLookup"><input name="nameJa" required maxLength={80} value={nameJa} onChange={(event) => { setNameJa(event.target.value); setUnlocked(false); setMessage(""); }} /><button disabled={loading || !nameJa.trim()} onClick={() => void suggest(true)} type="button"><Search aria-hidden="true" />{loading ? (language === "ja" ? "取得中" : "Loading") : (language === "ja" ? "情報取得" : "Get information")}</button></span></label></div>
        <div className="adminLanguagePanel adminLanguagePanel--en"><label>{text.nameEn}<input disabled={!unlocked} name="nameEn" required maxLength={80} value={nameEn} onChange={(event) => setNameEn(event.target.value)} /></label></div>
      </div>
    </div><div className="adminPetFields">
      <button className="adminAnimalUnlock" type="button" onClick={() => setUnlocked(true)}><Unlock aria-hidden="true" />{language === "ja" ? "手入力を解放" : "Unlock manual entry"}</button>
      {message ? <p className="adminAnimalStatus" role="status">{message}</p> : null}
      {suggestion.sourceUrl ? <p className="adminAnimalSource">{language === "ja" ? "取得元" : "Source"}: <a href={suggestion.sourceUrl} rel="noreferrer" target="_blank">Wikipedia</a></p> : null}
    </div></fieldset>
    <fieldset disabled={!unlocked} className={!unlocked ? "isLocked" : undefined}><legend>{text.basic}</legend><div className="adminPetFields adminPetFieldsCommon">
      <label className="adminAnimalTagsField">{text.tags}<input name="tags" required value={tags} onBlur={() => setTags(normalizeTags(tags, existingTags).join("、"))} onChange={(event) => setTags(event.target.value)} placeholder={language === "ja" ? "犬、大型犬、長毛" : "dog, large, long-haired"} /><small>{text.hint}</small>{existingTags.length ? <span className="adminExistingTags"><b>{language === "ja" ? "登録済みタグ" : "Existing tags"}</b><span>{existingTags.map((tag) => <button className={normalizeTags(tags, existingTags).some((selected) => selected.toLocaleLowerCase() === tag.toLocaleLowerCase()) ? "isSelected" : undefined} key={tag} onClick={() => addExistingTag(tag)} type="button">{tag}</button>)}</span></span> : null}</label>
      <label>{language === "ja" ? "学名" : "Scientific name"}<input name="scientificName" required placeholder="Canis lupus familiaris" /></label>
      <label>{text.status}<select name="status">{(["draft", "published", "archived"] as AnimalStatus[]).map((item) => <option value={item} key={item}>{text.statuses[item]}</option>)}</select></label>
      <label>{language === "ja" ? "短頭種" : "Brachycephalic"}<select name="brachycephalic" defaultValue="no"><option value="no">{language === "ja" ? "いいえ" : "No"}</option><option value="yes">{language === "ja" ? "はい" : "Yes"}</option></select></label>
      <label>{language === "ja" ? "暑さ注意" : "Heat caution"}<select name="heatCaution" defaultValue="yes"><option value="no">{language === "ja" ? "なし" : "No"}</option><option value="yes">{language === "ja" ? "あり" : "Yes"}</option></select></label>
      <label>{language === "ja" ? "脱走リスク" : "Escape risk"}<select name="escapeRisk" defaultValue="medium"><option value="low">{language === "ja" ? "低" : "Low"}</option><option value="medium">{language === "ja" ? "中" : "Medium"}</option><option value="high">{language === "ja" ? "高" : "High"}</option></select></label>
    </div><div className="adminLanguageEditor" key={suggestion.nameEn}>
      <input defaultChecked id="animalLanguageJa" name="editorLanguage" type="radio" value="ja" /><input id="animalLanguageEn" name="editorLanguage" type="radio" value="en" />
      <div className="adminLanguageTabs"><label htmlFor="animalLanguageJa">{language === "ja" ? "日本語" : "Japanese"}</label><label htmlFor="animalLanguageEn">English</label></div>
      <div className="adminLanguagePanels">
        <div className="adminLanguagePanel adminLanguagePanel--ja"><div className="adminPetFields">
          <label>動物種<input name="speciesJa" required placeholder="犬" /></label>
          <label>{text.aliases}（日本語）<input name="aliasesJa" defaultValue={suggestion.aliasesJa.join("、")} /></label>
          <label>原産地<input name="originJa" required placeholder="日本" /></label>
          <label>サイズ区分<input name="sizeJa" required placeholder="小型〜中型" /></label>
          <label>体重目安<input name="weightJa" required placeholder="約7〜11kg" /></label>
          <label>寿命目安<input name="lifespanJa" required placeholder="約12〜15年" /></label>
          <label>特徴<textarea name="traitsJa" required rows={4} placeholder="警戒心が強い、独立心が強い、活発など" /></label>
          <label>推奨輸送方法<input name="transportJa" required placeholder="リード＋クレート" /></label>
          <label>コテ<input name="koteJa" placeholder="内容が決まり次第入力" /></label>
        </div></div>
        <div className="adminLanguagePanel adminLanguagePanel--en"><div className="adminPetFields">
          <label>Animal type<input name="speciesEn" required placeholder="Dog" /></label>
          <label>{text.aliases}（English）<input name="aliasesEn" defaultValue={suggestion.aliasesEn.join(", ")} /></label>
          <label>Origin<input name="originEn" required placeholder="Japan" /></label>
          <label>Size class<input name="sizeEn" required placeholder="Small to medium" /></label>
          <label>Weight guide<input name="weightEn" required placeholder="Approx. 7–11 kg" /></label>
          <label>Lifespan guide<input name="lifespanEn" required placeholder="Approx. 12–15 years" /></label>
          <label>Traits<textarea name="traitsEn" required rows={4} placeholder="Alert, independent, active" /></label>
          <label>Recommended transport<input name="transportEn" required placeholder="Leash and crate" /></label>
          <label>Kote<input name="koteEn" placeholder="Enter when defined" /></label>
        </div></div>
      </div>
    </div></fieldset>
    <button className="adminPetSave" disabled={!unlocked} type="submit"><Save aria-hidden="true" />{text.save}</button>
  </form>;

  if (!modal) return form;

  return <>
    <button className="adminPetAdd" type="button" aria-label={language === "ja" ? "新規登録" : "New entry"} title={language === "ja" ? "新規登録" : "New entry"} onClick={() => setModalOpen(true)}><Plus aria-hidden="true" /></button>
    {modalOpen ? <div className="adminAnimalModal" role="presentation" onMouseDown={() => setModalOpen(false)}>
      <section aria-label={language === "ja" ? "新規登録" : "New entry"} aria-modal="true" className="adminAnimalModalPanel" role="dialog" onMouseDown={(event) => event.stopPropagation()}>
        <header><h2>{language === "ja" ? "新規登録" : "New entry"}</h2><button type="button" aria-label={language === "ja" ? "閉じる" : "Close"} onClick={() => setModalOpen(false)}><X aria-hidden="true" /></button></header>
        {form}
      </section>
    </div> : null}
  </>;
}

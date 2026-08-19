"use client";

import { Plus, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { AnimalStatus } from "@/lib/identity";
import { animalSizeOptions, animalSpeciesOptions, normalizeComma, normalizeTagInput } from "@/lib/form";

type Text = {
  basic: string;
  details: string;
  nameJa: string;
  nameEn: string;
  tags: string;
  aliases: string;
  summaryJa: string;
  summaryEn: string;
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
  originJa: string;
  sizeJa: string;
  sourceUrl: string;
};

const emptySuggestion: Suggestion = { nameJa: "", nameEn: "", tags: [], aliasesJa: [], aliasesEn: [], originJa: "", sizeJa: "", sourceUrl: "" };

export function AnimalForm({ action, countries, existingTags, language, modal = false, text }: { action: (formData: FormData) => void | Promise<void>; countries: Array<{ ja: string; en: string }>; existingTags: string[]; language: "ja" | "en"; modal?: boolean; text: Text }) {
  const [nameJa, setNameJa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [speciesJa, setSpeciesJa] = useState("");
  const [speciesEn, setSpeciesEn] = useState("");
  const [originJa, setOriginJa] = useState("");
  const [originEn, setOriginEn] = useState("");
  const [sizeJa, setSizeJa] = useState("");
  const [sizeEn, setSizeEn] = useState("");
  const [tags, setTags] = useState("");
  const [suggestion, setSuggestion] = useState(emptySuggestion);
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLInputElement>(null);
  const lastRequestedName = useRef("");

  const suggest = useCallback(async () => {
    const lookupName = nameJa.trim();
    if (!lookupName || lastRequestedName.current === lookupName) return;
    lastRequestedName.current = lookupName;
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
      const matchedCountry = countries.find((country) => country.ja === result.suggestion?.originJa || country.en === result.suggestion?.originJa);
      if (matchedCountry) {
        setOriginJa(matchedCountry.ja);
        setOriginEn(matchedCountry.en);
      }
      const matchedSize = animalSizeOptions.find((size) => size.ja === result.suggestion?.sizeJa || size.en === result.suggestion?.sizeJa);
      if (matchedSize) {
        setSizeJa(matchedSize.ja);
        setSizeEn(matchedSize.en);
      }
      setUnlocked(true);
      setMessage(language === "ja" ? "取得しました。内容を確認・修正してください。" : "Information retrieved. Review and edit it before saving.");
    } catch {
      setMessage(language === "ja" ? "情報を取得できませんでした。" : "Information could not be retrieved.");
    }
  }, [countries, language, nameJa]);

  useEffect(() => {
    if (!nameJa.trim()) return;
    const timer = window.setTimeout(() => void suggest(), 700);
    return () => window.clearTimeout(timer);
  }, [nameJa, suggest]);

  function addExistingTag(tag: string) {
    setTags(normalizeTagInput([tags, tag].filter(Boolean).join(", "), existingTags));
  }

  function submitWithStatus(status: AnimalStatus) {
    if (statusRef.current) statusRef.current.value = status;
    setStatusOpen(false);
    formRef.current?.requestSubmit();
  }

  const form = <form action={action} className="adminPetForm" ref={formRef} onSubmit={() => { if (modal) setModalOpen(false); }}>
    <input name="status" ref={statusRef} type="hidden" defaultValue="draft" />
    <fieldset><legend>{text.basic}</legend><div className="adminAnimalLookupBlock">
      <label>{language === "ja" ? "名称（日本語）" : "Name (Japanese)"}<input name="nameJa" required maxLength={80} value={nameJa} onChange={(event) => { setNameJa(event.target.value); setUnlocked(false); setMessage(""); }} /><small>{language === "ja" ? "入力後、自動で情報を取得します。" : "Information is retrieved automatically after entry."}</small></label>
      <label>{language === "ja" ? "名称（英語）" : "Name (English)"}<input disabled={!unlocked} name="nameEn" required maxLength={80} value={nameEn} onChange={(event) => setNameEn(event.target.value)} /></label>
      {message ? <p className="adminAnimalStatus" role="status">{message}</p> : null}
      {suggestion.sourceUrl ? <p className="adminAnimalSource">{language === "ja" ? "取得したページ" : "Retrieved page"}: <a href={suggestion.sourceUrl} rel="noreferrer" target="_blank">{suggestion.nameJa}（Wikipedia）</a></p> : null}
    </div><div className="adminAnimalDivider" />
    <fieldset disabled={!unlocked} className={`adminAnimalDetails${!unlocked ? " isLocked" : ""}`}><div className="adminPetFields adminPetFieldsCommon">
      <label className="adminAnimalTagsField">{text.tags}<input name="tags" required value={tags} onBlur={() => setTags(normalizeTagInput(tags, existingTags))} onChange={(event) => setTags(normalizeComma(event.target.value))} placeholder={language === "ja" ? "犬, 大型犬, 長毛" : "dog, large, long-haired"} /><small>{text.hint}</small>{suggestion.tags.length ? <span className="adminExistingTags adminSuggestedTags"><b>{language === "ja" ? "タグ候補（クリックして追加）" : "Suggested tags (click to add)"}</b><span>{suggestion.tags.map((tag) => <button className={normalizeTagInput(tags, existingTags).split(", ").some((selected) => selected.toLocaleLowerCase() === tag.toLocaleLowerCase()) ? "isSelected" : undefined} key={tag} onClick={() => addExistingTag(tag)} type="button">{tag}</button>)}</span></span> : null}{existingTags.length ? <span className="adminExistingTags"><b>{language === "ja" ? "登録済みタグ" : "Existing tags"}</b><span>{existingTags.map((tag) => <button className={normalizeTagInput(tags, existingTags).split(", ").some((selected) => selected.toLocaleLowerCase() === tag.toLocaleLowerCase()) ? "isSelected" : undefined} key={tag} onClick={() => addExistingTag(tag)} type="button">{tag}</button>)}</span></span> : null}</label>
      <label>{language === "ja" ? "学名" : "Scientific name"}<input name="scientificName" required placeholder="Canis lupus familiaris" /></label>
    </div><div className="adminLanguageEditor" key={suggestion.nameEn}>
      <input defaultChecked id="animalLanguageJa" name="editorLanguage" type="radio" value="ja" /><input id="animalLanguageEn" name="editorLanguage" type="radio" value="en" />
      <div className="adminLanguageTabs"><label htmlFor="animalLanguageJa">{language === "ja" ? "日本語" : "Japanese"}</label><label htmlFor="animalLanguageEn">English</label></div>
      <div className="adminLanguagePanels">
        <div className="adminLanguagePanel adminLanguagePanel--ja"><div className="adminPetFields">
          <label>動物種<select name="speciesJa" required value={speciesJa} onChange={(event) => { const selected = animalSpeciesOptions.find((species) => species.ja === event.target.value); setSpeciesJa(event.target.value); setSpeciesEn(selected?.en ?? ""); }}><option disabled value="">選択してください</option>{animalSpeciesOptions.map((species) => <option key={species.ja} value={species.ja}>{species.ja}</option>)}</select></label>
          <label>{text.aliases}（日本語）<input name="aliasesJa" defaultValue={suggestion.aliasesJa.join("、")} /></label>
          <label>原産国<select name="originJa" required value={originJa} onChange={(event) => { const selected = countries.find((country) => country.ja === event.target.value); setOriginJa(event.target.value); setOriginEn(selected?.en ?? ""); }}><option disabled value="">選択してください</option>{countries.map((country) => <option key={`${country.ja}-${country.en}`} value={country.ja}>{country.ja}</option>)}</select></label>
          <label>サイズ区分<select name="sizeJa" required value={sizeJa} onChange={(event) => { const selected = animalSizeOptions.find((size) => size.ja === event.target.value); setSizeJa(event.target.value); setSizeEn(selected?.en ?? ""); }}><option disabled value="">選択してください</option>{animalSizeOptions.map((size) => <option key={size.ja} value={size.ja}>{size.ja}</option>)}</select></label>
          <label>体重目安<input name="weightJa" required placeholder="約7〜11kg" /></label>
          <label>寿命目安<input name="lifespanJa" required placeholder="約12〜15年" /></label>
          <label>特徴<textarea name="traitsJa" required rows={4} placeholder="警戒心が強い、独立心が強い、活発など" /></label>
        </div></div>
        <div className="adminLanguagePanel adminLanguagePanel--en"><div className="adminPetFields">
          <label>Animal type<select name="speciesEn" required value={speciesEn} onChange={(event) => { const selected = animalSpeciesOptions.find((species) => species.en === event.target.value); setSpeciesEn(event.target.value); setSpeciesJa(selected?.ja ?? ""); }}><option disabled value="">Select</option>{animalSpeciesOptions.map((species) => <option key={species.en} value={species.en}>{species.en}</option>)}</select></label>
          <label>{text.aliases}（English）<input name="aliasesEn" defaultValue={suggestion.aliasesEn.join(", ")} /></label>
          <label>Country of origin<select name="originEn" required value={originEn} onChange={(event) => { const selected = countries.find((country) => country.en === event.target.value); setOriginEn(event.target.value); setOriginJa(selected?.ja ?? ""); }}><option disabled value="">Select</option>{countries.map((country) => <option key={`${country.en}-${country.ja}`} value={country.en}>{country.en}</option>)}</select></label>
          <label>Size class<select name="sizeEn" required value={sizeEn} onChange={(event) => { const selected = animalSizeOptions.find((size) => size.en === event.target.value); setSizeEn(event.target.value); setSizeJa(selected?.ja ?? ""); }}><option disabled value="">Select</option>{animalSizeOptions.map((size) => <option key={size.en} value={size.en}>{size.en}</option>)}</select></label>
          <label>Weight guide<input name="weightEn" required placeholder="Approx. 7–11 kg" /></label>
          <label>Lifespan guide<input name="lifespanEn" required placeholder="Approx. 12–15 years" /></label>
          <label>Traits<textarea name="traitsEn" required rows={4} placeholder="Alert, independent, active" /></label>
        </div></div>
      </div>
    </div></fieldset></fieldset>
    <button className="adminPetSave" disabled={!unlocked} type="button" onClick={() => setStatusOpen(true)}><Save aria-hidden="true" />{text.save}</button>
    {statusOpen ? <div className="adminAnimalStatusOverlay" role="presentation" onMouseDown={() => setStatusOpen(false)}><section aria-label={language === "ja" ? "公開状況を選択" : "Choose publishing status"} aria-modal="true" className="adminAnimalStatusDialog" role="dialog" onMouseDown={(event) => event.stopPropagation()}><h3>{language === "ja" ? "公開状況" : "Publishing status"}</h3><p>{language === "ja" ? "登録後の公開状況を選んでください。" : "Choose the status after registration."}</p><div><button type="button" onClick={() => submitWithStatus("published")}>{language === "ja" ? "公開" : "Publish"}</button><button type="button" onClick={() => submitWithStatus("draft")}>{language === "ja" ? "下書き" : "Draft"}</button></div><button className="adminAnimalStatusCancel" type="button" onClick={() => setStatusOpen(false)}>{language === "ja" ? "戻る" : "Back"}</button></section></div> : null}
  </form>;

  if (!modal) return form;

  return <>
    <button className="adminPetAdd" type="button" aria-label={language === "ja" ? "新規登録" : "New entry"} title={language === "ja" ? "新規登録" : "New entry"} onClick={() => setModalOpen(true)}><Plus aria-hidden="true" /></button>
    {modalOpen ? createPortal(<div className="adminAnimalModal" role="presentation" onMouseDown={() => setModalOpen(false)}>
      <section aria-label={language === "ja" ? "新規登録" : "New entry"} aria-modal="true" className="adminAnimalModalPanel" role="dialog" onMouseDown={(event) => event.stopPropagation()}>
        <header><h2>{language === "ja" ? "新規登録" : "New entry"}</h2><button type="button" aria-label={language === "ja" ? "閉じる" : "Close"} onClick={() => setModalOpen(false)}><X aria-hidden="true" /></button></header>
        {form}
      </section>
    </div>, document.body) : null}
  </>;
}

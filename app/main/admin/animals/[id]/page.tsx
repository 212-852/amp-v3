import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { identityDispatcher, resolveSessionCached, SESSION_COOKIE_NAME, type AnimalInput, type AnimalProfile, type AnimalStatus } from "@/lib/identity";
import { animalStatuses, isAnimalStatus, isEscapeRisk, slugify, splitCommaValues } from "@/lib/form";

const statuses: AnimalStatus[] = [...animalStatuses];

export default async function EditAnimalPage({ params }: PageProps<"/main/admin/animals/[id]">) {
  const { id } = await params;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await resolveSessionCached(token) : null;
  const animal = await identityDispatcher({ action: "get_animal", animalUuid: id });
  if (!animal) notFound();
  const preserved = { summary: animal.summary, transport: animal.transport, crateNote: animal.crateNote };
  const en = session?.language === "en";

  async function update(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const current = sessionToken ? await identityDispatcher({ action: "resolve_session", sessionToken }) : null;
    if (!current || current.role !== "admin") throw new Error("Forbidden");
    const value = (key: string) => String(formData.get(key) ?? "").trim();
    const status = value("status");
    const slug = slugify(value("nameEn"));
    if (!isAnimalStatus(status) || !slug || !value("nameJa") || !value("nameEn")) throw new Error("Invalid animal");
    const escapeRisk = value("escapeRisk");
    if (!isEscapeRisk(escapeRisk)) throw new Error("Invalid escape risk");
    const profile: AnimalProfile = { species: { ja: value("speciesJa"), en: value("speciesEn") }, scientificName: value("scientificName"), origin: { ja: value("originJa"), en: value("originEn") }, sizeClass: { ja: value("sizeJa"), en: value("sizeEn") }, weightGuide: { ja: value("weightJa"), en: value("weightEn") }, lifespanGuide: { ja: value("lifespanJa"), en: value("lifespanEn") }, traits: { ja: value("traitsJa"), en: value("traitsEn") }, brachycephalic: value("brachycephalic") === "yes", heatCaution: value("heatCaution") === "yes", escapeRisk, transportMethod: { ja: value("transportJa"), en: value("transportEn") }, kote: { ja: value("koteJa"), en: value("koteEn") } };
    const input: AnimalInput = { tags: splitCommaValues(value("tags")), status, slug, name: { ja: value("nameJa"), en: value("nameEn") }, aliases: { ja: splitCommaValues(value("aliasesJa")), en: splitCommaValues(value("aliasesEn")) }, summary: preserved.summary, transport: preserved.transport, crateNote: preserved.crateNote, profile };
    await identityDispatcher({ action: "update_animal", animalUuid: id, animal: input });
    redirect("/main/admin/animals");
  }

  const label = en ? { title: "Edit animal record", back: "Back", basic: "Basic information", details: "Public & transport information", save: "Save changes" } : { title: "動物データを編集", back: "一覧へ戻る", basic: "基本情報", details: "公開・輸送情報", save: "変更を保存" };
  return <section className="adminContentPage adminPetPage adminPetNew">
    <Link className="adminPetBack" href="/main/admin/animals"><ArrowLeft aria-hidden="true" />{label.back}</Link>
    <header className="adminContentHeading"><div><h1>{label.title}</h1><p>{animal.name.ja}</p></div></header>
    <form action={update} className="adminPetForm">
      <fieldset><legend>{label.basic}</legend><div className="adminPetFields">
        <label>名称（日本語）<input name="nameJa" required maxLength={80} defaultValue={animal.name.ja} /></label>
        <label>タグ<input name="tags" required defaultValue={animal.tags.join("、")} /></label><label>公開状態<select name="status" defaultValue={animal.status}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
        <label>学名<input name="scientificName" required defaultValue={animal.profile.scientificName} /></label>
        <label>短頭種<select name="brachycephalic" defaultValue={animal.profile.brachycephalic ? "yes" : "no"}><option value="no">いいえ</option><option value="yes">はい</option></select></label>
        <label>暑さ注意<select name="heatCaution" defaultValue={animal.profile.heatCaution ? "yes" : "no"}><option value="no">なし</option><option value="yes">あり</option></select></label>
        <label>脱走リスク<select name="escapeRisk" defaultValue={animal.profile.escapeRisk}><option value="low">低</option><option value="medium">中</option><option value="high">高</option></select></label>
      </div></fieldset>
      <fieldset><legend>{label.basic}</legend><div className="adminLanguageEditor">
        <input defaultChecked id="editAnimalLanguageJa" name="editorLanguage" type="radio" value="ja" /><input id="editAnimalLanguageEn" name="editorLanguage" type="radio" value="en" />
        <div className="adminLanguageTabs"><label htmlFor="editAnimalLanguageJa">日本語</label><label htmlFor="editAnimalLanguageEn">English</label></div>
        <div className="adminLanguagePanels">
          <div className="adminLanguagePanel adminLanguagePanel--ja"><div className="adminPetFields"><label>動物種<input name="speciesJa" required defaultValue={animal.profile.species.ja} /></label><label>別名（日本語）<input name="aliasesJa" defaultValue={animal.aliases.ja.join("、")} /></label><label>原産地<input name="originJa" required defaultValue={animal.profile.origin.ja} /></label><label>サイズ区分<input name="sizeJa" required defaultValue={animal.profile.sizeClass.ja} /></label><label>体重目安<input name="weightJa" required defaultValue={animal.profile.weightGuide.ja} /></label><label>寿命目安<input name="lifespanJa" required defaultValue={animal.profile.lifespanGuide.ja} /></label><label>特徴<textarea name="traitsJa" required rows={4} defaultValue={animal.profile.traits.ja} /></label><label>推奨輸送方法<input name="transportJa" required defaultValue={animal.profile.transportMethod.ja} /></label><label>コテ<input name="koteJa" defaultValue={animal.profile.kote.ja} /></label></div></div>
          <div className="adminLanguagePanel adminLanguagePanel--en"><div className="adminPetFields"><label>Name (English)<input name="nameEn" required maxLength={80} defaultValue={animal.name.en} /><small>URL用の名前は英名から小文字・ハイフン区切りで自動生成されます。</small></label><label>Animal type<input name="speciesEn" required defaultValue={animal.profile.species.en} /></label><label>Aliases (English)<input name="aliasesEn" defaultValue={animal.aliases.en.join(", ")} /></label><label>Origin<input name="originEn" required defaultValue={animal.profile.origin.en} /></label><label>Size class<input name="sizeEn" required defaultValue={animal.profile.sizeClass.en} /></label><label>Weight guide<input name="weightEn" required defaultValue={animal.profile.weightGuide.en} /></label><label>Lifespan guide<input name="lifespanEn" required defaultValue={animal.profile.lifespanGuide.en} /></label><label>Traits<textarea name="traitsEn" required rows={4} defaultValue={animal.profile.traits.en} /></label><label>Recommended transport<input name="transportEn" required defaultValue={animal.profile.transportMethod.en} /></label><label>Kote<input name="koteEn" defaultValue={animal.profile.kote.en} /></label></div></div>
        </div>
      </div></fieldset>
      <button className="adminPetSave" type="submit"><Save aria-hidden="true" />{label.save}</button>
    </form>
  </section>;
}

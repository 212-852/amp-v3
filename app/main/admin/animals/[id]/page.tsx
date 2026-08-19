import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { identityDispatcher, resolveSessionCached, SESSION_COOKIE_NAME, type AnimalInput, type AnimalProfile, type AnimalStatus } from "@/lib/identity";
import { animalSizeOptions, animalSource, animalSpeciesOptions, animalStatuses, animalWorldCountryOptions, isAnimalStatus, slugify, splitCommaValues } from "@/lib/form";

const statuses: AnimalStatus[] = [...animalStatuses];

export default async function EditAnimalPage({ params }: PageProps<"/main/admin/animals/[id]">) {
  const { id } = await params;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await resolveSessionCached(token) : null;
  const animal = await identityDispatcher({ action: "get_animal", animalUuid: id });
  if (!animal) notFound();
  const sourceRetrievedAt = animal.profile.source.retrievedAt;
  const countries = animalWorldCountryOptions();
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
    const profile: AnimalProfile = { species: { ja: value("speciesJa"), en: value("speciesEn") }, scientificName: value("scientificName"), origin: { ja: value("originJa"), en: value("originEn") }, sizeClass: { ja: value("sizeJa"), en: value("sizeEn") }, weightGuide: { ja: value("weightJa"), en: value("weightEn") }, lifespanGuide: { ja: value("lifespanJa"), en: value("lifespanEn") }, traits: { ja: value("traitsJa"), en: value("traitsEn") }, source: animalSource(value("sourceUrl"), sourceRetrievedAt) };
    const input: AnimalInput = { tags: splitCommaValues(value("tags")), status, slug, name: { ja: value("nameJa"), en: value("nameEn") }, aliases: { ja: splitCommaValues(value("aliasesJa")), en: splitCommaValues(value("aliasesEn")) }, profile };
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
        <label>学名<input name="scientificName" defaultValue={animal.profile.scientificName} /></label>
        <label>{en ? "Source URL" : "参照URL"}<input name="sourceUrl" type="url" defaultValue={animal.profile.source.url} /></label>
      </div></fieldset>
      <fieldset><legend>{label.basic}</legend><div className="adminLanguageEditor">
        <input defaultChecked id="editAnimalLanguageJa" name="editorLanguage" type="radio" value="ja" /><input id="editAnimalLanguageEn" name="editorLanguage" type="radio" value="en" />
        <div className="adminLanguageTabs"><label htmlFor="editAnimalLanguageJa">日本語</label><label htmlFor="editAnimalLanguageEn">English</label></div>
        <div className="adminLanguagePanels">
          <div className="adminLanguagePanel adminLanguagePanel--ja"><div className="adminPetFields"><label>動物種<select name="speciesJa" required defaultValue={animal.profile.species.ja}>{!animalSpeciesOptions.some((species) => species.ja === animal.profile.species.ja) && animal.profile.species.ja ? <option value={animal.profile.species.ja}>{animal.profile.species.ja}</option> : null}{animalSpeciesOptions.map((species) => <option key={species.ja} value={species.ja}>{species.ja}</option>)}</select></label><label>別名（日本語）<input name="aliasesJa" defaultValue={animal.aliases.ja.join("、")} /></label><label>原産国<select name="originJa" defaultValue={animal.profile.origin.ja}><option value="">選択してください</option>{!countries.some((country) => country.ja === animal.profile.origin.ja) && animal.profile.origin.ja ? <option value={animal.profile.origin.ja}>{animal.profile.origin.ja}</option> : null}{countries.map((country) => <option key={`${country.ja}-${country.en}`} value={country.ja}>{country.ja}</option>)}</select></label><label>サイズ区分<select name="sizeJa" defaultValue={animal.profile.sizeClass.ja}><option value="">選択してください</option>{!animalSizeOptions.some((size) => size.ja === animal.profile.sizeClass.ja) && animal.profile.sizeClass.ja ? <option value={animal.profile.sizeClass.ja}>{animal.profile.sizeClass.ja}</option> : null}{animalSizeOptions.map((size) => <option key={size.ja} value={size.ja}>{size.ja}</option>)}</select></label><label>体重目安<input name="weightJa" defaultValue={animal.profile.weightGuide.ja} /></label><label>寿命目安<input name="lifespanJa" defaultValue={animal.profile.lifespanGuide.ja} /></label><label>特徴<textarea name="traitsJa" rows={4} defaultValue={animal.profile.traits.ja} /></label></div></div>
          <div className="adminLanguagePanel adminLanguagePanel--en"><div className="adminPetFields"><label>Name (English)<input name="nameEn" required maxLength={80} defaultValue={animal.name.en} /><small>URL用の名前は英名から小文字・ハイフン区切りで自動生成されます。</small></label><label>Animal type<select name="speciesEn" required defaultValue={animal.profile.species.en}>{!animalSpeciesOptions.some((species) => species.en === animal.profile.species.en) && animal.profile.species.en ? <option value={animal.profile.species.en}>{animal.profile.species.en}</option> : null}{animalSpeciesOptions.map((species) => <option key={species.en} value={species.en}>{species.en}</option>)}</select></label><label>Aliases (English)<input name="aliasesEn" defaultValue={animal.aliases.en.join(", ")} /></label><label>Country of origin<select name="originEn" defaultValue={animal.profile.origin.en}><option value="">Select</option>{!countries.some((country) => country.en === animal.profile.origin.en) && animal.profile.origin.en ? <option value={animal.profile.origin.en}>{animal.profile.origin.en}</option> : null}{countries.map((country) => <option key={`${country.en}-${country.ja}`} value={country.en}>{country.en}</option>)}</select></label><label>Size class<select name="sizeEn" defaultValue={animal.profile.sizeClass.en}><option value="">Select</option>{!animalSizeOptions.some((size) => size.en === animal.profile.sizeClass.en) && animal.profile.sizeClass.en ? <option value={animal.profile.sizeClass.en}>{animal.profile.sizeClass.en}</option> : null}{animalSizeOptions.map((size) => <option key={size.en} value={size.en}>{size.en}</option>)}</select></label><label>Weight guide<input name="weightEn" defaultValue={animal.profile.weightGuide.en} /></label><label>Lifespan guide<input name="lifespanEn" defaultValue={animal.profile.lifespanGuide.en} /></label><label>Traits<textarea name="traitsEn" rows={4} defaultValue={animal.profile.traits.en} /></label></div></div>
        </div>
      </div></fieldset>
      <button className="adminPetSave" type="submit"><Save aria-hidden="true" />{label.save}</button>
    </form>
  </section>;
}

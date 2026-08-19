import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { identityDispatcher, SESSION_COOKIE_NAME, type AnimalInput, type AnimalStatus } from "@/lib/identity";

const statuses: AnimalStatus[] = ["draft", "published", "archived"];
const split = (value: string) => value.split(/[,、]/).map((item) => item.trim()).filter(Boolean).slice(0, 20);

export default async function EditAnimalPage({ params }: PageProps<"/main/admin/animals/[id]">) {
  const { id } = await params;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await identityDispatcher({ action: "resolve_session", sessionToken: token }) : null;
  const animal = await identityDispatcher({ action: "get_animal", animalUuid: id });
  if (!animal) notFound();
  const en = session?.language === "en";

  async function update(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const current = sessionToken ? await identityDispatcher({ action: "resolve_session", sessionToken }) : null;
    if (!current || current.role !== "admin") throw new Error("Forbidden");
    const value = (key: string) => String(formData.get(key) ?? "").trim();
    const status = value("status") as AnimalStatus;
    const slug = value("slug").toLowerCase();
    if (!statuses.includes(status) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !value("nameJa")) throw new Error("Invalid animal");
    const input: AnimalInput = { tags: split(value("tags")), status, slug, name: { ja: value("nameJa"), en: value("nameEn") }, aliases: { ja: split(value("aliasesJa")), en: split(value("aliasesEn")) }, summary: { ja: value("summaryJa"), en: value("summaryEn") }, transport: { ja: value("transportJa"), en: value("transportEn") }, crateNote: { ja: value("crateJa"), en: value("crateEn") }, imageUrl: value("image") || null };
    await identityDispatcher({ action: "update_animal", animalUuid: id, animal: input });
    redirect("/main/admin/animals");
  }

  const label = en ? { title: "Edit animal record", back: "Back", basic: "Basic information", details: "Public & transport information", save: "Save changes" } : { title: "動物データを編集", back: "一覧へ戻る", basic: "基本情報", details: "公開・輸送情報", save: "変更を保存" };
  return <section className="adminContentPage adminPetPage adminPetNew">
    <Link className="adminPetBack" href="/main/admin/animals"><ArrowLeft aria-hidden="true" />{label.back}</Link>
    <header className="adminContentHeading"><div><h1>{label.title}</h1><p>{animal.name.ja}</p></div></header>
    <form action={update} className="adminPetForm">
      <fieldset><legend>{label.basic}</legend><div className="adminPetFields">
        <label>名称（日本語）<input name="nameJa" required maxLength={80} defaultValue={animal.name.ja} /></label><label>Name (English)<input name="nameEn" maxLength={80} defaultValue={animal.name.en} /></label>
        <label>タグ<input name="tags" required defaultValue={animal.tags.join("、")} /></label><label>URL slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={animal.slug} /></label>
        <label>別名（日本語）<input name="aliasesJa" defaultValue={animal.aliases.ja.join("、")} /></label><label>Aliases (English)<input name="aliasesEn" defaultValue={animal.aliases.en.join(", ")} /></label>
      </div></fieldset>
      <fieldset><legend>{label.details}</legend><div className="adminPetFields">
        <label>特徴（日本語）<textarea name="summaryJa" rows={4} defaultValue={animal.summary.ja} /></label><label>Profile (English)<textarea name="summaryEn" rows={4} defaultValue={animal.summary.en} /></label>
        <label>輸送条件（日本語）<textarea name="transportJa" rows={4} defaultValue={animal.transport.ja} /></label><label>Transport (English)<textarea name="transportEn" rows={4} defaultValue={animal.transport.en} /></label>
        <label>クレート目安（日本語）<textarea name="crateJa" rows={4} defaultValue={animal.crateNote.ja} /></label><label>Crate guidance (English)<textarea name="crateEn" rows={4} defaultValue={animal.crateNote.en} /></label>
        <label>代表画像URL<input name="image" type="url" defaultValue={animal.imageUrl ?? ""} /></label><label>公開状態<select name="status" defaultValue={animal.status}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
      </div></fieldset>
      <button className="adminPetSave" type="submit"><Save aria-hidden="true" />{label.save}</button>
    </form>
  </section>;
}

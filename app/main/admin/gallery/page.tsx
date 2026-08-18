import { ImageUp, Images, Upload } from "lucide-react";
import { cookies } from "next/headers";

import { identityDispatcher, SESSION_COOKIE_NAME } from "@/lib/identity";

const copy = {
  ja: {
    title: "写真アップロード",
    description: "共通ギャラリーへ写真を追加し、掲載するサービスを管理します。",
    upload: "写真を選択",
    help: "JPEG・PNG・WebP形式の写真を選択できます。",
    gallery: "アップロード済みの写真",
    empty: "アップロードされた写真はまだありません。",
  },
  en: {
    title: "Photo upload",
    description: "Add photos to the shared gallery and manage where they appear.",
    upload: "Choose photos",
    help: "JPEG, PNG, and WebP images are supported.",
    gallery: "Uploaded photos",
    empty: "No photos have been uploaded yet.",
  },
} as const;

export const metadata = { title: "写真アップロード | Admin" };

export default async function GalleryPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionToken
    ? await identityDispatcher({ action: "resolve_session", sessionToken })
    : null;
  const text = copy[session?.language === "en" ? "en" : "ja"];

  return (
    <section className="adminContentPage">
      <header className="adminContentHeading">
        <div><h1>{text.title}</h1><p>{text.description}</p></div>
      </header>
      <label className="adminGalleryUpload">
        <ImageUp aria-hidden="true" />
        <strong>{text.upload}</strong>
        <span>{text.help}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple />
      </label>
      <h2 className="adminGalleryTitle"><Images aria-hidden="true" />{text.gallery}</h2>
      <div className="adminContentEmpty"><Upload aria-hidden="true" /><p>{text.empty}</p></div>
    </section>
  );
}

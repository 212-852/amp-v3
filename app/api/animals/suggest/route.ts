import { cookies } from "next/headers";

import { debugDispatcher } from "@/lib/debug";
import { identityDispatcher, SESSION_COOKIE_NAME } from "@/lib/identity";

type WikiPage = {
  title?: string;
  extract?: string;
  description?: string;
  thumbnail?: { source?: string };
  original?: { source?: string };
  categories?: Array<{ title?: string }>;
  langlinks?: Array<{ title?: string }>;
  fullurl?: string;
};

type WikiResponse = {
  query?: { pages?: WikiPage[] };
};

const headers = {
  Accept: "application/json",
  "User-Agent": "WanDaNya-AnimalDatabase/1.0 (mail@wan.da-nya.com)",
};

async function getJapanesePage(name: string) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: name,
    gsrnamespace: "0",
    gsrlimit: "1",
    prop: "pageterms|categories|langlinks|info",
    wbptterms: "description",
    cllimit: "20",
    clshow: "!hidden",
    lllang: "en",
    lllimit: "1",
    inprop: "url",
    redirects: "1",
    format: "json",
    formatversion: "2",
  });
  const response = await fetch(`https://ja.wikipedia.org/w/api.php?${params}`, { headers, signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error("Wikipedia request failed");
  const result = await response.json() as WikiResponse;
  return result.query?.pages?.[0] ?? null;
}

async function getEnglishPage(title: string) {
  const params = new URLSearchParams({
    action: "query",
    titles: title,
    prop: "info",
    inprop: "url",
    redirects: "1",
    format: "json",
    formatversion: "2",
  });
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers, signal: AbortSignal.timeout(8_000) });
  if (!response.ok) return null;
  const result = await response.json() as WikiResponse;
  return result.query?.pages?.[0] ?? null;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionToken ? await identityDispatcher({ action: "resolve_session", sessionToken }) : null;
  if (!session || session.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : "";
  if (!name) return Response.json({ error: "名称を入力してください。" }, { status: 400 });

  try {
    const ja = await getJapanesePage(name);
    if (!ja?.title) {
      await debugDispatcher({
        level: "warn",
        event: "animal_wikipedia_not_found",
        data: { name, source: "Wikipedia API", ai: false, code: "WIKIPEDIA_NOT_FOUND" },
      });
      return Response.json({ error: "Wikipediaに一致する情報が見つかりませんでした。" }, { status: 404 });
    }
    const enTitle = ja.langlinks?.[0]?.title ?? "";
    const en = enTitle ? await getEnglishPage(enTitle) : null;
    const categoryTags = (ja.categories ?? [])
      .map((category) => category.title?.replace(/^カテゴリ:/, "").trim() ?? "")
      .filter((category) => category && !/記事|出典|識別子|プロジェクト|テンプレート/.test(category));
    const categoryText = categoryTags.join(" ");
    const originJa = categoryTags.map((tag) => tag.match(/^(.+?)原産の(?:犬|猫)/)?.[1] ?? "").find(Boolean) ?? "";
    const sizeJa = ["超大型", "超小型", "大型", "中型", "小型"].find((size) => categoryText.includes(`${size}犬`) || categoryText.includes(`${size}猫`)) ?? "";
    const speciesTag = /犬種|犬の品種|原産の犬/.test(categoryText) ? "犬" : /猫種|猫の品種|原産の猫/.test(categoryText) ? "猫" : "";
    const tags = Array.from(new Set([speciesTag, originJa ? `${originJa}原産` : "", sizeJa, ...categoryTags].filter(Boolean))).slice(0, 10);

    const suggestion = {
        nameJa: ja.title,
        nameEn: en?.title ?? enTitle,
        tags,
        aliasesJa: ja.title === name ? [] : [name],
        aliasesEn: [],
        originJa,
        sizeJa,
        sourceUrl: ja.fullurl ?? `https://ja.wikipedia.org/wiki/${encodeURIComponent(ja.title)}`,
    };
    const autoFilled = [
      suggestion.nameEn && "nameEn",
      suggestion.tags.length > 0 && "tags",
      suggestion.originJa && "origin",
      suggestion.sizeJa && "size",
    ].filter(Boolean);
    await debugDispatcher({
      event: "animal_wikipedia_fetch_succeeded",
      data: {
        name,
        source: "Wikipedia API",
        ai: false,
        code: "WIKIPEDIA_OK",
        autoFilled,
        missing: ["scientificName", "weight", "lifespan", "traits"],
        sourceUrl: suggestion.sourceUrl,
      },
    });
    return Response.json({ suggestion });
  } catch (error) {
    await debugDispatcher({
      level: "error",
      event: "animal_wikipedia_fetch_failed",
      data: {
        name,
        source: "Wikipedia API",
        ai: false,
        code: "WIKIPEDIA_REQUEST_FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    return Response.json({ error: "Wikipediaから情報を取得できませんでした。時間をおいて再度お試しください。" }, { status: 502 });
  }
}

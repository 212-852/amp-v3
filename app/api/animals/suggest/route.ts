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
  revisions?: Array<{ slots?: { main?: { content?: string } } }>;
};

type WikiResponse = {
  query?: { pages?: WikiPage[] };
};

type AnimalSuggestion = {
  nameJa: string;
  nameEn: string;
  tags: string[];
  aliasesJa: string[];
  aliasesEn: string[];
  speciesJa: string;
  speciesEn: string;
  scientificName: string;
  originJa: string;
  originEn: string;
  sizeJa: string;
  sizeEn: string;
  weightJa: string;
  weightEn: string;
  lifespanJa: string;
  lifespanEn: string;
  traitsJa: string;
  traitsEn: string;
  sourceUrl: string;
};

type OpenAIResponse = {
  error?: { code?: string; message?: string; param?: string; type?: string };
  model?: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
};

type GeminiResponse = {
  error?: { code?: number; details?: Array<Record<string, unknown>>; message?: string; status?: string };
  modelVersion?: string;
  responseId?: string;
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

const animalSchema = {
  type: "object",
  properties: {
    nameJa: { type: "string" }, nameEn: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    aliasesJa: { type: "array", items: { type: "string" } }, aliasesEn: { type: "array", items: { type: "string" } },
    speciesJa: { type: "string", enum: ["犬", "猫", ""] }, speciesEn: { type: "string", enum: ["Dog", "Cat", ""] },
    scientificName: { type: "string" }, originJa: { type: "string" }, originEn: { type: "string" },
    sizeJa: { type: "string", enum: ["超小型", "小型", "中型", "大型", "超大型", ""] },
    sizeEn: { type: "string", enum: ["Toy", "Small", "Medium", "Large", "Giant", ""] },
    weightJa: { type: "string" }, weightEn: { type: "string" }, lifespanJa: { type: "string" }, lifespanEn: { type: "string" },
    traitsJa: { type: "string" }, traitsEn: { type: "string" },
  },
  required: ["nameJa", "nameEn", "tags", "aliasesJa", "aliasesEn", "speciesJa", "speciesEn", "scientificName", "originJa", "originEn", "sizeJa", "sizeEn", "weightJa", "weightEn", "lifespanJa", "lifespanEn", "traitsJa", "traitsEn"],
  additionalProperties: false,
} as const;

const headers = {
  Accept: "application/json",
  "User-Agent": "WanDaNya-AnimalDatabase/1.0 (mail@wan.da-nya.com)",
};

function wikiEvidence(page: WikiPage | null) {
  if (!page) return null;
  return {
    title: page.title ?? "",
    description: page.description ?? "",
    extract: page.extract ?? "",
    categories: (page.categories ?? []).map((category) => category.title ?? "").filter(Boolean),
    sourceText: page.revisions?.[0]?.slots?.main?.content?.slice(0, 24_000) ?? "",
    sourceUrl: page.fullurl ?? "",
  };
}

function animalPageScore(page: WikiPage, searchedName: string) {
  const title = page.title ?? "";
  const description = page.description ?? "";
  const categories = (page.categories ?? []).map((category) => category.title ?? "").join(" ");
  const text = `${title} ${description} ${categories}`;
  if (/曖昧さ回避/.test(text)) return -100;
  let score = title === searchedName ? 1 : 0;
  if (/[（(](?:犬種|猫種)[）)]/.test(title)) score += 20;
  if (/(?:犬|猫)の品種|犬種|猫種|原産の(?:犬|猫)/.test(text)) score += 10;
  return score;
}

async function getJapanesePage(name: string) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: name,
    gsrnamespace: "0",
    gsrlimit: "5",
    prop: "pageterms|categories|langlinks|info|extracts|revisions",
    wbptterms: "description",
    cllimit: "20",
    clshow: "!hidden",
    lllang: "en",
    lllimit: "1",
    inprop: "url",
    explaintext: "1",
    exintro: "1",
    rvprop: "content",
    rvslots: "main",
    redirects: "1",
    format: "json",
    formatversion: "2",
  });
  const response = await fetch(`https://ja.wikipedia.org/w/api.php?${params}`, { headers, signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error("Wikipedia request failed");
  const result = await response.json() as WikiResponse;
  return [...(result.query?.pages ?? [])].sort((left, right) => animalPageScore(right, name) - animalPageScore(left, name))[0] ?? null;
}

function outputText(result: OpenAIResponse) {
  return result.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text ?? "";
}

async function enrichWithGemini(name: string, page: WikiPage, englishPage: WikiPage | null, fallback: AnimalSuggestion, fallbackReason: string): Promise<AnimalSuggestion> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.7-flash";
  if (!apiKey) {
    await debugDispatcher({
      level: "error",
      event: "animal_gemini_configuration_missing",
      data: { name, model, fallbackReason, httpStatus: null, providerCode: "GEMINI_CONFIG_MISSING", requestId: null, message: "GEMINI_API_KEY is not configured" },
    });
    return fallback;
  }

  let response: Response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You extract verified animal breed data from the supplied Wikipedia evidence. Return Japanese and English values. Do not guess unsupported facts; use an empty string when evidence is insufficient. Tags must be short reusable labels without category prefixes." }] },
        contents: [{ parts: [{ text: JSON.stringify({ searchedName: name, japaneseWikipedia: wikiEvidence(page), englishWikipedia: wikiEvidence(englishPage), fallback }) }] }],
        generationConfig: { responseFormat: { text: { mimeType: "application/json", schema: animalSchema } } },
      }),
      signal: AbortSignal.timeout(25_000),
    });
  } catch (error) {
    await debugDispatcher({
      level: "error",
      event: "animal_gemini_request_failed",
      data: { name, model, fallbackReason, httpStatus: null, providerCode: error instanceof DOMException && error.name === "TimeoutError" ? "GEMINI_TIMEOUT" : "GEMINI_NETWORK_ERROR", requestId: null, message: error instanceof Error ? error.message : "Unknown error" },
    });
    return fallback;
  }

  const result = await response.json().catch(() => ({})) as GeminiResponse;
  const requestId = response.headers.get("x-request-id") ?? response.headers.get("x-goog-request-id") ?? result.responseId ?? null;
  if (!response.ok) {
    await debugDispatcher({
      level: "error",
      event: "animal_gemini_response_error",
      data: { name, model, fallbackReason, httpStatus: response.status, providerCode: result.error?.status ?? `HTTP_${response.status}`, providerNumericCode: result.error?.code ?? null, providerDetails: result.error?.details ?? null, requestId, message: result.error?.message ?? response.statusText },
    });
    return fallback;
  }

  try {
    const text = result.candidates?.[0]?.content?.parts?.find((part) => typeof part.text === "string")?.text ?? "";
    const parsed = JSON.parse(text) as Omit<AnimalSuggestion, "sourceUrl">;
    const suggestion = { ...fallback, ...parsed, sourceUrl: fallback.sourceUrl };
    return suggestion;
  } catch (error) {
    await debugDispatcher({
      level: "error",
      event: "animal_gemini_parse_failed",
      data: { name, model: result.modelVersion ?? model, fallbackReason, httpStatus: response.status, providerCode: "GEMINI_OUTPUT_PARSE_FAILED", requestId, message: error instanceof Error ? error.message : "Unknown error" },
    });
    return fallback;
  }
}

async function enrichWithAI(name: string, page: WikiPage, englishPage: WikiPage | null, fallback: AnimalSuggestion): Promise<AnimalSuggestion> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";
  if (!apiKey) {
    await debugDispatcher({
      level: "error",
      event: "animal_ai_configuration_missing",
      data: { name, model, httpStatus: null, providerCode: "AI_CONFIG_MISSING", requestId: null, message: "OPENAI_API_KEY is not configured" },
    });
    return enrichWithGemini(name, page, englishPage, fallback, "AI_CONFIG_MISSING");
  }

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        reasoning: { effort: "low" },
        input: [
          { role: "system", content: "You extract verified animal breed data from the supplied Wikipedia evidence. Return Japanese and English values. Do not guess unsupported facts; use an empty string when evidence is insufficient. Tags must be short reusable labels without category prefixes." },
          { role: "user", content: JSON.stringify({ searchedName: name, japaneseWikipedia: wikiEvidence(page), englishWikipedia: wikiEvidence(englishPage), fallback }) },
        ],
        text: { format: { type: "json_schema", name: "animal_profile", strict: true, schema: animalSchema } },
      }),
      signal: AbortSignal.timeout(25_000),
    });
  } catch (error) {
    await debugDispatcher({
      level: "error",
      event: "animal_ai_request_failed",
      data: { name, model, httpStatus: null, providerCode: error instanceof DOMException && error.name === "TimeoutError" ? "AI_TIMEOUT" : "AI_NETWORK_ERROR", requestId: null, message: error instanceof Error ? error.message : "Unknown error" },
    });
    return enrichWithGemini(name, page, englishPage, fallback, error instanceof DOMException && error.name === "TimeoutError" ? "AI_TIMEOUT" : "AI_NETWORK_ERROR");
  }

  const requestId = response.headers.get("x-request-id");
  const result = await response.json().catch(() => ({})) as OpenAIResponse;
  if (!response.ok) {
    await debugDispatcher({
      level: "error",
      event: "animal_ai_response_error",
      data: { name, model, httpStatus: response.status, providerCode: result.error?.code ?? `HTTP_${response.status}`, providerType: result.error?.type ?? null, providerParam: result.error?.param ?? null, requestId, message: result.error?.message ?? response.statusText },
    });
    return enrichWithGemini(name, page, englishPage, fallback, result.error?.code ?? `OPENAI_HTTP_${response.status}`);
  }

  try {
    const parsed = JSON.parse(outputText(result)) as Omit<AnimalSuggestion, "sourceUrl">;
    const suggestion = { ...fallback, ...parsed, sourceUrl: fallback.sourceUrl };
    return suggestion;
  } catch (error) {
    await debugDispatcher({
      level: "error",
      event: "animal_ai_parse_failed",
      data: { name, model: result.model ?? model, httpStatus: response.status, providerCode: "AI_OUTPUT_PARSE_FAILED", requestId, message: error instanceof Error ? error.message : "Unknown error" },
    });
    return enrichWithGemini(name, page, englishPage, fallback, "AI_OUTPUT_PARSE_FAILED");
  }
}

async function getEnglishPage(title: string) {
  const params = new URLSearchParams({
    action: "query",
    titles: title,
    prop: "pageterms|categories|info|extracts|revisions",
    wbptterms: "description",
    cllimit: "20",
    clshow: "!hidden",
    inprop: "url",
    explaintext: "1",
    exintro: "1",
    rvprop: "content",
    rvslots: "main",
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

    const fallback: AnimalSuggestion = {
        nameJa: ja.title,
        nameEn: en?.title ?? enTitle,
        tags,
        aliasesJa: ja.title === name ? [] : [name],
        aliasesEn: [],
        speciesJa: speciesTag,
        speciesEn: speciesTag === "犬" ? "Dog" : speciesTag === "猫" ? "Cat" : "",
        scientificName: "",
        originJa,
        originEn: "",
        sizeJa,
        sizeEn: "",
        weightJa: "",
        weightEn: "",
        lifespanJa: "",
        lifespanEn: "",
        traitsJa: "",
        traitsEn: "",
        sourceUrl: ja.fullurl ?? `https://ja.wikipedia.org/wiki/${encodeURIComponent(ja.title)}`,
    };
    const suggestion = await enrichWithAI(name, ja, en, fallback);
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

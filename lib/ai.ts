import "server-only";

type OpenAIResponse = {
  error?: { code?: string; message?: string };
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

type GeminiResponse = {
  error?: { message?: string; status?: string };
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

type JsonSchema = Record<string, unknown>;

async function requestOpenAI<T>(name: string, schema: JsonSchema, system: string, input: unknown): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      input: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(input) },
      ],
      text: { format: { type: "json_schema", name, strict: true, schema } },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json().catch(() => ({})) as OpenAIResponse;
  if (!response.ok) throw new Error(result.error?.message || `OpenAI request failed (${response.status})`);
  const text = result.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
  if (!text) throw new Error("OpenAI returned no structured output");
  return JSON.parse(text) as T;
}

async function requestGemini<T>(schema: JsonSchema, system: string, input: unknown): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  const model = process.env.GEMINI_MODEL || "gemini-3.7-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: JSON.stringify(input) }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: schema },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json().catch(() => ({})) as GeminiResponse;
  if (!response.ok) throw new Error(result.error?.message || `Gemini request failed (${response.status})`);
  const text = result.candidates?.[0]?.content?.parts?.find((part) => typeof part.text === "string")?.text;
  if (!text) throw new Error("Gemini returned no structured output");
  return JSON.parse(text) as T;
}

async function requestStructured<T>(name: string, schema: JsonSchema, system: string, input: unknown): Promise<T> {
  try {
    return await requestOpenAI<T>(name, schema, system, input);
  } catch (openAIError) {
    try {
      return await requestGemini<T>(schema, system, input);
    } catch (geminiError) {
      const first = openAIError instanceof Error ? openAIError.message : "OpenAI failed";
      const second = geminiError instanceof Error ? geminiError.message : "Gemini failed";
      throw new Error(`${first}; ${second}`);
    }
  }
}

export type OrderSuggestion = {
  title: string;
  businessUnit: "pawsflight" | "wandanya" | "airport" | "tokyo";
  workType: "transport" | "charter" | "airport_shuttle" | "air_transport" | "quarantine" | "other";
  scheduledAt: string;
  notes: string;
};

const orderSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    businessUnit: { type: "string", enum: ["pawsflight", "wandanya", "airport", "tokyo"] },
    workType: { type: "string", enum: ["transport", "charter", "airport_shuttle", "air_transport", "quarantine", "other"] },
    scheduledAt: { type: "string" },
    notes: { type: "string" },
  },
  required: ["title", "businessUnit", "workType", "scheduledAt", "notes"],
  additionalProperties: false,
};

export async function suggestOrder(input: {
  subject: string;
  body: string;
  senderName: string;
  senderAddress: string;
  mailboxAddress: string;
  receivedAt: string;
  language: "ja" | "en";
}) {
  return requestStructured<OrderSuggestion>(
    "message_order",
    orderSchema,
    "Read the customer message and draft an order for a pet transport company. Return content in the requested display language. Never invent dates, locations, or requirements. If no exact date/time is stated, scheduledAt must be an empty string. PawsFlight is international pet air transport and quarantine support. WanDaNya is general transport and charter. AirPort is airport shuttle. Tokyo is the Tokyo operation. Keep title short and notes factual.",
    { ...input, body: input.body.slice(0, 16_000), currentDatetime: new Date().toISOString() },
  );
}

const translationSchema = {
  type: "object",
  properties: { translatedText: { type: "string" } },
  required: ["translatedText"],
  additionalProperties: false,
};

export async function translateMessage(text: string, targetLanguage: "ja" | "en") {
  const result = await requestStructured<{ translatedText: string }>(
    "message_translation",
    translationSchema,
    "Translate the supplied message faithfully. Preserve names, dates, URLs, email addresses, paragraph breaks, quotations, and operational details. Do not summarize or add commentary.",
    { targetLanguage, text: text.slice(0, 30_000) },
  );
  return result.translatedText;
}

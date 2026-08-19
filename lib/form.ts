import type { CountriesConfig } from "@/lib/content";

export const animalStatuses = ["draft", "published", "archived"] as const;
export const animalSizeOptions = [
  { ja: "超小型", en: "Toy" },
  { ja: "小型", en: "Small" },
  { ja: "中型", en: "Medium" },
  { ja: "大型", en: "Large" },
  { ja: "超大型", en: "Giant" },
] as const;

export const animalSpeciesOptions = [
  { ja: "犬", en: "Dog" },
  { ja: "猫", en: "Cat" },
] as const;

const worldCountryCodes = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(" ");

export function animalWorldCountryOptions() {
  const japanese = new Intl.DisplayNames(["ja"], { type: "region" });
  const english = new Intl.DisplayNames(["en"], { type: "region" });
  return worldCountryCodes
    .map((code) => ({ code, ja: japanese.of(code) ?? code, en: english.of(code) ?? code }))
    .sort((left, right) => left.ja.localeCompare(right.ja, "ja"));
}

function normalizeOption(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/(?:原産|originating in|country of origin)/g, "").replace(/[^\p{L}\p{N}]/gu, "");
}

export function matchAnimalOption<T extends { ja: string; en: string }>(options: readonly T[], ja: string, en: string) {
  const candidates = [normalizeOption(ja), normalizeOption(en)].filter(Boolean);
  return options.find((option) => {
    const values = [normalizeOption(option.ja), normalizeOption(option.en)].filter(Boolean);
    return candidates.some((candidate) => values.some((value) => candidate === value || (value.length >= 2 && candidate.includes(value))));
  });
}

export function animalCountryOptions(countries: CountriesConfig) {
  const options = countries
    .map((country) => ({ ja: country.name.ja.trim(), en: country.name.en.trim() }))
    .filter((country) => country.ja && country.en);
  if (!options.some((country) => country.en.toLocaleLowerCase() === "japan")) options.unshift({ ja: "日本", en: "Japan" });
  return options;
}

export function normalizeComma(value: string) {
  return value
    .replace(/[、，]/g, ",")
    .replace(/\s*,\s*/g, ", ")
    .replace(/(?:,\s*){2,}/g, ", ");
}

export function splitCommaValues(value: string, limit = 20) {
  return Array.from(
    new Map(
      normalizeComma(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => [item.toLocaleLowerCase(), item]),
    ).values(),
  ).slice(0, limit);
}

export function normalizeTagInput(value: string, existingTags: readonly string[] = []) {
  const existing = new Map(existingTags.map((tag) => [tag.toLocaleLowerCase(), tag]));
  return splitCommaValues(value)
    .map((tag) => existing.get(tag.toLocaleLowerCase()) ?? tag)
    .join(", ");
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function animalSource(url: string, retrievedAt = "") {
  let normalizedUrl = "";
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === "https:" && /(^|\.)wikipedia\.org$/i.test(parsed.hostname)) normalizedUrl = parsed.toString();
  } catch {
    normalizedUrl = "";
  }
  const now = new Date().toISOString();
  return { provider: normalizedUrl ? "Wikipedia" : "", url: normalizedUrl, retrievedAt: retrievedAt || (normalizedUrl ? now : ""), checkedAt: normalizedUrl ? now : "" };
}

export function isAnimalStatus(value: string): value is (typeof animalStatuses)[number] {
  return animalStatuses.some((status) => status === value);
}

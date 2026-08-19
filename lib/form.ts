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

export function isAnimalStatus(value: string): value is (typeof animalStatuses)[number] {
  return animalStatuses.some((status) => status === value);
}

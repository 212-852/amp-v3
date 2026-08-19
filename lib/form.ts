export const animalStatuses = ["draft", "published", "archived"] as const;
export const escapeRisks = ["low", "medium", "high"] as const;

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

export function isEscapeRisk(value: string): value is (typeof escapeRisks)[number] {
  return escapeRisks.some((risk) => risk === value);
}

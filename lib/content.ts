export const content = {
  company: {
    name: "Wan Da Nya Inc.",
    address: "",
  },
} as const;

export function getCopyright() {
  return `© ${new Date().getFullYear()} ${content.company.name}`;
}

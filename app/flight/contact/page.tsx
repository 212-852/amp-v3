import type { Metadata } from "next";

import DirectionPage from "../[direction]/page";

export const metadata: Metadata = {
  title: "無料相談・お見積もり | PawsFlight Japan",
  description: "PawsFlight Japanの国際ペット輸送に関する無料相談・概算お見積もりフォームです。",
  icons: { icon: [{ url: "/icons/paws_icon.svg", sizes: "any", type: "image/svg+xml" }] },
};

export default async function FlightContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const direction = query.direction === "inbound" ? "inbound" : "outbound";

  return DirectionPage({
    params: Promise.resolve({ direction }),
    searchParams: Promise.resolve({ ...query, standalone: "1" }),
  });
}

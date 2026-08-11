import type { Metadata, Viewport } from "next";
import { Geist_Mono, Hachi_Maru_Pop, Klee_One } from "next/font/google";
import "./globals.css";

const kleeOne = Klee_One({
  variable: "--font-klee-one",
  weight: ["400", "600"],
  display: "swap",
  preload: false,
});

const hachiMaruPop = Hachi_Maru_Pop({
  variable: "--font-hachi-maru-pop",
  weight: "400",
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PET TAXI",
  description: "PET TAXI Web App",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${kleeOne.variable} ${hachiMaruPop.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import {
  Geist_Mono,
  Hachi_Maru_Pop,
  Klee_One,
  M_PLUS_Rounded_1c,
  Zen_Maru_Gothic,
} from "next/font/google";
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

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru-gothic",
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

const mPlusRounded = M_PLUS_Rounded_1c({
  variable: "--font-m-plus-rounded",
  weight: ["400", "500", "700"],
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
  applicationName: "PET TAXI",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PET TAXI",
  },
  icons: {
    icon: [
      {
        url: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        url: "/icons/icon_192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon_512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/apple_icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#ead7c0",
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
      className={`${kleeOne.variable} ${hachiMaruPop.variable} ${zenMaruGothic.variable} ${mPlusRounded.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Space_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio - BOLD",
    template: "%s | Portfolio - BOLD",
  },
  description: "クリエイター向けポートフォリオサイト。作品ギャラリー、ブログ、プロフィールを掲載。",
  keywords: ["ポートフォリオ", "デザイナー", "クリエイター", "作品集"],
  authors: [{ name: "YAMADA TARO" }],
  creator: "YAMADA TARO",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://example.com",
    siteName: "Portfolio - BOLD",
    title: "Portfolio - BOLD",
    description: "クリエイター向けポートフォリオサイト",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Portfolio - BOLD",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio - BOLD",
    description: "クリエイター向けポートフォリオサイト",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${spaceMono.variable} ${notoSansJP.variable} antialiased`}
      >
        {/* 画面外枠の装飾（PCのみ） */}
        <div className="page-frame" />
        {children}
      </body>
    </html>
  );
}

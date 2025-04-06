import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageContainer } from "@/components/layout/page-container";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LunchNow - 慶應日吉キャンパスのランチアプリ",
  description: "慶應日吉キャンパスで、ランチ相手を”その場で”見つける",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} antialiased`}>
        <PageContainer>
          {children}
        </PageContainer>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

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
  description: "慶應日吉キャンパスで、ランチ相手を\"その場で\"見つける",
};

const MAINTENANCE_MESSAGE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
  ? `申し訳ありません。
4/12(土)、4/13(日)はアプリのメンテナンスを実施いたします。`
  : null;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} antialiased`}>
        <PageContainer>
          {MAINTENANCE_MESSAGE ? (
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
              <p className="text-xl font-semibold whitespace-pre-line">{MAINTENANCE_MESSAGE}</p>
            </div>
          ) : (
            children
          )}
        </PageContainer>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

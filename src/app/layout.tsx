import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageContainer } from "@/components/layout/page-container";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LunchNow - 慶應日吉キャンパスのランチマッチングアプリ",
  description: "慶應大学日吉キャンパスで「今すぐランチ」をする相手を即座に見つけ、最小限の設定でシームレスにマッチングできるアプリ",
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
      </body>
    </html>
  );
}

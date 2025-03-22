import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PageContainer } from "@/components/ui/page-container";
import { Providers } from "./_providers";

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
        <Providers>
          <PageContainer>{children}</PageContainer>
        </Providers>
      </body>
    </html>
  );
}

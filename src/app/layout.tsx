import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageContainer } from "@/components/layout/page-container";
import { Footer } from "@/components/layout/footer";

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
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <PageContainer>
          <div className="flex flex-col min-h-[calc(100vh-2rem)]">
            {children}
            <Footer />
          </div>
        </PageContainer>
      </body>
    </html>
  );
}

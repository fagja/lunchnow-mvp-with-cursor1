"use client";

import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * ページ全体のコンテナコンポーネント
 * すべてのページを包むレイアウトコンポーネント
 */
export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-screen-lg mx-auto px-4 py-6 sm:px-6 md:px-8">
        {children}
      </main>
    </div>
  );
}
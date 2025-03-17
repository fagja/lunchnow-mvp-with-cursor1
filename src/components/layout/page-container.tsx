import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * 全ページ共通のコンテナコンポーネント
 * 一貫したパディングとマージンを適用します
 */
export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="mx-auto max-w-md w-full px-4 pb-6 pt-2 min-h-[calc(100vh-2rem)]">
      {children}
    </div>
  );
}
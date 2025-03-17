import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * 全ページ共通のコンテナコンポーネント
 * 一貫したパディングとマージンを適用します
 * レスポンシブ対応済み
 */
export function PageContainer({
  children,
  className,
  fullWidth = false
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 pb-6 pt-2 min-h-[calc(100vh-2rem)]",
        !fullWidth && "max-w-md sm:max-w-lg md:max-w-xl",
        "sm:px-6 md:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}

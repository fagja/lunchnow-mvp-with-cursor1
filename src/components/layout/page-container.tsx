import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  withPadding?: boolean;
}

/**
 * 全ページ共通のコンテナコンポーネント
 * 一貫したパディングとマージンを適用します
 * レスポンシブ対応済み
 *
 * @param children - 子要素
 * @param className - 追加のクラス名
 * @param fullWidth - 最大幅制限を解除するフラグ
 * @param withPadding - パディングを適用するフラグ（デフォルト: true）
 */
export function PageContainer({
  children,
  className,
  fullWidth = false,
  withPadding = true
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-h-[calc(100vh-2rem)]",
        withPadding && "px-4 pb-6 pt-2 sm:px-6 md:px-8",
        !fullWidth && "max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}

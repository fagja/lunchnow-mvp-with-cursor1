import React from 'react';
import { cn, responsivePadding, containerSizes } from '@/lib/utils';

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
        withPadding && `${responsivePadding.base} ${responsivePadding.md} ${responsivePadding.lg}`,
        !fullWidth && `${containerSizes.sm} md:${containerSizes.md} lg:${containerSizes.lg}`,
        className
      )}
    >
      {children}
    </div>
  );
}

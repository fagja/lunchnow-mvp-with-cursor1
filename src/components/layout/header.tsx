'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

/**
 * 共通ヘッダーコンポーネント
 * レスポンシブ対応済み
 *
 * @param title - ヘッダータイトル
 * @param rightElement - 右側に表示する要素
 * @param leftElement - 左側に表示する要素
 * @param className - 追加のクラス名
 * @param sticky - 固定表示するかどうか
 */
export function Header({
  title,
  rightElement,
  leftElement,
  className,
  sticky = false
}: HeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between h-14 mb-4",
        sticky && "sticky top-0 bg-white z-10 border-b border-gray-100",
        className
      )}
    >
      <div className="flex-initial min-w-[44px]">
        {leftElement}
      </div>
      <h1 className="text-center text-xl font-medium flex-1 truncate-1">{title}</h1>
      <div className="flex-initial min-w-[44px]">
        {rightElement}
      </div>
    </header>
  );
}

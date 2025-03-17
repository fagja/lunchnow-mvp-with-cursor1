'use client';

import React from 'react';

interface HeaderProps {
  title: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
}

/**
 * 共通ヘッダーコンポーネント
 */
export function Header({ title, rightElement, leftElement }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-14 mb-4">
      <div className="flex-initial">
        {leftElement}
      </div>
      <h1 className="text-center text-xl font-medium flex-1">{title}</h1>
      <div className="flex-initial">
        {rightElement}
      </div>
    </header>
  );
}
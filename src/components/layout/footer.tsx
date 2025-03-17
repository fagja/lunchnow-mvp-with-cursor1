import React from 'react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

/**
 * 共通フッターコンポーネント
 * MVPでは必要最小限の実装
 * レスポンシブ対応済み
 */
export function Footer({ className }: FooterProps = {}) {
  return (
    <footer className={cn(
      "mt-auto py-4 text-center text-sm text-gray-500",
      "border-t border-gray-100",
      className
    )}>
      <p>© 2024 LunchNow - MVP Version</p>
    </footer>
  );
}

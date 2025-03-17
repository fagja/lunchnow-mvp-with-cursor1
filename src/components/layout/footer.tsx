import React from 'react';

/**
 * 共通フッターコンポーネント
 * MVPでは必要最小限の実装
 */
export function Footer() {
  return (
    <footer className="mt-auto py-3 text-center text-sm text-gray-500">
      <p>© 2024 LunchNow - MVP Version</p>
    </footer>
  );
}
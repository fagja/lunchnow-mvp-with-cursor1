'use client';

import { ToastProvider } from "@/components/ui/toast-context";

/**
 * アプリケーション全体のプロバイダーをまとめるコンポーネント
 * 将来的に複数のプロバイダーが増えた場合の管理を容易にします
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
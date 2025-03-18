import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  error: string | null | { code: string; message: string };
  className?: string;
}

/**
 * 共通エラーメッセージコンポーネント
 * アプリケーション全体で一貫したエラー表示を提供
 */
export function ErrorMessage({ error, className }: ErrorMessageProps) {
  if (!error) return null;

  // エラーがオブジェクトの場合はメッセージプロパティを使用
  const errorMessage = typeof error === 'object' ? error.message : error;

  return (
    <div
      className={cn(
        'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {errorMessage}
    </div>
  );
}

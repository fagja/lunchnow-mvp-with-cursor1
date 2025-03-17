'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

/**
 * エラーページ
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error('アプリケーションエラー:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
      <h2 className="text-2xl font-bold mb-4">問題が発生しました</h2>
      <p className="mb-8 text-muted-foreground">
        申し訳ありませんが、エラーが発生しました。もう一度やり直してください。
      </p>
      <Button onClick={reset}>やり直す</Button>
    </div>
  );
}
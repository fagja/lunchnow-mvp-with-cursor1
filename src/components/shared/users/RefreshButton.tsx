'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/constants';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  onError?: (message: string) => void; // エラーハンドリング用コールバック追加
}

/**
 * 手動リロードボタンと最終更新時刻表示コンポーネント
 * ユーザー一覧画面で使用
 */
export function RefreshButton({ onRefresh, onError }: RefreshButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 時刻フォーマット関数をメモ化
  const formatTime = useMemo(() => {
    return (date: Date): string => {
      return date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };
  }, []);

  // リフレッシュ処理をuseCallbackでメモ化
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await onRefresh();
      // 更新成功時に現在時刻を設定
      setLastUpdated(new Date());
    } catch (error) {
      console.error('更新エラー:', error);
      // エラーコールバックが提供されている場合は呼び出し
      if (onError) {
        onError(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onRefresh, onError]);

  // 表示用の時刻文字列をメモ化
  const formattedTime = useMemo(() => formatTime(lastUpdated), [formatTime, lastUpdated]);

  return (
    <div className="flex items-center justify-end gap-2 mb-4">
      <span className="text-sm text-gray-500">
        最終更新: {formattedTime}
      </span>
      <Button
        size="sm"
        variant="outline"
        onClick={handleRefresh}
        disabled={isLoading}
        aria-label="リロード"
        // モバイル対応のためにサイズを調整
        className="min-h-[44px] min-w-[44px]"
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
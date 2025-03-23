import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ポーリングオプション
 */
export interface PollingOptions {
  /**
   * ポーリング間隔（ミリ秒）
   * @default 5000
   */
  interval?: number;

  /**
   * ポーリングの初期状態
   * @default false
   */
  enabled?: boolean;

  /**
   * バックグラウンド時にポーリングを停止するかどうか
   * @default true
   */
  stopOnBackground?: boolean;

  /**
   * ポーリング成功時のコールバック
   */
  onSuccess?: (data: any) => void;

  /**
   * ポーリングエラー時のコールバック
   */
  onError?: (error: Error) => void;
}

/**
 * ポーリングフックの戻り値
 */
export interface PollingResult<T = any> {
  /**
   * ポーリングデータ
   */
  data: T | null;

  /**
   * ポーリングエラー
   */
  error: Error | null;

  /**
   * ポーリング中かどうか
   */
  isLoading: boolean;

  /**
   * ポーリングが有効かどうか
   */
  isPolling: boolean;

  /**
   * ポーリングを開始する関数
   */
  start: () => void;

  /**
   * ポーリングを停止する関数
   */
  stop: () => void;

  /**
   * 即時実行する関数（ポーリングインターバルを待たずに即時実行）
   */
  execute: () => Promise<void>;
}

/**
 * 定期的なデータ取得を行うポーリング用カスタムフック
 *
 * @param fetcher データ取得関数
 * @param options ポーリングオプション
 * @returns ポーリング結果とコントロール関数
 *
 * @example
 * const fetchMessages = async () => {
 *   const response = await fetch('/api/messages');
 *   return response.json();
 * };
 *
 * const { data, error, isLoading, start, stop } = usePolling(fetchMessages, {
 *   interval: 5000,       // 5秒間隔でポーリング
 *   enabled: true,        // 初期状態で有効
 *   stopOnBackground: true // バックグラウンド時に停止
 * });
 */
export function usePolling<T = any>(
  fetcher: () => Promise<T>,
  options: PollingOptions = {}
): PollingResult<T> {
  const {
    interval = 5000,
    enabled = false,
    stopOnBackground = true,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(enabled);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // ポーリング実行関数
  const executeFetch = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current || !isPolling) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();

      if (isMountedRef.current) {
        setData(result);
        setIsLoading(false);

        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsLoading(false);

        if (onError) {
          onError(error);
        }
      }
    }
  }, [fetcher, isPolling, onSuccess, onError]);

  // ポーリング開始関数
  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  // ポーリング停止関数
  const stopPolling = useCallback(() => {
    setIsPolling(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ポーリングタイマー設定
  useEffect(() => {
    // ポーリングが無効の場合は何もしない
    if (!isPolling) return;

    // 初回のフェッチを実行
    executeFetch();

    // インターバルタイマーを設定
    const setupNextPoll = () => {
      timerRef.current = setTimeout(() => {
        executeFetch().finally(() => {
          if (isMountedRef.current && isPolling) {
            setupNextPoll();
          }
        });
      }, interval);
    };

    setupNextPoll();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPolling, interval, executeFetch]);

  // バックグラウンド検出
  useEffect(() => {
    if (!stopOnBackground) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // バックグラウンドに移行したらタイマーをクリア
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      } else if (document.visibilityState === 'visible' && isPolling) {
        // フォアグラウンドに戻ったら即時実行して次のポーリングをセット
        executeFetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPolling, stopOnBackground, executeFetch]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    isPolling,
    start: startPolling,
    stop: stopPolling,
    execute: executeFetch
  };
}

export default usePolling;

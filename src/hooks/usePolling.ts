import { useEffect, useRef, useState, useCallback } from 'react';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';

/**
 * ポーリングのオプション型定義
 */
interface PollingOptions<T> {
  /** ポーリング間隔（ミリ秒） */
  interval: number;
  /** 初回即時実行するかどうか（デフォルト: true） */
  immediate?: boolean;
  /** 自動的にバックグラウンド検出を行うかどうか（デフォルト: true） */
  detectVisibility?: boolean;
  /** 条件付き実行（falseの場合はポーリングを一時停止） */
  enabled?: boolean;
  /** 最大試行回数（デフォルト: 無制限） */
  maxAttempts?: number;
  /** エラー時のリトライ間隔（ミリ秒）（デフォルト: 通常間隔の2倍） */
  retryInterval?: number;
  /** 条件が満たされた場合に自動的にポーリングを停止する */
  stopCondition?: (data: T) => boolean;
}

/**
 * ポーリングの状態型定義
 */
interface PollingState<T> {
  /** 最新のデータ */
  data: T | null;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー状態 */
  error: Error | null;
  /** ポーリングがアクティブかどうか */
  isPolling: boolean;
  /** 最後のデータ取得時刻 */
  lastUpdated: Date | null;
  /** 試行回数 */
  attempts: number;
}

/**
 * 共通ポーリングユーティリティフック
 *
 * @param fetchFn データを取得する非同期関数
 * @param options ポーリングオプション
 * @returns ポーリング状態と制御関数
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: PollingOptions<T>
) {
  // デフォルトオプションの設定
  const {
    interval,
    immediate = true,
    detectVisibility = true,
    enabled = true,
    maxAttempts,
    retryInterval = interval * 2,
    stopCondition,
  } = options;

  // 状態の初期化
  const [state, setState] = useState<PollingState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
    isPolling: immediate && enabled,
    lastUpdated: null,
    attempts: 0,
  });

  // インターバルIDの参照
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // 非表示状態の追跡用参照
  const isVisibleRef = useRef<boolean>(true);
  // マウント状態の追跡用参照
  const isMountedRef = useRef<boolean>(true);
  // エラー状態の追跡用参照
  const hasErrorRef = useRef<boolean>(false);

  // ポーリング停止関数
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;

      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          isPolling: false,
        }));
      }
    }
  }, []);

  // ポーリング開始関数
  const startPolling = useCallback(() => {
    // すでにポーリング中の場合は何もしない
    if (intervalRef.current) return;

    // 最大試行回数に達した場合は何もしない
    if (maxAttempts && state.attempts >= maxAttempts) return;

    // 非表示状態の場合は何もしない
    if (detectVisibility && !isVisibleRef.current) return;

    // enabledがfalseの場合は何もしない
    if (!enabled) return;

    // ポーリング実行関数
    const executePoll = async () => {
      try {
        // マウント状態でないならリターン
        if (!isMountedRef.current) return;

        setState((prev) => ({ ...prev, isLoading: true, attempts: prev.attempts + 1 }));

        const result = await fetchFn();

        // マウント状態でないならリターン
        if (!isMountedRef.current) return;

        setState((prev) => ({
          ...prev,
          data: result,
          error: null,
          isLoading: false,
          lastUpdated: new Date(),
        }));

        hasErrorRef.current = false;

        // 停止条件が指定されていて条件が真の場合はポーリングを停止
        if (stopCondition && stopCondition(result)) {
          stopPolling();
        }
      } catch (error) {
        // マウント状態でないならリターン
        if (!isMountedRef.current) return;

        hasErrorRef.current = true;

        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error(API_ERROR_MESSAGES.UNKNOWN_ERROR),
          isLoading: false,
        }));

        // エラー時にはポーリングを一時停止し、retryIntervalで再開
        clearInterval(intervalRef.current!);
        intervalRef.current = setTimeout(() => {
          if (isMountedRef.current && isVisibleRef.current && enabled) {
            intervalRef.current = setInterval(executePoll, interval);
          }
        }, retryInterval) as unknown as NodeJS.Timeout;
      }
    };

    // ポーリング状態を更新
    setState((prev) => ({ ...prev, isPolling: true }));

    // 即時実行の場合はすぐに実行
    if (immediate) {
      executePoll();
    }

    // 通常間隔のポーリングを開始
    intervalRef.current = setInterval(executePoll, interval);
  }, [fetchFn, interval, immediate, detectVisibility, enabled, maxAttempts, retryInterval, stopCondition, stopPolling, state.attempts]);

  // 手動実行関数
  const refetch = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const result = await fetchFn();

      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          data: result,
          error: null,
          isLoading: false,
          lastUpdated: new Date(),
        }));
      }

      return result;
    } catch (error) {
      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error(API_ERROR_MESSAGES.UNKNOWN_ERROR),
          isLoading: false,
        }));
      }
      throw error;
    }
  }, [fetchFn]);

  // リセット関数
  const reset = useCallback(() => {
    stopPolling();
    setState({
      data: null,
      isLoading: false,
      error: null,
      isPolling: false,
      lastUpdated: null,
      attempts: 0,
    });
  }, [stopPolling]);

  // ページの可視性変更を検出する
  useEffect(() => {
    if (!detectVisibility) return;

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      isVisibleRef.current = isVisible;

      if (isVisible) {
        // ページが表示された時にポーリングを再開
        startPolling();
      } else {
        // ページが非表示になった時にポーリングを停止
        stopPolling();
      }
    };

    // 初期状態の設定
    isVisibleRef.current = !document.hidden;

    // イベントリスナーの追加
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // クリーンアップ関数
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [detectVisibility, startPolling, stopPolling]);

  // enabledオプションの変更を監視
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [enabled, startPolling, stopPolling]);

  // 初期化と後処理
  useEffect(() => {
    isMountedRef.current = true;

    if (immediate && enabled) {
      startPolling();
    }

    // クリーンアップ関数
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [immediate, enabled, startPolling]);

  return {
    ...state,
    startPolling,
    stopPolling,
    refetch,
    reset,
  };
}

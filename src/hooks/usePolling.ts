import { useEffect, useRef, useState, useCallback } from 'react';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';
import { useErrorHandler } from './useErrorHandler';

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
  /** エラーを表示するかどうか（デフォルト: true） */
  showError?: boolean;
  /** エラーの自動非表示時間（ミリ秒） */
  errorAutoHideTimeout?: number;
  /** エラー発生時のコールバック */
  onError?: (error: Error) => void;
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
    showError = true,
    errorAutoHideTimeout = 5000,
    onError,
  } = options;

  // エラーハンドラーの初期化
  const errorHandler = useErrorHandler({
    showError,
    autoHideTimeout: errorAutoHideTimeout,
    onError,
  });

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
  // 最大試行回数の参照
  const maxAttemptsRef = useRef<number | undefined>(maxAttempts);
  // 試行回数の参照
  const attemptsRef = useRef<number>(0);
  // 有効状態の参照
  const enabledRef = useRef<boolean>(enabled);
  // fetchFnの参照
  const fetchFnRef = useRef(fetchFn);
  // stopConditionの参照
  const stopConditionRef = useRef(stopCondition);
  // intervalの参照
  const intervalRef2 = useRef(interval);
  // retryIntervalの参照
  const retryIntervalRef = useRef(retryInterval);
  // detectVisibilityの参照
  const detectVisibilityRef = useRef(detectVisibility);

  // 参照値を更新
  useEffect(() => {
    maxAttemptsRef.current = maxAttempts;
    enabledRef.current = enabled;
    fetchFnRef.current = fetchFn;
    stopConditionRef.current = stopCondition;
    intervalRef2.current = interval;
    retryIntervalRef.current = retryInterval;
    detectVisibilityRef.current = detectVisibility;
  }, [maxAttempts, enabled, fetchFn, stopCondition, interval, retryInterval, detectVisibility]);

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

  // ポーリング実行関数 - 循環参照を避けるためにuseCallbackの外に定義
  const executePollRef = useRef(async () => {
      try {
        // マウント状態でないならリターン
        if (!isMountedRef.current) return;

      // 試行回数を更新
      attemptsRef.current += 1;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        attempts: attemptsRef.current
      }));

      const result = await fetchFnRef.current();

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
      if (stopConditionRef.current && stopConditionRef.current(result)) {
          stopPolling();
        }
      } catch (error) {
        // マウント状態でないならリターン
        if (!isMountedRef.current) return;

        hasErrorRef.current = true;

        const normalizedError = errorHandler.handleError(error);

        setState((prev) => ({
          ...prev,
          error: normalizedError,
          isLoading: false,
        }));

        // エラー時にはポーリングを一時停止し、retryIntervalで再開
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setTimeout(() => {
          if (isMountedRef.current && isVisibleRef.current && enabledRef.current) {
            intervalRef.current = setInterval(() => {
              executePollRef.current();
            }, intervalRef2.current);
          }
        }, retryIntervalRef.current) as unknown as NodeJS.Timeout;
      }
    }
  });

  // ポーリング開始関数
  const startPolling = useCallback(() => {
    // すでにポーリング中の場合は何もしない
    if (intervalRef.current) return;

    // 最大試行回数に達した場合は何もしない
    if (maxAttemptsRef.current && attemptsRef.current >= maxAttemptsRef.current) return;

    // 非表示状態の場合は何もしない
    if (detectVisibilityRef.current && !isVisibleRef.current) return;

    // enabledがfalseの場合は何もしない
    if (!enabledRef.current) return;

    // ポーリング状態を更新
    setState((prev) => ({ ...prev, isPolling: true }));

    // 即時実行の場合はすぐに実行
    if (immediate) {
      executePollRef.current();
    }

    // 通常間隔のポーリングを開始
    intervalRef.current = setInterval(() => {
      executePollRef.current();
    }, intervalRef2.current);
  }, [immediate]); // 依存配列を最小限に抑える

  // 手動実行関数
  const refetch = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const result = await fetchFnRef.current();

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
        const normalizedError = errorHandler.handleError(error);

        setState((prev) => ({
          ...prev,
          error: normalizedError,
          isLoading: false,
        }));
      }
      throw error;
    }
  }, [errorHandler]);

  // リセット関数
  const reset = useCallback(() => {
    stopPolling();
    attemptsRef.current = 0;
    setState({
      data: null,
      isLoading: false,
      error: null,
      isPolling: false,
      lastUpdated: null,
      attempts: 0,
    });
    errorHandler.resetError();
  }, [stopPolling, errorHandler]);

  // ページの可視性変更を検出する
  useEffect(() => {
    if (!detectVisibilityRef.current) return;

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
  }, [startPolling, stopPolling]);

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
    hideError: errorHandler.hideError,
    resetError: errorHandler.resetError,
  };
}

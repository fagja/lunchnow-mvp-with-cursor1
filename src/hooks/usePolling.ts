import { useEffect, useRef, useState, useCallback } from 'react';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';
import { useErrorHandler } from './useErrorHandler';
import { BasePollingOptions, PollingState, PollingResult } from '@/types/polling';

/**
 * ポーリング設定参照オブジェクト型
 * useRef で保持するポーリング設定値
 */
type PollingConfigRefs = {
  maxAttempts?: number;
  enabled: boolean;
  fetchFn: () => Promise<any>;
  stopCondition?: (data: any) => boolean;
  interval: number;
  retryInterval: number;
  detectVisibility: boolean;
};

/**
 * 共通ポーリングユーティリティフック
 *
 * @param fetchFn データを取得する非同期関数
 * @param options ポーリングオプション
 * @returns ポーリング状態と制御関数
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: BasePollingOptions<T>
): PollingResult<T> {
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ポーリング状態の参照
  const isMountedRef = useRef<boolean>(true);
  const isVisibleRef = useRef<boolean>(true);
  const hasErrorRef = useRef<boolean>(false);
  const attemptsRef = useRef<number>(0);

  // ポーリング設定の参照
  const configRef = useRef<PollingConfigRefs>({
    maxAttempts,
    enabled,
    fetchFn,
    stopCondition,
    interval,
    retryInterval,
    detectVisibility,
  });

  // 参照値を更新
  useEffect(() => {
    configRef.current = {
      maxAttempts,
      enabled,
      fetchFn,
      stopCondition,
      interval,
      retryInterval,
      detectVisibility,
    };
  }, [maxAttempts, enabled, fetchFn, stopCondition, interval, retryInterval, detectVisibility]);

  // ポーリング停止関数
  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;

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

      const result = await configRef.current.fetchFn();

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
      if (configRef.current.stopCondition && configRef.current.stopCondition(result)) {
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
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (isMountedRef.current && isVisibleRef.current && configRef.current.enabled) {
            timerRef.current = setInterval(() => {
              executePollRef.current();
            }, configRef.current.interval);
          }
        }, configRef.current.retryInterval) as unknown as NodeJS.Timeout;
      }
    }
  });

  // ポーリング開始関数
  const startPolling = useCallback(() => {
    // すでにポーリング中の場合は何もしない
    if (timerRef.current) return;

    // 最大試行回数に達した場合は何もしない
    if (configRef.current.maxAttempts && attemptsRef.current >= configRef.current.maxAttempts) return;

    // 非表示状態の場合は何もしない
    if (configRef.current.detectVisibility && !isVisibleRef.current) return;

    // enabledがfalseの場合は何もしない
    if (!configRef.current.enabled) return;

    // ポーリング状態を更新
    setState((prev) => ({ ...prev, isPolling: true }));

    // 即時実行の場合はすぐに実行
    if (immediate) {
      executePollRef.current();
    }

    // 通常間隔のポーリングを開始
    timerRef.current = setInterval(() => {
      executePollRef.current();
    }, configRef.current.interval);
  }, [immediate]); // 依存配列を最小限に抑える

  // 手動実行関数
  const refetch = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const result = await configRef.current.fetchFn();

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
    if (!configRef.current.detectVisibility) return;

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
    if (configRef.current.enabled) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [configRef.current.enabled, startPolling, stopPolling]);

  // 初期化と後処理
  useEffect(() => {
    isMountedRef.current = true;

    if (immediate && configRef.current.enabled) {
      startPolling();
    }

    // クリーンアップ関数
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [immediate, configRef.current.enabled, startPolling]);

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

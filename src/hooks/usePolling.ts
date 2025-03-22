import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ポーリングの設定オプション
 */
export interface PollingOptions<T = any> {
  /**
   * ポーリング間隔（ミリ秒）
   * @default 3000
   */
  interval?: number;

  /**
   * ポーリングの初期状態
   * @default true
   */
  enabled?: boolean;

  /**
   * 自動的にポーリングを停止する条件
   * @param data - ポーリングで取得したデータ
   * @returns 条件が true の場合、ポーリングを停止
   */
  stopCondition?: (data: T) => boolean;

  /**
   * エラー発生時に自動的に再試行するかどうか
   * @default true
   */
  retryOnError?: boolean;

  /**
   * 最大リトライ回数
   * @default 3
   */
  maxRetries?: number;

  /**
   * バックグラウンド時にポーリングを停止するかどうか
   * @default true
   */
  stopOnBackground?: boolean;

  /**
   * エラー時のコールバック関数
   */
  onError?: (error: Error) => void;

  /**
   * 成功時のコールバック関数
   */
  onSuccess?: (data: T) => void;
}

/**
 * ポーリングの状態
 */
export interface PollingState<T> {
  /**
   * 取得したデータ
   */
  data: T | null;

  /**
   * データ取得中かどうか
   */
  isLoading: boolean;

  /**
   * エラー情報
   */
  error: Error | null;

  /**
   * ポーリングが有効かどうか
   */
  isPolling: boolean;

  /**
   * 最後のデータ取得時刻
   */
  lastUpdated: Date | null;
}

/**
 * ポーリングユーティリティフック
 *
 * 指定した間隔で非同期関数を実行し、データを定期的に取得するためのカスタムフック。
 * バックグラウンドタブやページ離脱時には自動的にポーリングを停止し、リソースを節約します。
 *
 * @param fetchFn - データを取得する非同期関数
 * @param options - ポーリングの設定オプション
 * @returns ポーリングの状態と制御関数
 *
 * @example
 * // チャットメッセージの3秒ごとのポーリング
 * const fetchMessages = async () => {
 *   const response = await fetch(`/api/matches/${matchId}/messages`);
 *   return response.json();
 * };
 *
 * const { data, isLoading, error, start, stop } = usePolling(fetchMessages, {
 *   interval: 3000,
 *   stopOnBackground: true
 * });
 *
 * // マッチング確認の7秒ごとのポーリング（条件達成で自動停止）
 * const checkMatching = async () => {
 *   const response = await fetch(`/api/users/${userId}/matching`);
 *   return response.json();
 * };
 *
 * const { data, isLoading, error } = usePolling(checkMatching, {
 *   interval: 7000,
 *   stopCondition: (data) => data?.status === 'matched', // マッチしたら停止
 *   onSuccess: (data) => {
 *     if (data?.status === 'matched') {
 *       // マッチング成立時の処理
 *       showMatchNotification(data);
 *       router.push('/chat');
 *     }
 *   }
 * });
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: PollingOptions<T> = {}
) {
  // デフォルトオプションの設定
  const {
    interval = 3000,
    enabled = true,
    stopCondition,
    retryOnError = true,
    maxRetries = 3,
    stopOnBackground = true,
    onError,
    onSuccess,
  } = options;

  // 状態管理
  const [state, setState] = useState<PollingState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isPolling: enabled,
    lastUpdated: null,
  });

  // 内部で使用する参照
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isVisibleRef = useRef(true); // ページの可視性状態を追跡

  // ポーリングの実行関数
  const executePoll = useCallback(async () => {
    // ポーリングが無効の場合は実行しない
    if (!state.isPolling) return;

    // バックグラウンドでポーリングを停止する場合、ページが表示されていなければ実行しない
    if (stopOnBackground && !isVisibleRef.current) return;

    // 以前のタイムアウトをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 前回の未完了リクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 新しい AbortController を作成
    abortControllerRef.current = new AbortController();

    // ローディング状態を設定
    setState((prev: PollingState<T>) => ({ ...prev, isLoading: true }));

    try {
      // データの取得
      const data = await fetchFn();

      // コンポーネントがアンマウントされていないか確認
      if (!mountedRef.current) return;

      // 成功時の状態更新
      setState((prev: PollingState<T>) => ({
        ...prev,
        data,
        error: null,
        isLoading: false,
        lastUpdated: new Date(),
      }));

      // リトライカウンターをリセット
      retryCountRef.current = 0;

      // 成功時のコールバックを実行
      if (onSuccess) {
        onSuccess(data);
      }

      // 停止条件を満たしているか確認
      if (stopCondition && stopCondition(data)) {
        setState((prev: PollingState<T>) => ({ ...prev, isPolling: false }));
        return;
      }

      // 次のポーリングをスケジュール
      if (state.isPolling && mountedRef.current) {
        timeoutRef.current = setTimeout(executePoll, interval);
      }
    } catch (error) {
      // コンポーネントがアンマウントされていないか確認
      if (!mountedRef.current) return;

      // エラー状態の更新
      setState((prev: PollingState<T>) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));

      // エラーコールバックを実行
      if (onError) {
        onError(error as Error);
      }

      // リトライロジック
      if (retryOnError && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        // 再試行のスケジュール（少し待機時間を増やす）
        timeoutRef.current = setTimeout(
          executePoll,
          interval * (1 + retryCountRef.current * 0.5)
        );
      } else if (state.isPolling && mountedRef.current) {
        // 最大リトライ回数に達した場合でも、ポーリングが有効なら続行
        timeoutRef.current = setTimeout(executePoll, interval);
        // リトライカウンターをリセット
        retryCountRef.current = 0;
      }
    }
  }, [
    fetchFn,
    interval,
    maxRetries,
    onError,
    onSuccess,
    retryOnError,
    state.isPolling,
    stopCondition,
    stopOnBackground,
  ]);

  // ポーリングの開始
  const start = useCallback(() => {
    setState((prev: PollingState<T>) => ({ ...prev, isPolling: true }));
  }, []);

  // ポーリングの停止
  const stop = useCallback(() => {
    setState((prev: PollingState<T>) => ({ ...prev, isPolling: false }));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // データの手動更新
  const refresh = useCallback(() => {
    if (state.isPolling) {
      // 今すぐポーリングを実行
      executePoll();
    }
  }, [executePoll, state.isPolling]);

  // バックグラウンド検出とクリーンアップ
  useEffect(() => {
    // 初期状態がenabledならポーリングを開始
    if (enabled) {
      executePoll();
    }

    // バックグラウンド検出
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      isVisibleRef.current = isVisible;

      if (stopOnBackground) {
        if (isVisible) {
          // 画面が表示された時に実行中だった場合はポーリングを再開
          if (state.isPolling) {
            executePoll();
          }
        } else {
          // バックグラウンドに移行した時は一時停止（isPollingはそのまま）
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
          }
        }
      }
    };

    // イベントリスナー登録
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 初期可視性状態を設定
    isVisibleRef.current = document.visibilityState === 'visible';

    // コンポーネントのマウント状態を記録
    mountedRef.current = true;

    // クリーンアップ
    return () => {
      mountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [enabled, executePoll, state.isPolling, stopOnBackground]);

  return {
    ...state,
    start,
    stop,
    refresh,
  };
}

export default usePolling;

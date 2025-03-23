import { useState, useEffect, useCallback } from 'react';
import { SWRResponse, SWRConfiguration, useSWR } from 'swr';

/**
 * SWRの内蔵ポーリング機能を使用するフックのオプション
 */
export interface SWRPollingOptions extends SWRConfiguration {
  /**
   * ポーリングを有効にするかどうか
   * @default true
   */
  pollingEnabled?: boolean;

  /**
   * バックグラウンド時にポーリングを停止するかどうか
   * @default true
   */
  stopOnBackground?: boolean;

  /**
   * ポーリング間隔（ミリ秒）
   * @default 3000
   */
  refreshInterval?: number;
}

/**
 * SWRの内蔵ポーリング機能を使用するフックのレスポンス型
 */
export interface SWRPollingResponse<T> extends SWRResponse<T> {
  /**
   * ポーリングの状態と制御関数
   */
  polling: {
    /**
     * ポーリングが有効かどうか
     */
    isPolling: boolean;

    /**
     * ポーリングを開始する関数
     */
    startPolling: () => void;

    /**
     * ポーリングを停止する関数
     */
    stopPolling: () => void;

    /**
     * 最後にポーリングでデータを取得した時間
     */
    lastPolled: Date | null;
  };
}

/**
 * SWRの内蔵ポーリング機能を使用したカスタムフック
 *
 * @param key SWRのキー
 * @param fetcher SWRのフェッチャー関数 (指定しない場合はSWRのグローバルフェッチャーを使用)
 * @param options ポーリングオプション
 * @returns SWRレスポンスとポーリング制御関数
 *
 * @example
 * // チャットメッセージをポーリング取得する例
 * const { data, error, polling } = useSWRPolling(
 *   `/matches/${matchId}/messages`,
 *   undefined, // グローバルフェッチャーを使用
 *   {
 *     refreshInterval: 3000, // 3秒間隔
 *     stopOnBackground: true, // バックグラウンド時に停止
 *   }
 * );
 *
 * // 任意のタイミングでポーリングを制御
 * const handleTabChange = (isActive) => {
 *   if (isActive) {
 *     polling.startPolling();
 *   } else {
 *     polling.stopPolling();
 *   }
 * };
 */
export function useSWRPolling<T = any>(
  key: string | null,
  fetcher?: (url: string) => Promise<T>,
  options: SWRPollingOptions = {}
): SWRPollingResponse<T> {
  const {
    pollingEnabled = true,
    stopOnBackground = true,
    refreshInterval = 3000,
    ...swrOptions
  } = options;

  // ポーリング状態の管理
  const [isPolling, setIsPolling] = useState<boolean>(pollingEnabled);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);

  // SWRの設定を動的に変更するためのオプション
  const currentRefreshInterval = isPolling ? refreshInterval : 0;

  // SWR フック
  const swr = useSWR<T>(
    key,
    fetcher,
    {
      ...swrOptions,
      refreshInterval: currentRefreshInterval,
      onSuccess: (data) => {
        setLastPolled(new Date());
        if (swrOptions.onSuccess) {
          swrOptions.onSuccess(data);
        }
      },
    }
  );

  // ポーリング開始関数
  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  // ポーリング停止関数
  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  // バックグラウンド検出
  useEffect(() => {
    if (!stopOnBackground) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsPolling(false);
      } else if (document.visibilityState === 'visible' && pollingEnabled) {
        setIsPolling(true);
        // フォアグラウンドに戻ったら即時再検証
        if (swr.mutate) {
          swr.mutate();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pollingEnabled, stopOnBackground, swr.mutate]);

  return {
    ...swr,
    polling: {
      isPolling,
      startPolling,
      stopPolling,
      lastPolled,
    },
  };
}

export default useSWRPolling;

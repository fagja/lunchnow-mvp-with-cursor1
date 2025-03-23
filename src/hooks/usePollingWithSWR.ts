import { useEffect, useRef, useState } from 'react';
import { SWRResponse, SWRConfiguration, useSWR } from 'swr';
import { usePolling, PollingOptions } from './usePolling';

/**
 * ポーリングとSWRを組み合わせたカスタムフックのオプション
 */
export interface PollingWithSWROptions extends Omit<PollingOptions, 'enabled'> {
  /**
   * SWR設定オプション
   */
  swrConfig?: SWRConfiguration;

  /**
   * ポーリングを有効にするかどうか
   * @default true
   */
  pollingEnabled?: boolean;

  /**
   * SWRのリバリデーションをポーリング成功時に行うかどうか
   * @default true
   */
  revalidateOnPollingSuccess?: boolean;
}

/**
 * ポーリングとSWRを組み合わせたレスポンス型
 */
export interface PollingWithSWRResponse<T> extends SWRResponse<T> {
  /**
   * ポーリングの状態
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
 * ポーリングとSWRを組み合わせたカスタムフック
 *
 * SWRの効率的なキャッシュ機能と、ポーリングによるリアルタイム更新を組み合わせ、
 * リソースの効率的な利用と、データの即時性のバランスを取ります。
 *
 * @param key SWRキー
 * @param fetcher データ取得関数
 * @param options オプション設定
 * @returns ポーリングとSWRを組み合わせたレスポンス
 *
 * @example
 * // チャットメッセージをSWRとポーリングで取得
 * const { data, error, polling } = usePollingWithSWR(
 *   `/matches/${matchId}/messages`,
 *   () => fetchMessages(matchId),
 *   {
 *     interval: 3000, // 3秒間隔でポーリング
 *     swrConfig: { dedupingInterval: 0 }, // SWRキャッシュなし
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
export function usePollingWithSWR<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: PollingWithSWROptions = {}
): PollingWithSWRResponse<T> {
  const {
    interval = 3000,
    pollingEnabled = true,
    swrConfig = {},
    revalidateOnPollingSuccess = true,
    stopOnBackground = true,
    onSuccess,
    ...restOptions
  } = options;

  // ポーリングで取得したデータをSWRで再検証するための状態
  const needRevalidateRef = useRef(false);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);

  // SWR フック
  const swr = useSWR<T>(key, undefined, swrConfig);

  // ポーリング用の成功コールバック
  const handlePollingSuccess = (data: T) => {
    setLastPolled(new Date());

    // SWRの再検証フラグを立てる
    if (revalidateOnPollingSuccess) {
      needRevalidateRef.current = true;
    }

    // 外部から渡された成功コールバックがあれば実行
    if (onSuccess) {
      onSuccess(data);
    }
  };

  // ポーリング フック
  const polling = usePolling(fetcher, {
    interval,
    enabled: pollingEnabled,
    stopOnBackground,
    onSuccess: handlePollingSuccess,
    ...restOptions,
  });

  // ポーリングで新しいデータが取得された場合、SWRのデータを再検証
  useEffect(() => {
    if (needRevalidateRef.current && swr.mutate) {
      swr.mutate();
      needRevalidateRef.current = false;
    }
  }, [polling.data, swr.mutate]);

  return {
    ...swr,
    polling: {
      isPolling: polling.isPolling,
      startPolling: polling.start,
      stopPolling: polling.stop,
      lastPolled,
    },
  };
}

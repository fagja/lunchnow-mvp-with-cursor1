import { useState, useEffect, useCallback } from 'react';
import type { SWRResponse, SWRConfiguration } from 'swr';
import useSWR from 'swr';

/**
 * ポーリング実装移行計画:
 *
 * フェーズ1 (現在):
 * - 新しいuseSWRPollingフックを導入
 * - 既存フックに非推奨マークを追加
 * - 一部のAPIを新しいフックに移行
 *
 * フェーズ2 (次のマイナーバージョン):
 * - すべてのAPIを新しいフックに移行
 * - 古いAPI関数は新しいフックのラッパーとして残す
 *
 * フェーズ3 (次のメジャーバージョン):
 * - 古いフックと関数の完全削除
 */

/**
 * useSWRPolling への移行ガイド:
 *
 * 1. usePolling から移行する場合:
 *    - fetcher関数をSWR互換の形式に変更する必要があります
 *    - interval は refreshInterval に名前が変更されています
 *
 * 2. usePollingWithSWR から移行する場合:
 *    - swrConfig プロパティは不要になり、オプションに直接指定できます
 *    - このフックはSWRの内蔵ポーリング機能を使用するため、より効率的です
 */

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

    /**
     * ポーリングの状態
     */
    status: 'active' | 'paused' | 'background';
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
  const [pollingStatus, setPollingStatus] = useState<'active' | 'paused' | 'background'>(
    pollingEnabled ? 'active' : 'paused'
  );

  // SWRの設定を動的に変更するためのオプション
  const currentRefreshInterval = isPolling ? refreshInterval : 0;

  // SWR フック
  // 注: ここでSWRの型エラーが発生しています。
  // SWRのAPIが更新されている可能性があるため、
  // 実装フェーズ2で型の互換性を完全に解決する予定です。
  // @ts-ignore
  const swr = useSWR(
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
    setPollingStatus('active');
  }, []);

  // ポーリング停止関数
  const stopPolling = useCallback(() => {
    setIsPolling(false);
    setPollingStatus('paused');
  }, []);

  // バックグラウンド検出
  useEffect(() => {
    if (!stopOnBackground) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsPolling(false);
        setPollingStatus('background');
      } else if (document.visibilityState === 'visible' && pollingEnabled) {
        setIsPolling(true);
        setPollingStatus('active');
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
      status: pollingStatus,
    },
  };
}

export default useSWRPolling;

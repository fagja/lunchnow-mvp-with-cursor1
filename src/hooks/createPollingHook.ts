import { useCallback } from 'react';
import { usePolling } from './usePolling';

/**
 * 基本ポーリングフックオプション
 */
interface BasePollingOptions {
  /**
   * ポーリング間隔（ミリ秒）
   */
  interval?: number;
  /**
   * 自動的にバックグラウンド検出を行うかどうか（デフォルト: true）
   */
  detectVisibility?: boolean;
  /**
   * 初回即時実行するかどうか（デフォルト: true）
   */
  immediate?: boolean;
  /**
   * エラーを表示するかどうか（デフォルト: true）
   */
  showError?: boolean;
  /**
   * エラーの自動非表示時間（ミリ秒）
   */
  errorAutoHideTimeout?: number;
}

/**
 * ポーリングフックファクトリの型
 */
export type PollingHookFactory<TData, TOptions extends BasePollingOptions, TResult> = (
  fetchFn: () => Promise<TData>,
  transformResult: (data: TData) => TResult,
  options: TOptions,
  stopCondition?: (data: TData) => boolean
) => ReturnType<typeof usePolling<TData>> & TResult;

/**
 * 特定のポーリングフックを作成するためのファクトリ関数
 * 各ドメイン固有のポーリングフックを統一的に作成できる
 *
 * @param defaultOptions デフォルトオプション
 * @returns 設定済みのポーリングフックファクトリ
 */
export function createPollingHook<TData, TOptions extends BasePollingOptions, TResult>(
  defaultOptions: Partial<TOptions>
): PollingHookFactory<TData, TOptions, TResult> {
  return (fetchFn, transformResult, options, stopCondition) => {
    // デフォルトオプションとユーザーオプションをマージ
    const mergedOptions = {
      ...defaultOptions,
      ...options,
    };

    // 共通ポーリングフックを使用
    const polling = usePolling<TData>(fetchFn, {
      interval: mergedOptions.interval || 5000,
      detectVisibility: mergedOptions.detectVisibility,
      immediate: mergedOptions.immediate,
      showError: mergedOptions.showError,
      errorAutoHideTimeout: mergedOptions.errorAutoHideTimeout,
      stopCondition,
    });

    // データ変換用の関数
    const transformedResult = useCallback(() => {
      if (polling.data) {
        return transformResult(polling.data);
      }
      return {} as TResult;
    }, [polling.data, transformResult]);

    return {
      ...polling,
      ...transformedResult(),
    };
  };
}
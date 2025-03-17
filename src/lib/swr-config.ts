import { SWRConfiguration } from 'swr';
import { fetcher } from './fetcher';

/**
 * SWRのグローバル設定
 * MVPでは最小限の設定のみ定義
 */
export const swrConfig: SWRConfiguration = {
  fetcher,
  dedupingInterval: 2000, // 2秒間重複リクエストを防止
  revalidateOnFocus: false, // タブフォーカス時の再検証はOFF
  shouldRetryOnError: true, // エラー時の再試行を有効
  errorRetryCount: 3, // 最大3回まで再試行
  errorRetryInterval: 5000, // 5秒間隔で再試行
};
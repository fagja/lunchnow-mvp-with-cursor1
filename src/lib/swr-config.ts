import { SWRConfiguration } from 'swr';
import { fetcher } from './fetcher';

/**
 * SWRのグローバル設定
 * データ要件定義書7.5項のキャッシュ戦略に沿った設定
 */
export const swrConfig: SWRConfiguration = {
  fetcher,
  dedupingInterval: 2000, // 2秒間重複リクエストを防止
  revalidateOnFocus: false, // タブフォーカス時の再検証はOFF（MVPでは不要）
  shouldRetryOnError: true, // エラー時の再試行を有効
  errorRetryCount: 3, // 最大3回まで再試行
  errorRetryInterval: 5000, // 5秒間隔で再試行
};

/**
 * ユーザー一覧用のSWR設定
 * 募集中ユーザー一覧: 30秒間のキャッシュ
 */
export const userListConfig: SWRConfiguration = {
  ...swrConfig,
  dedupingInterval: 30000, // 30秒間キャッシュ
  revalidateIfStale: true, // 古いデータがある場合も自動で再検証
};

/**
 * プロフィール情報用のSWR設定
 * 変更頻度の低いデータは5分間キャッシュ
 */
export const profileConfig: SWRConfiguration = {
  ...swrConfig,
  dedupingInterval: 300000, // 5分間キャッシュ
  revalidateIfStale: false, // 古いデータがある場合は自動で再検証しない
};

/**
 * マッチング情報用のSWR設定
 * アクティブなマッチは1分間キャッシュ
 */
export const matchingConfig: SWRConfiguration = {
  ...swrConfig,
  dedupingInterval: 60000, // 1分間キャッシュ
  revalidateIfStale: true, // 古いデータがある場合も自動で再検証
};

/**
 * メッセージ用のSWR設定
 * キャッシュなし、リアルタイム取得
 */
export const messageConfig: SWRConfiguration = {
  ...swrConfig,
  dedupingInterval: 0, // キャッシュしない
  revalidateIfStale: true, // 古いデータがある場合も自動で再検証
  refreshInterval: 3000, // 3秒ごとに自動更新
};

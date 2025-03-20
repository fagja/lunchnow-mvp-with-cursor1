/**
 * 基本ポーリングオプションの共通型定義
 */
export interface BasePollingOptions<T = any> {
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
export interface PollingState<T> {
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
 * ポーリングの戻り値型定義
 */
export interface PollingResult<T> extends PollingState<T> {
  /** ポーリング開始関数 */
  startPolling: () => void;
  /** ポーリング停止関数 */
  stopPolling: () => void;
  /** データ手動取得関数 */
  refetch: () => Promise<T>;
  /** 状態リセット関数 */
  reset: () => void;
  /** エラー非表示関数 */
  hideError: () => void;
  /** エラーリセット関数 */
  resetError: () => void;
}
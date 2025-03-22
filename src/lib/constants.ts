/**
 * アプリケーション全体で使用する共通定数
 */

/**
 * ストレージキー定数
 */
export const STORAGE_KEYS = {
  /**
   * ユーザーID保存用のキー
   * LocalStorageとCookieの両方で使用
   */
  USER_ID: 'lunchnow_user_id',
};

/**
 * API関連の定数
 */
export const API = {
  /**
   * デフォルトのタイムアウト値（ミリ秒）
   */
  DEFAULT_TIMEOUT: 10000,
};

/**
 * エラーコード定数
 */
export const ERROR_CODES = {
  NETWORK_ERROR: 'network_error',
  TIMEOUT_ERROR: 'timeout_error',
  UNAUTHORIZED: 'unauthorized_error',
  NOT_FOUND: 'not_found_error',
  SERVER_ERROR: 'server_error',
  VALIDATION_ERROR: 'validation_error',
  FORBIDDEN_ERROR: 'forbidden_error',
  CONFLICT_ERROR: 'conflict_error',
  UNKNOWN_ERROR: 'unknown_error'
};

/**
 * エラーメッセージ定数
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
  [ERROR_CODES.TIMEOUT_ERROR]: 'リクエストがタイムアウトしました。ネットワーク接続を確認してください。',
  [ERROR_CODES.UNAUTHORIZED]: '認証に失敗しました。再度ログインしてください。',
  [ERROR_CODES.NOT_FOUND]: 'リクエストされたリソースが見つかりません。',
  [ERROR_CODES.SERVER_ERROR]: 'サーバーでエラーが発生しました。しばらく経ってからお試しください。',
  [ERROR_CODES.VALIDATION_ERROR]: 'リクエストに問題があります。入力内容を確認してください。',
  [ERROR_CODES.FORBIDDEN_ERROR]: 'この操作を行う権限がありません。',
  [ERROR_CODES.CONFLICT_ERROR]: 'リソースが既に存在しています。',
  [ERROR_CODES.UNKNOWN_ERROR]: '予期しないエラーが発生しました。'
};

/**
 * 共通の型定義
 */
export type CookieOptions = {
  days?: number;
  path?: string;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
};

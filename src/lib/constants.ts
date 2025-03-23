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
 * MVPの方針に基づく最小限のエラーコード
 */
export const ERROR_CODES = {
  // 基本エラー（汎用的なカテゴリ）
  SYSTEM_ERROR: 'system_error',       // システム関連のエラー全般
  USER_INPUT_ERROR: 'input_error',    // ユーザー入力に関するエラー全般
  AUTH_ERROR: 'auth_error',           // 認証関連のエラー全般
  RESOURCE_ERROR: 'resource_error',   // リソース関連のエラー全般

  // 具体的なエラー（最小限に厳選）
  USER_ID_NOT_FOUND: 'user_id_not_found',   // ユーザーIDが見つからない
  ALREADY_MATCHED: 'already_matched',       // 既にマッチしている
  NOT_FOUND: 'not_found',                   // リソースが見つからない
  SERVER_ERROR: 'server_error',             // サーバーエラー
  NETWORK_ERROR: 'network_error',           // ネットワークエラー
  TIMEOUT_ERROR: 'timeout_error',           // タイムアウトエラー

  // 下位互換性のために維持（以前のエラーコード）
  UNAUTHORIZED: 'unauthorized_error',
  FORBIDDEN_ERROR: 'forbidden_error',
  VALIDATION_ERROR: 'validation_error',
  CONFLICT_ERROR: 'conflict_error',
  USER_NOT_FOUND: 'user_not_found',
  USER_ALREADY_EXISTS: 'user_already_exists',
  INVALID_USER_DATA: 'invalid_user_data',
  MATCH_NOT_FOUND: 'match_not_found',
  SELF_MATCHING: 'self_matching',
  UNKNOWN_ERROR: 'unknown_error'
};

/**
 * エラーメッセージ定数
 * MVPの方針に基づく汎用的なメッセージ
 */
export const ERROR_MESSAGES = {
  // 基本エラーメッセージ（汎用的）
  [ERROR_CODES.SYSTEM_ERROR]: 'システムエラーが発生しました。しばらく経ってからお試しください。',
  [ERROR_CODES.USER_INPUT_ERROR]: '入力内容に問題があります。もう一度確認してください。',
  [ERROR_CODES.AUTH_ERROR]: '認証に失敗しました。もう一度お試しください。',
  [ERROR_CODES.RESOURCE_ERROR]: 'リソースが見つからないか、アクセスできません。',

  // 具体的なエラーメッセージ（最小限）
  [ERROR_CODES.USER_ID_NOT_FOUND]: 'ユーザーIDが見つかりません。再度ログインしてください。',
  [ERROR_CODES.ALREADY_MATCHED]: '既に他のユーザーとマッチしています。',
  [ERROR_CODES.NOT_FOUND]: 'お探しの情報が見つかりません。',
  [ERROR_CODES.SERVER_ERROR]: 'サーバーでエラーが発生しました。しばらく経ってからお試しください。',
  [ERROR_CODES.NETWORK_ERROR]: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
  [ERROR_CODES.TIMEOUT_ERROR]: 'リクエストがタイムアウトしました。もう一度お試しください。',

  // 下位互換性のために維持（以前のエラーコードのマッピング）
  [ERROR_CODES.UNAUTHORIZED]: 'ログインが必要です。',
  [ERROR_CODES.FORBIDDEN_ERROR]: 'この操作を行う権限がありません。',
  [ERROR_CODES.VALIDATION_ERROR]: '入力内容に問題があります。もう一度確認してください。',
  [ERROR_CODES.CONFLICT_ERROR]: 'データが競合しています。',
  [ERROR_CODES.USER_NOT_FOUND]: 'ユーザーが見つかりません。',
  [ERROR_CODES.USER_ALREADY_EXISTS]: 'このユーザーは既に存在しています。',
  [ERROR_CODES.INVALID_USER_DATA]: 'ユーザー情報が正しくありません。',
  [ERROR_CODES.MATCH_NOT_FOUND]: 'マッチングが見つかりません。',
  [ERROR_CODES.SELF_MATCHING]: '自分自身とマッチングはできません。',
  [ERROR_CODES.UNKNOWN_ERROR]: '予期しないエラーが発生しました。'
};

/**
 * ユーザーIDエラーメッセージ（下位互換性用）
 */
export const USER_ID_ERROR_MESSAGE = ERROR_MESSAGES[ERROR_CODES.USER_ID_NOT_FOUND];

/**
 * 認証関連のエラーメッセージ（下位互換性用）
 * @deprecated 代わりにERROR_MESSAGESを使用してください
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_TOKEN: ERROR_MESSAGES[ERROR_CODES.AUTH_ERROR],
  EXPIRED_TOKEN: ERROR_MESSAGES[ERROR_CODES.AUTH_ERROR],
  MISSING_TOKEN: ERROR_MESSAGES[ERROR_CODES.AUTH_ERROR],
};

/**
 * ユーザー操作関連のエラーメッセージ（下位互換性用）
 * @deprecated 代わりにERROR_MESSAGESを使用してください
 */
export const USER_ERROR_MESSAGES = {
  USER_NOT_FOUND: ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND],
  USER_ALREADY_EXISTS: ERROR_MESSAGES[ERROR_CODES.USER_ALREADY_EXISTS],
  INVALID_USER_DATA: ERROR_MESSAGES[ERROR_CODES.INVALID_USER_DATA],
};

/**
 * マッチング関連のエラーメッセージ（下位互換性用）
 * @deprecated 代わりにERROR_MESSAGESを使用してください
 */
export const MATCHING_ERROR_MESSAGES = {
  ALREADY_MATCHED: ERROR_MESSAGES[ERROR_CODES.ALREADY_MATCHED],
  MATCH_NOT_FOUND: ERROR_MESSAGES[ERROR_CODES.MATCH_NOT_FOUND],
  SELF_MATCHING: ERROR_MESSAGES[ERROR_CODES.SELF_MATCHING],
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

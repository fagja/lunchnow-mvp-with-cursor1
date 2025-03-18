/**
 * API呼び出し共通関数
 */

import { ApiResponse, ApiError, ApiErrorCode } from '@/types/api.types';
import { getUserId, saveUserId, localStorageKeys } from '@/lib/utils';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';

// 拡張フェッチオプション型定義
type ExtendedFetchOptions = RequestInit & {
  timeout?: number;
};

/**
 * LocalStorageからユーザーIDを取得
 * @returns ユーザーID（存在しない場合はnull）
 */
export function getUserIdFromLocalStorage(): number | null {
  return getUserId();
}

/**
 * LocalStorageにユーザーIDを保存
 * @param userId ユーザーID
 */
export function saveUserIdToLocalStorage(userId: number): void {
  saveUserId(userId);
}

/**
 * ユーザーIDが存在しない場合のエラーレスポンスを生成
 * @returns エラーレスポンス
 */
export function createUserIdError<T>(): ApiResponse<T> {
  return {
    error: createApiError('unauthorized_error'),
    status: 401
  };
}

/**
 * GET リクエストを送信
 * @param url リクエスト先URL
 * @param options フェッチオプション
 */
export async function fetchApi<T>(url: string, options: ExtendedFetchOptions = {}): Promise<ApiResponse<T>> {
  const timeout = options.timeout || 10000; // デフォルト10秒タイムアウト

  try {
    // タイムアウト処理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // オプションをマージ
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal,
      ...options
    };

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    // HTTPエラーの処理
    if (!response.ok) {
      const errorCode = getErrorCodeFromStatus(response.status);
      return {
        error: createApiError(errorCode),
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      ...data,
      status: response.status,
    };
  } catch (error: any) {
    console.error(`API呼び出しエラー (GET ${url}):`, error);

    // エラーハンドリング
    const errorCode: ApiErrorCode = error.name === 'AbortError' ? 'timeout_error' : 'network_error';
    return {
      error: createApiError(errorCode),
      status: 500,
    };
  }
}

/**
 * POST リクエストを送信
 * @param url リクエスト先URL
 * @param body リクエストボディ
 * @param options フェッチオプション
 */
export async function postApi<T>(url: string, body: any, options: ExtendedFetchOptions = {}): Promise<ApiResponse<T>> {
  return sendRequestWithBody<T>('POST', url, body, options);
}

/**
 * PATCH リクエストを送信
 * @param url リクエスト先URL
 * @param body リクエストボディ
 * @param options フェッチオプション
 */
export async function patchApi<T>(url: string, body: any, options: ExtendedFetchOptions = {}): Promise<ApiResponse<T>> {
  return sendRequestWithBody<T>('PATCH', url, body, options);
}

/**
 * DELETE リクエストを送信
 * @param url リクエスト先URL
 * @param options フェッチオプション
 */
export async function deleteApi<T>(url: string, options: ExtendedFetchOptions = {}): Promise<ApiResponse<T>> {
  const fetchOptions: ExtendedFetchOptions = {
    ...options,
    method: 'DELETE',
  };
  return fetchApi<T>(url, fetchOptions);
}

/**
 * ボディを持つリクエスト（POST/PATCH）の共通処理
 */
async function sendRequestWithBody<T>(
  method: string,
  url: string,
  body: any,
  options: ExtendedFetchOptions = {}
): Promise<ApiResponse<T>> {
  const timeout = options.timeout || 10000; // デフォルト10秒タイムアウト

  try {
    // タイムアウト処理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // オプションをマージ
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      ...options
    };

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    // HTTPエラーの処理
    if (!response.ok) {
      const errorCode = getErrorCodeFromStatus(response.status);
      return {
        error: createApiError(errorCode),
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      ...data,
      status: response.status,
    };
  } catch (error: any) {
    console.error(`API呼び出しエラー (${method} ${url}):`, error);

    // エラーハンドリング
    const errorCode: ApiErrorCode = error.name === 'AbortError' ? 'timeout_error' : 'network_error';
    return {
      error: createApiError(errorCode),
      status: 500,
    };
  }
}

/**
 * APIエラーオブジェクトを作成
 */
function createApiError(code: ApiErrorCode): ApiError {
  const message = getErrorMessageFromCode(code);
  return { code, message };
}

/**
 * エラーコードからメッセージを取得
 */
function getErrorMessageFromCode(code: ApiErrorCode): string {
  switch (code) {
    case 'validation_error':
      return API_ERROR_MESSAGES.UNKNOWN_ERROR;
    case 'network_error':
      return API_ERROR_MESSAGES.NETWORK_ERROR;
    case 'timeout_error':
      return API_ERROR_MESSAGES.TIMEOUT_ERROR;
    case 'not_found':
      return '指定されたリソースは見つかりません';
    case 'unauthorized_error':
      return 'アクセス権限がありません';
    default:
      return API_ERROR_MESSAGES.UNKNOWN_ERROR;
  }
}

// HTTPステータスコードからエラーコードを取得関数の改善
function getErrorCodeFromStatus(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return 'validation_error';
    case 401:
      return 'unauthorized_error';
    case 403:
      return 'forbidden_error';
    case 404:
      return 'not_found';
    case 409:
      return 'conflict_error';
    default:
      return 'general_error';
  }
}

/**
 * API呼び出し共通関数
 */

import { ApiResponse, ApiError } from '@/types/api.types';
import { getUserId, saveUserId, localStorageKeys } from '@/lib/utils';

// 拡張フェッチオプション型定義
type ExtendedFetchOptions = RequestInit & {
  timeout?: number;
};

// エラーコード定義
export const errorCodes = {
  NETWORK_ERROR: 'network_error',
  TIMEOUT_ERROR: 'timeout_error',
  UNAUTHORIZED: 'unauthorized_error',
  NOT_FOUND: 'not_found_error',
  SERVER_ERROR: 'server_error',
  VALIDATION_ERROR: 'validation_error',
  UNKNOWN_ERROR: 'unknown_error'
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
    error: {
      code: errorCodes.UNAUTHORIZED,
      message: 'ユーザーIDが取得できません。再度ログインしてください。'
    },
    status: 401
  };
}

/**
 * ステータスコードからエラーコードを取得
 * @param status HTTPステータスコード
 */
export function getErrorCodeFromStatus(status: number): string {
  switch (true) {
    case status === 400:
      return errorCodes.VALIDATION_ERROR;
    case status === 401:
      return errorCodes.UNAUTHORIZED;
    case status === 404:
      return errorCodes.NOT_FOUND;
    case status >= 500:
      return errorCodes.SERVER_ERROR;
    default:
      return errorCodes.UNKNOWN_ERROR;
  }
}

/**
 * ステータスコードからエラーメッセージを取得
 * @param status HTTPステータスコード
 */
export function getErrorMessageFromStatus(status: number): string {
  switch (true) {
    case status === 400:
      return 'リクエストに問題があります。入力内容を確認してください。';
    case status === 401:
      return '認証に失敗しました。再度ログインしてください。';
    case status === 404:
      return 'リクエストされたリソースが見つかりません。';
    case status >= 500:
      return 'サーバーでエラーが発生しました。しばらく経ってからお試しください。';
    default:
      return '予期しないエラーが発生しました。';
  }
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
      const errorResponse: ApiResponse<T> = {
        error: {
          code: getErrorCodeFromStatus(response.status),
          message: getErrorMessageFromStatus(response.status)
        },
        status: response.status,
      };
      return errorResponse;
    }

    const data = await response.json();
    return {
      ...data,
      status: response.status,
    };
  } catch (error: any) {
    console.error(`API呼び出しエラー (GET ${url}):`, error);

    // エラーハンドリング
    const errorObj: ApiError = {
      code: error.name === 'AbortError' ? errorCodes.TIMEOUT_ERROR : errorCodes.NETWORK_ERROR,
      message: error.name === 'AbortError'
        ? 'リクエストがタイムアウトしました。ネットワーク接続を確認してください。'
        : 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
    };

    return {
      error: errorObj,
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
      const errorResponse: ApiResponse<T> = {
        error: {
          code: getErrorCodeFromStatus(response.status),
          message: getErrorMessageFromStatus(response.status)
        },
        status: response.status,
      };
      return errorResponse;
    }

    const data = await response.json();
    return {
      ...data,
      status: response.status,
    };
  } catch (error: any) {
    console.error(`API呼び出しエラー (${method} ${url}):`, error);

    // エラーハンドリング
    const errorObj: ApiError = {
      code: error.name === 'AbortError' ? errorCodes.TIMEOUT_ERROR : errorCodes.NETWORK_ERROR,
      message: error.name === 'AbortError'
        ? 'リクエストがタイムアウトしました。ネットワーク接続を確認してください。'
        : 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
    };

    return {
      error: errorObj,
      status: 500,
    };
  }
}

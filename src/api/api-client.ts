/**
 * API呼び出し共通関数
 */

import { ApiResponse, ApiError } from '@/types/api.types';
import { getUserId, saveUserId, localStorageKeys } from '@/lib/utils';
import { STORAGE_KEYS, USER_ID_ERROR_MESSAGE, ERROR_CODES, ERROR_MESSAGES } from "@/lib/constants";

// 拡張フェッチオプション型定義
type ExtendedFetchOptions = RequestInit & {
  timeout?: number;
};

/**
 * 外部APIのベースURL
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  ? process.env.NEXT_PUBLIC_API_BASE_URL
  : 'http://localhost:3000/api';

/**
 * ユーザーIDが存在しない場合のエラーレスポンスを生成
 * @returns エラーレスポンス
 */
export function createUserIdError<T>(): ApiResponse<T> {
  return {
    data: null,
    error: {
      code: ERROR_CODES.USER_ID_NOT_FOUND,
      message: USER_ID_ERROR_MESSAGE
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
      return ERROR_CODES.USER_INPUT_ERROR;
    case status === 401:
      return ERROR_CODES.AUTH_ERROR;
    case status === 403:
      return ERROR_CODES.AUTH_ERROR;
    case status === 404:
      return ERROR_CODES.NOT_FOUND;
    case status >= 500:
      return ERROR_CODES.SERVER_ERROR;
    default:
      return ERROR_CODES.SYSTEM_ERROR;
  }
}

/**
 * ステータスコードからエラーメッセージを取得
 * @param status HTTPステータスコード
 */
export function getErrorMessageFromStatus(status: number): string {
  switch (true) {
    case status === 400:
      return ERROR_MESSAGES[ERROR_CODES.USER_INPUT_ERROR];
    case status === 401:
      return ERROR_MESSAGES[ERROR_CODES.AUTH_ERROR];
    case status === 403:
      return ERROR_MESSAGES[ERROR_CODES.AUTH_ERROR];
    case status === 404:
      return ERROR_MESSAGES[ERROR_CODES.NOT_FOUND];
    case status >= 500:
      return ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR];
    default:
      return ERROR_MESSAGES[ERROR_CODES.SYSTEM_ERROR];
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
      code: error.name === 'AbortError' ? ERROR_CODES.TIMEOUT_ERROR : ERROR_CODES.NETWORK_ERROR,
      message: error.name === 'AbortError'
        ? ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR]
        : ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]
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
      code: error.name === 'AbortError' ? ERROR_CODES.TIMEOUT_ERROR : ERROR_CODES.NETWORK_ERROR,
      message: error.name === 'AbortError'
        ? ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR]
        : ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]
    };

    return {
      error: errorObj,
      status: 500,
    };
  }
}

/**
 * ユーザー認証用メソッド
 * @param idToken Firebase認証トークン
 * @returns APIレスポンス
 */
export async function authenticateUser(idToken: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (response.ok && data.data?.userId) {
      // ユーザーIDをLocalStorageに保存
      saveUserId(data.data.userId);
      return { success: true, userId: data.data.userId };
    } else {
      console.error('Authentication error:', data.error);
      return { success: false, error: data.error || '認証に失敗しました' };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: '認証処理中にエラーが発生しました' };
  }
}

/**
 * ユーザーログアウト用メソッド
 * @returns APIレスポンス
 */
export async function logoutUser() {
  try {
    // LocalStorageからユーザーIDを削除
    localStorage.removeItem(STORAGE_KEYS.USER_ID);

    // Cookieからも削除（サーバーサイドで削除処理が必要）
    document.cookie = `${STORAGE_KEYS.USER_ID}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'ログアウト処理中にエラーが発生しました' };
  }
}

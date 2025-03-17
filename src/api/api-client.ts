/**
 * API呼び出し共通関数
 */

import { ApiResponse } from '@/types/api.types';

// 拡張フェッチオプション型定義
type ExtendedFetchOptions = RequestInit & {
  timeout?: number;
};

/**
 * LocalStorageからユーザーIDを取得
 * @returns ユーザーID（存在しない場合はnull）
 */
export function getUserIdFromLocalStorage(): number | null {
  try {
    const userId = localStorage.getItem('lunchnow_user_id');
    return userId ? Number(userId) : null;
  } catch (error) {
    console.error('LocalStorage取得エラー:', error);
    return null;
  }
}

/**
 * LocalStorageにユーザーIDを保存
 * @param userId ユーザーID
 */
export function saveUserIdToLocalStorage(userId: number): void {
  try {
    localStorage.setItem('lunchnow_user_id', userId.toString());
  } catch (error) {
    console.error('LocalStorage保存エラー:', error);
  }
}

/**
 * ユーザーIDが存在しない場合のエラーレスポンスを生成
 * @returns エラーレスポンス
 */
export function createUserIdError<T>(): ApiResponse<T> {
  return {
    error: {
      code: 'unauthorized_error',
      message: 'ユーザーIDが取得できません。再度ログインしてください。'
    },
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
      return {
        error: {
          code: getErrorCodeFromStatus(response.status),
          message: getErrorMessageFromStatus(response.status)
        },
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
    return {
      error: {
        code: error.name === 'AbortError' ? 'timeout_error' : 'network_error',
        message: error.name === 'AbortError' ? 'リクエストがタイムアウトしました' : 'ネットワークエラーが発生しました'
      },
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
      return {
        error: {
          code: getErrorCodeFromStatus(response.status),
          message: getErrorMessageFromStatus(response.status)
        },
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
    return {
      error: {
        code: error.name === 'AbortError' ? 'timeout_error' : 'network_error',
        message: error.name === 'AbortError' ? 'リクエストがタイムアウトしました' : 'ネットワークエラーが発生しました'
      },
      status: 500,
    };
  }
}

/**
 * HTTPステータスコードからエラーコードを取得
 */
function getErrorCodeFromStatus(status: number): string {
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

/**
 * HTTPステータスコードからエラーメッセージを取得
 */
function getErrorMessageFromStatus(status: number): string {
  switch (status) {
    case 400:
      return '入力内容に誤りがあります';
    case 401:
      return '認証に失敗しました';
    case 403:
      return 'アクセス権限がありません';
    case 404:
      return 'リソースが見つかりません';
    case 409:
      return 'リソースが競合しています';
    default:
      return 'エラーが発生しました';
  }
}

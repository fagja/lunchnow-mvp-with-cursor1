/**
 * API呼び出し共通関数
 */

// 拡張フェッチオプション型定義
type ExtendedFetchOptions = RequestInit & {
  timeout?: number;
};

/**
 * GET リクエストを送信
 * @param url リクエスト先URL
 * @param options フェッチオプション
 */
export async function fetchApi<T>(url: string, options: ExtendedFetchOptions = {}): Promise<T> {
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

    // HTTPエラーの処理（シンプル化）
    if (!response.ok) {
      return {
        error: 'エラーが発生しました',
        status: response.status,
      } as T;
    }

    const data = await response.json();
    return {
      ...data,
      status: response.status,
    };
  } catch (error: any) {
    console.error(`API呼び出しエラー (GET ${url}):`, error);

    // エラーハンドリング（シンプル化）
    return {
      error: 'エラーが発生しました',
      status: 500,
    } as T;
  }
}

/**
 * POST リクエストを送信
 * @param url リクエスト先URL
 * @param body リクエストボディ
 * @param options フェッチオプション
 */
export async function postApi<T>(url: string, body: any, options: ExtendedFetchOptions = {}): Promise<T> {
  return sendRequestWithBody<T>('POST', url, body, options);
}

/**
 * PATCH リクエストを送信
 * @param url リクエスト先URL
 * @param body リクエストボディ
 * @param options フェッチオプション
 */
export async function patchApi<T>(url: string, body: any, options: ExtendedFetchOptions = {}): Promise<T> {
  return sendRequestWithBody<T>('PATCH', url, body, options);
}

/**
 * DELETE リクエストを送信
 * @param url リクエスト先URL
 * @param options フェッチオプション
 */
export async function deleteApi<T>(url: string, options: ExtendedFetchOptions = {}): Promise<T> {
  options.method = 'DELETE';
  return fetchApi<T>(url, options);
}

/**
 * ボディを持つリクエスト（POST/PATCH）の共通処理
 */
async function sendRequestWithBody<T>(
  method: string,
  url: string,
  body: any,
  options: ExtendedFetchOptions = {}
): Promise<T> {
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

    // HTTPエラーの処理（シンプル化）
    if (!response.ok) {
      return {
        error: 'エラーが発生しました',
        status: response.status,
      } as T;
    }

    const data = await response.json();
    return {
      ...data,
      status: response.status,
    };
  } catch (error: any) {
    console.error(`API呼び出しエラー (${method} ${url}):`, error);

    // エラーハンドリング（シンプル化）
    return {
      error: 'エラーが発生しました',
      status: 500,
    } as T;
  }
}

/**
 * LocalStorageからユーザーIDを取得
 */
export function getUserIdFromLocalStorage(): number | null {
  if (typeof window === 'undefined') return null;

  try {
    const userId = localStorage.getItem('userId');
    return userId ? Number(userId) : null;
  } catch (error) {
    console.error('LocalStorageからのユーザーID取得エラー:', error);
    return null;
  }
}

/**
 * LocalStorageにユーザーIDを保存
 */
export function saveUserIdToLocalStorage(userId: number): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('userId', userId.toString());
  } catch (error) {
    console.error('LocalStorageへのユーザーID保存エラー:', error);
  }
}

/**
 * API呼び出し共通関数
 */

/**
 * GET リクエストを送信
 */
export async function fetchApi<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return {
      ...data,
      status: response.status,
    };
  } catch (error) {
    console.error(`API呼び出しエラー (GET ${url}):`, error);
    return {
      error: '通信エラーが発生しました',
      status: 500,
    } as T;
  }
}

/**
 * POST リクエストを送信
 */
export async function postApi<T>(url: string, body: any): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return {
      ...data,
      status: response.status,
    };
  } catch (error) {
    console.error(`API呼び出しエラー (POST ${url}):`, error);
    return {
      error: '通信エラーが発生しました',
      status: 500,
    } as T;
  }
}

/**
 * PATCH リクエストを送信
 */
export async function patchApi<T>(url: string, body: any): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return {
      ...data,
      status: response.status,
    };
  } catch (error) {
    console.error(`API呼び出しエラー (PATCH ${url}):`, error);
    return {
      error: '通信エラーが発生しました',
      status: 500,
    } as T;
  }
}

/**
 * LocalStorageからユーザーIDを取得
 */
export function getUserIdFromLocalStorage(): number | null {
  if (typeof window === 'undefined') return null;
  
  const userId = localStorage.getItem('userId');
  return userId ? Number(userId) : null;
}

/**
 * LocalStorageにユーザーIDを保存
 */
export function saveUserIdToLocalStorage(userId: number): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('userId', userId.toString());
}
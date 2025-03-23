'use client';

import { SWRResponse, SWRConfiguration } from 'swr';
import useSWRBase from 'swr';
import { getClientUserId } from './utils';
import { ERROR_CODES, ERROR_MESSAGES } from './constants';
import { ApiResponse } from '@/types/api.types';

/**
 * APIのデフォルトベースURL
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
  : 'http://localhost:3000/api';

/**
 * SWR用のフェッチャー関数
 */
const fetcher = async (url: string) => {
  const res = await fetch(url.startsWith('/') ? `/api${url}` : url);

  if (!res.ok) {
    const error = new Error('APIリクエストに失敗しました');
    const errorData = await res.json();
    (error as any).info = errorData;
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};

/**
 * 認証チェック付きSWRカスタムフック
 */
export function useSWRWithAuth<T = any>(
  key: string | null,
  config?: SWRConfiguration
): SWRResponse<T> {
  // キーがnullの場合（ユーザーIDが取得できない場合など）はリクエストしない
  return useSWRBase<T>(key, fetcher, {
    onErrorRetry: (error: any, key: any, config: any, revalidate: any, { retryCount }: { retryCount: any }) => {
      // 認証エラー（401）の場合はリトライしない
      if (error.status === 401) return;

      // 5回以上のリトライは行わない
      if (retryCount >= 5) return;

      // 指数バックオフで再試行
      setTimeout(() => revalidate({ retryCount }), 5000 * (2 ** retryCount));
    },
    ...config,
  });
}

/**
 * 標準SWRカスタムフック
 */
export function useSWR<T = any>(
  key: string | null,
  config?: SWRConfiguration
): SWRResponse<T> {
  return useSWRWithAuth<T>(key, config);
}

/**
 * ユーザーIDがない場合のエラーレスポンスを作成
 */
export function createNoUserIdError<T>(): ApiResponse<T> {
  return {
    error: {
      code: ERROR_CODES.AUTH_ERROR,
      message: ERROR_MESSAGES[ERROR_CODES.AUTH_ERROR]
    },
    status: 401,
    data: undefined
  };
}

/**
 * GET APIリクエスト関数
 */
export async function fetchApi<T = any>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const userId = getClientUserId();

  // ユーザーIDが必要なAPIの場合はチェック
  if (url.includes('/api/users') || url.includes('/api/matches') || url.includes('/api/likes')) {
    if (!userId) {
      return createNoUserIdError<T>();
    }
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      error: {
        code: ERROR_CODES.SYSTEM_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.SYSTEM_ERROR]
      },
      status: 500,
      data: undefined
    };
  }
}

/**
 * POST APIリクエスト関数
 */
export async function postApi<T = any>(url: string, data: any, options?: RequestInit): Promise<ApiResponse<T>> {
  const userId = getClientUserId();

  // ユーザーIDが必要なAPIの場合はチェック
  if (url.includes('/api/users') || url.includes('/api/matches') || url.includes('/api/likes')) {
    if (!userId) {
      return createNoUserIdError<T>();
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...options,
    });

    return await response.json();
  } catch (error) {
    console.error('API post error:', error);
    return {
      error: {
        code: ERROR_CODES.SYSTEM_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.SYSTEM_ERROR]
      },
      status: 500,
      data: undefined
    };
  }
}

/**
 * PATCH APIリクエスト関数
 */
export async function patchApi<T = any>(url: string, data: any, options?: RequestInit): Promise<ApiResponse<T>> {
  const userId = getClientUserId();

  // ユーザーIDが必要なAPIの場合はチェック
  if (url.includes('/api/users') || url.includes('/api/matches') || url.includes('/api/likes')) {
    if (!userId) {
      return createNoUserIdError<T>();
    }
  }

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...options,
    });

    return await response.json();
  } catch (error) {
    console.error('API patch error:', error);
    return {
      error: {
        code: ERROR_CODES.SYSTEM_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.SYSTEM_ERROR]
      },
      status: 500,
      data: undefined
    };
  }
}

/**
 * DELETE APIリクエスト関数
 */
export async function deleteApi<T = any>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const userId = getClientUserId();

  // ユーザーIDが必要なAPIの場合はチェック
  if (url.includes('/api/users') || url.includes('/api/matches') || url.includes('/api/likes')) {
    if (!userId) {
      return createNoUserIdError<T>();
    }
  }

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    return await response.json();
  } catch (error) {
    console.error('API delete error:', error);
    return {
      error: {
        code: ERROR_CODES.SYSTEM_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.SYSTEM_ERROR]
      },
      status: 500,
      data: undefined
    };
  }
}

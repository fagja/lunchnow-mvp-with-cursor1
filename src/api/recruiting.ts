import { SWRResponse, SWRConfiguration } from 'swr';
import { API_BASE_URL, useSWR, createNoUserIdError } from '@/lib/api';
import { getClientUserId } from '@/lib/utils';
import { ApiResponse } from '@/types/api.types';
import { userListConfig, profileConfig } from '@/lib/swr-config';

/**
 * SWRの設定オプション
 */
export const swrOptions = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  revalidateOnReconnect: true,
  dedupingInterval: 10000, // 10秒間の重複リクエスト防止
};

/**
 * ランチ募集中ユーザー一覧を取得するSWRキーを生成
 */
export function getRecruitingUsersKey(page = 1, limit = 10, filters?: { [key: string]: any }) {
  const params = new URLSearchParams();

  params.append('page', page.toString());
  params.append('limit', limit.toString());

  // 追加のフィルタリングパラメータがあれば追加
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }

  return `/users/recruiting?${params.toString()}`;
}

/**
 * ランチ募集中ユーザー一覧を取得するカスタムフック
 * @param page ページ番号
 * @param limit 1ページあたりの件数
 * @param filters フィルターオプション
 * @param options SWRオプション（fallbackDataなど）
 */
export function useRecruitingUsers(
  page = 1,
  limit = 10,
  filters?: { [key: string]: any },
  options?: SWRConfiguration
): SWRResponse {
  return useSWR(getRecruitingUsersKey(page, limit, filters), {
    ...userListConfig,
    ...options,
  });
}

/**
 * 特定のユーザーのプロフィールを取得するSWRキーを生成
 */
export function getUserProfileKey(userId: number) {
  return `/users/${userId}`;
}

/**
 * 特定のユーザーのプロフィールを取得するカスタムフック
 */
export function useUserProfile(userId: number): SWRResponse {
  return useSWR(getUserProfileKey(userId), {
    ...profileConfig,
  });
}

/**
 * 現在のユーザー自身のプロフィールを取得するSWRキーを生成
 */
export function getMyProfileKey() {
  const userId = getClientUserId();
  if (!userId) return null;
  return `/users/me`;
}

/**
 * 現在のユーザー自身のプロフィールを取得するカスタムフック
 */
export function useMyProfile(): SWRResponse {
  return useSWR(getMyProfileKey(), {
    ...profileConfig,
  });
}

/**
 * サーバーコンポーネントで使用するランチ募集中ユーザー一覧取得関数
 */
export async function getRecruitingUsers(page = 1, limit = 10, filters?: { [key: string]: any }) {
  const url = `${API_BASE_URL}${getRecruitingUsersKey(page, limit, filters)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // サーバーコンポーネントでのデータ取得のためキャッシュ無効化
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`APIリクエストエラー: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('募集中ユーザー取得エラー:', error);
    return {
      error: {
        code: 'server_error',
        message: 'ユーザー情報の取得に失敗しました。'
      },
      status: 500,
      data: null
    };
  }
}

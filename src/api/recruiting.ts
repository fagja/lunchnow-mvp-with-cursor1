import { SWRResponse } from 'swr';
import { API_BASE_URL, useSWR, createNoUserIdError } from '@/lib/api';
import { getUserId } from '@/lib/utils';
import { ApiResponse } from '@/types/api.types';

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
 */
export function useRecruitingUsers(page = 1, limit = 10, filters?: { [key: string]: any }): SWRResponse {
  return useSWR(getRecruitingUsersKey(page, limit, filters), {
    ...swrOptions,
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
    ...swrOptions,
  });
}

/**
 * 現在のユーザー自身のプロフィールを取得するSWRキーを生成
 */
export function getMyProfileKey() {
  const userId = getUserId();
  if (!userId) return null;
  return `/users/me`;
}

/**
 * 現在のユーザー自身のプロフィールを取得するカスタムフック
 */
export function useMyProfile(): SWRResponse {
  return useSWR(getMyProfileKey(), {
    ...swrOptions,
  });
}
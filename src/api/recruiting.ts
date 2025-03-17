import { RecruitingUsersResponse } from '@/types/api.types';
import { fetchApi, getUserIdFromLocalStorage } from './api-client';

/**
 * 募集中ユーザー一覧取得関数
 * SWRと組み合わせて使用するためのフェッチャー
 */
export async function fetchRecruitingUsers(): Promise<RecruitingUsersResponse> {
  const currentUserId = getUserIdFromLocalStorage();
  
  if (!currentUserId) {
    return {
      error: 'ユーザーIDが取得できません',
      status: 400
    };
  }
  
  return fetchApi<RecruitingUsersResponse>(`/api/users/recruiting?currentUserId=${currentUserId}`);
}

/**
 * 募集中ユーザー一覧をSWRで取得するためのキー生成関数
 */
export function getRecruitingUsersKey() {
  const currentUserId = getUserIdFromLocalStorage();
  if (!currentUserId) return null;
  
  return `/api/users/recruiting?currentUserId=${currentUserId}`;
}
import { SWRResponse } from 'swr';
import { API_BASE_URL, createNoUserIdError, useSWR } from '@/lib/api';
import { getUserId } from '@/lib/utils';
import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/constants';
import { ApiResponse } from '@/types/api.types';

/**
 * いいねを作成するAPI
 * @param targetUserId いいね対象のユーザーID
 * @returns APIレスポンス
 */
export async function createLike(targetUserId: number): Promise<ApiResponse<any>> {
  const userId = getUserId();
  if (!userId) {
    return createNoUserIdError();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceUserId: userId,
        targetUserId,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating like:', error);
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
 * 送信したいいね一覧を取得するSWRキーを生成
 */
export function getSentLikesKey(page = 1, limit = 10) {
  const userId = getUserId();
  if (!userId) return null;
  return `/likes/sent?sourceUserId=${userId}&page=${page}&limit=${limit}`;
}

/**
 * 送信したいいね一覧を取得するカスタムフック
 */
export function useSentLikes(page = 1, limit = 10): SWRResponse {
  return useSWR(getSentLikesKey(page, limit));
}

/**
 * 受信したいいね一覧を取得するSWRキーを生成
 */
export function getReceivedLikesKey(page = 1, limit = 10) {
  const userId = getUserId();
  if (!userId) return null;
  return `/likes/received?targetUserId=${userId}&page=${page}&limit=${limit}`;
}

/**
 * 受信したいいね一覧を取得するカスタムフック
 */
export function useReceivedLikes(page = 1, limit = 10): SWRResponse {
  return useSWR(getReceivedLikesKey(page, limit));
}

/**
 * 特定のユーザーへのいいねが存在するか確認するSWRキーを生成
 */
export function getLikeExistsKey(targetUserId: number) {
  const userId = getUserId();
  if (!userId) return null;
  return `/likes/exists?sourceUserId=${userId}&targetUserId=${targetUserId}`;
}

/**
 * 特定のユーザーへのいいねが存在するか確認するカスタムフック
 */
export function useLikeExists(targetUserId: number): SWRResponse {
  return useSWR(getLikeExistsKey(targetUserId));
}

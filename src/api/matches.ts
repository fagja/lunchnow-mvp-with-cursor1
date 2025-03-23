import { SWRResponse } from 'swr';
import { API_BASE_URL, createNoUserIdError, useSWR } from '@/lib/api';
import { getUserId } from '@/lib/utils';
import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/constants';
import { ApiResponse } from '@/types/api.types';
import { matchingConfig } from '@/lib/swr-config';

/**
 * マッチを作成するAPI
 * @param userId1 ユーザー1のID
 * @param userId2 ユーザー2のID
 * @returns APIレスポンス
 */
export async function createMatch(userId1: number, userId2: number): Promise<ApiResponse<any>> {
  const currentUserId = getUserId();
  if (!currentUserId) {
    return createNoUserIdError();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId1,
        userId2,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating match:', error);
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
 * ユーザーのマッチ一覧を取得するSWRキーを生成
 */
export function getMatchesKey(page = 1, limit = 10) {
  const userId = getUserId();
  if (!userId) return null;
  return `/matches?page=${page}&limit=${limit}`;
}

/**
 * ユーザーのマッチ一覧を取得するカスタムフック
 */
export function useMatches(page = 1, limit = 10): SWRResponse {
  return useSWR(getMatchesKey(page, limit), {
    ...matchingConfig,
  });
}

/**
 * 特定のマッチの詳細を取得するSWRキーを生成
 */
export function getMatchDetailKey(matchId: number) {
  const userId = getUserId();
  if (!userId) return null;
  return `/matches/${matchId}`;
}

/**
 * 特定のマッチの詳細を取得するカスタムフック
 */
export function useMatchDetail(matchId: number): SWRResponse {
  return useSWR(getMatchDetailKey(matchId), {
    ...matchingConfig,
  });
}

/**
 * ユーザー間のマッチ状態を確認するSWRキーを生成
 */
export function getMatchStatusKey(otherUserId: number) {
  const userId = getUserId();
  if (!userId) return null;
  return `/matches/status/${otherUserId}`;
}

/**
 * ユーザー間のマッチ状態を確認するカスタムフック
 */
export function useMatchStatus(otherUserId: number): SWRResponse {
  return useSWR(getMatchStatusKey(otherUserId), {
    ...matchingConfig,
  });
}

/**
 * マッチを更新するAPI（ステータス変更など）
 */
export async function updateMatch(matchId: number, updateData: { status?: string }): Promise<ApiResponse<any>> {
  const userId = getUserId();
  if (!userId) {
    return createNoUserIdError();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...updateData,
        userId // 認証用
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error updating match:', error);
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

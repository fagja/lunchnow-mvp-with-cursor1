import { MatchResponse, MatchesResponse, MatchedUserResponse } from '@/types/api.types';
import { fetchApi, patchApi } from './api-client';
import { getUserId, validateUserId } from '@/lib/storage-utils';

/**
 * APIのベースURL
 */
const API_BASE_URL = '/api/matches';

/**
 * ユーザーIDが存在しない場合のエラーレスポンスを生成
 */
const createUserIdError = (): MatchResponse => ({
  error: 'ユーザーIDが取得できません。再度ログインしてください。',
  status: 401
});

/**
 * 現在のマッチング情報取得関数
 * @returns マッチング情報
 */
export async function fetchCurrentMatch(): Promise<MatchedUserResponse> {
  const userId = getUserId();

  if (!userId) {
    return createUserIdError();
  }

  return fetchApi<MatchedUserResponse>(`${API_BASE_URL}/current?userId=${userId}`);
}

/**
 * マッチングキャンセル関数
 * @param matchId マッチID
 * @returns キャンセル結果
 */
export async function cancelMatch(matchId: number): Promise<MatchResponse> {
  const userId = getUserId();

  if (!userId) {
    return createUserIdError();
  }

  return patchApi<MatchResponse>(`${API_BASE_URL}/${matchId}/cancel`, { userId });
}

/**
 * マッチング履歴取得関数
 * @returns マッチング履歴
 */
export async function fetchMatchHistory(): Promise<MatchesResponse> {
  const userId = getUserId();

  if (!userId) {
    return createUserIdError();
  }

  return fetchApi<MatchesResponse>(`${API_BASE_URL}/history?userId=${userId}`);
}

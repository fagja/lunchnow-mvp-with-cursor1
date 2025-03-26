import { MatchResponse, MatchesResponse, MatchedUserResponse } from '@/types/api.types';
import { fetchApi, postApi, createUserIdError } from './api-client';
import { getUserId, validateUserId } from '@/lib/storage-utils';
import { Match, MatchedUser } from '@/types/database.types';

/**
 * APIのベースURL
 */
const API_BASE_URL = '/api/matches';

/**
 * 現在のマッチング情報取得関数
 * @returns マッチング情報
 */
export async function fetchCurrentMatch(): Promise<MatchedUserResponse> {
  const userId = getUserId();

  if (!userId) {
    return createUserIdError<MatchedUser>();
  }

  return fetchApi<MatchedUser>(`${API_BASE_URL}/current?userId=${userId}`);
}

/**
 * マッチングキャンセル関数
 * @param matchId マッチID
 * @returns キャンセル結果
 */
export async function cancelMatch(matchId: number): Promise<MatchResponse> {
  const userId = getUserId();

  if (!userId) {
    return createUserIdError<Match>();
  }

  return postApi<Match>(`${API_BASE_URL}/${matchId}/cancel`, { userId });
}

/**
 * マッチング履歴取得関数
 * @returns マッチング履歴
 */
export async function fetchMatchHistory(): Promise<MatchesResponse> {
  const userId = getUserId();

  if (!userId) {
    return createUserIdError<Match[]>();
  }

  return fetchApi<Match[]>(`${API_BASE_URL}/history?userId=${userId}`);
}

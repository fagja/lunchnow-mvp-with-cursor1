import { MatchResponse } from '@/types/api.types';
import { fetchApi, postApi, getUserIdFromLocalStorage } from './api-client';

/**
 * APIのベースURL
 */
const API_BASE_URL = '/api/matches';

/**
 * 相互いいね判定とマッチング登録関数
 * @param toUserId マッチング相手のユーザーID
 * @returns マッチング結果
 */
export async function createMatch(userId1: number, userId2: number): Promise<MatchResponse> {
  const matchData = {
    userId1,
    userId2
  };

  return postApi<MatchResponse>(API_BASE_URL, matchData);
}

/**
 * マッチング取得関数
 * @param userId ユーザーID
 * @returns マッチング情報
 */
export async function getMatchByUserId(userId: number): Promise<MatchResponse> {
  return fetchApi<MatchResponse>(`${API_BASE_URL}?userId=${userId}`);
}

/**
 * 自分のマッチング取得関数
 * @returns マッチング情報
 */
export async function getMyMatch(): Promise<MatchResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return {
      error: 'ユーザーIDが取得できません',
      status: 400
    };
  }

  return getMatchByUserId(userId);
}

/**
 * マッチングキャンセル関数
 * @param matchId マッチングID
 * @returns キャンセル処理結果
 */
export async function cancelMatch(matchId: number): Promise<MatchResponse> {
  return postApi<MatchResponse>(`${API_BASE_URL}/${matchId}/cancel`, {});
}

import { MatchResponse, MatchesResponse, MatchedUserResponse } from '@/types/api.types';
import { fetchApi, patchApi, getUserIdFromLocalStorage } from './api-client';

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
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return createUserIdError();
  }

  return fetchApi<MatchedUserResponse>(`${API_BASE_URL}/current?userId=${userId}`);
}

/**
 * マッチング履歴取得関数
 * @returns マッチング履歴一覧
 */
export async function fetchMatchHistory(): Promise<MatchesResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return createUserIdError();
  }

  return fetchApi<MatchesResponse>(`${API_BASE_URL}/history`);
}

/**
 * マッチングキャンセル関数
 * @param matchId キャンセルするマッチングID
 * @returns キャンセル結果
 */
export async function cancelMatch(matchId: number): Promise<MatchResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return createUserIdError();
  }

  return patchApi<MatchResponse>(`${API_BASE_URL}/${matchId}/cancel`, { userId });
}

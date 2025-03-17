import {
  CreateMatchRequest,
  LikeResponse,
  MatchResponse,
  MatchesResponse
} from '@/types/api.types';
import {
  fetchApi,
  postApi,
  getUserIdFromLocalStorage,
  createUserIdError
} from './api-client';

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
 * マッチング作成関数（いいね送信）
 * @param toUserId いいねを送る相手のユーザーID
 * @returns いいね結果
 */
export async function createMatch(toUserId: number): Promise<LikeResponse> {
  const fromUserId = getUserIdFromLocalStorage();

  if (!fromUserId) {
    return createUserIdError<LikeResponse>();
  }

  const matchData: CreateMatchRequest = {
    from_user_id: fromUserId,
    to_user_id: toUserId
  };

  return postApi<LikeResponse>('/api/matches', matchData);
}

/**
 * マッチング一覧取得関数
 * @param page ページ番号（1始まり、デフォルト1）
 * @param limit 1ページあたりの件数（デフォルト10、最大50）
 * @returns マッチング一覧
 */
export async function fetchMatches(
  page: number = 1,
  limit: number = 10
): Promise<MatchesResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return createUserIdError<MatchesResponse>();
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  return fetchApi<MatchesResponse>(`/api/matches?${queryParams.toString()}`);
}

/**
 * マッチング詳細取得関数
 * @param matchId マッチングID
 * @returns マッチング詳細
 */
export async function fetchMatch(matchId: number): Promise<MatchResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return createUserIdError<MatchResponse>();
  }

  return fetchApi<MatchResponse>(`/api/matches/${matchId}`);
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
    return createUserIdError();
  }

  return getMatchByUserId(userId);
}

/**
 * マッチングキャンセル関数
 * @param matchId マッチングID
 * @returns キャンセル処理結果
 */
export async function cancelMatch(matchId: number): Promise<MatchResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return createUserIdError();
  }

  const cancelData: CancelMatchRequest = { userId };
  return postApi<MatchResponse>(`${API_BASE_URL}/${matchId}/cancel`, cancelData);
}

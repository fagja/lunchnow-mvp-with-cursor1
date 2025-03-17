import { LikeResponse, CreateLikeRequest } from '@/types/api.types';
import { fetchApi, postApi, getUserIdFromLocalStorage } from './api-client';

/**
 * APIのベースURL
 */
const API_BASE_URL = '/api/likes';

/**
 * いいね登録関数
 * @param toUserId いいねを送るユーザーID
 */
export async function createLike(toUserId: number): Promise<LikeResponse> {
  const fromUserId = getUserIdFromLocalStorage();

  if (!fromUserId) {
    return {
      error: 'エラーが発生しました',
      status: 400
    };
  }

  const likeData: CreateLikeRequest = {
    fromUserId,
    toUserId
  };

  return postApi<LikeResponse>(API_BASE_URL, likeData);
}

/**
 * 送信したいいね一覧取得関数
 * @param date 日付（指定がなければ本日）
 */
export async function fetchSentLikes(date?: string): Promise<LikeResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return {
      error: 'エラーが発生しました',
      status: 400
    };
  }

  const queryParams = new URLSearchParams({
    fromUserId: userId.toString()
  });

  if (date) {
    queryParams.append('date', date);
  }

  return fetchApi<LikeResponse>(`${API_BASE_URL}?${queryParams.toString()}`);
}

/**
 * 受け取ったいいね一覧取得関数
 * @param date 日付（指定がなければ本日）
 */
export async function fetchReceivedLikes(date?: string): Promise<LikeResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return {
      error: 'エラーが発生しました',
      status: 400
    };
  }

  const queryParams = new URLSearchParams({
    toUserId: userId.toString()
  });

  if (date) {
    queryParams.append('date', date);
  }

  return fetchApi<LikeResponse>(`${API_BASE_URL}?${queryParams.toString()}`);
}

/**
 * 特定ユーザー間のいいね確認関数
 * @param fromUserId 送信元ユーザーID
 * @param toUserId 送信先ユーザーID
 * @param date 日付（指定がなければ本日）
 */
export async function checkLikeExists(
  fromUserId: number,
  toUserId: number,
  date?: string
): Promise<boolean> {
  const queryParams = new URLSearchParams({
    fromUserId: fromUserId.toString(),
    toUserId: toUserId.toString()
  });

  if (date) {
    queryParams.append('date', date);
  }

  const response = await fetchApi<LikeResponse>(`${API_BASE_URL}?${queryParams.toString()}`);

  // エラーまたはデータがない場合はfalse
  if (!response.data || response.error) {
    return false;
  }

  // いいねが1件以上あればtrue
  return Array.isArray(response.data) && response.data.length > 0;
}

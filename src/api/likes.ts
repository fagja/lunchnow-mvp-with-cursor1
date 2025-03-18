import { LikeResponse, CreateLikeRequest } from '@/types/api.types';
import { fetchApi, postApi, getUserIdFromLocalStorage } from './api-client';

/**
 * APIのベースURL
 */
const API_BASE_URL = '/api/likes';

/**
 * ユーザーIDが存在しない場合のエラーレスポンスを生成
 */
const createUserIdError = (): LikeResponse => ({
  error: 'ユーザーIDが取得できません。再度ログインしてください。',
  status: 401
});

/**
 * いいね送信関数
 * @param toUserId いいねを送信する相手のユーザーID
 * @returns 送信結果（matchプロパティがtrueならマッチング成立）
 */
export async function createLike(toUserId: number): Promise<LikeResponse> {
  const fromUserId = getUserIdFromLocalStorage();

  if (!fromUserId) {
    return createUserIdError();
  }

  const likeData: CreateLikeRequest = {
    fromUserId,
    toUserId
  };

  return postApi<LikeResponse>(API_BASE_URL, likeData);
}

/**
 * ユーザーが送ったいいね一覧取得関数
 * @returns いいね一覧
 */
export async function fetchSentLikes(): Promise<LikeResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return createUserIdError();
  }

  return fetchApi<LikeResponse>(`${API_BASE_URL}/sent`);
}

/**
 * ユーザーが受け取ったいいね一覧取得関数
 * @returns いいね一覧
 */
export async function fetchReceivedLikes(): Promise<LikeResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return createUserIdError();
  }

  return fetchApi<LikeResponse>(`${API_BASE_URL}/received`);
}
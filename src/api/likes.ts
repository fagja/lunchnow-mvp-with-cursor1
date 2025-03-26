import { LikeResponse, CreateLikeRequest, ApiResponse, LikeWithMatch } from '@/types/api.types';
import { Like } from '@/types/database.types';
import { fetchApi, postApi, createUserIdError } from './api-client';
import { getUserId, validateUserId } from '@/lib/storage-utils';

/**
 * APIのベースURL
 */
const API_BASE_URL = '/api/likes';

/**
 * いいね送信関数
 * @param toUserId いいねを送信する相手のユーザーID
 * @returns 送信結果（matchプロパティがtrueならマッチング成立）
 */
export async function createLike(toUserId: number): Promise<LikeResponse> {
  const fromUserId = getUserId();

  if (!fromUserId) {
    return createUserIdError<Like | LikeWithMatch>();
  }

  const likeData: CreateLikeRequest = {
    fromUserId,
    toUserId
  };

  return postApi<Like | LikeWithMatch>(API_BASE_URL, likeData);
}

/**
 * 自分が送信したいいね一覧取得関数
 * @returns いいね一覧
 */
export async function fetchSentLikes(): Promise<LikeResponse> {
  const userId = getUserId();

  if (!userId) {
    return createUserIdError<Like | LikeWithMatch>();
  }

  return fetchApi<Like | LikeWithMatch>(`${API_BASE_URL}/sent?userId=${userId}`);
}

/**
 * 自分が受け取ったいいね一覧取得関数
 * @returns いいね一覧
 */
export async function fetchReceivedLikes(): Promise<LikeResponse> {
  const userId = getUserId();

  if (!userId) {
    return createUserIdError<Like | LikeWithMatch>();
  }

  return fetchApi<Like | LikeWithMatch>(`${API_BASE_URL}/received?userId=${userId}`);
}

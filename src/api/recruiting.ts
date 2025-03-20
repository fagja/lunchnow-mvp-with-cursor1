import { RecruitingUsersResponse } from '@/types/api.types';
import { fetchApi } from './api-client';
import { getUserId, validateUserId } from '@/lib/storage-utils';

/**
 * APIのベースURL
 */
const API_BASE_URL = '/api/recruiting';

/**
 * 募集中ユーザー一覧取得関数
 * @returns 募集中ユーザー一覧
 */
export async function fetchRecruitingUsers(): Promise<RecruitingUsersResponse> {
  const currentUserId = getUserId();

  if (!currentUserId) {
    return {
      error: 'ユーザーIDが取得できません。再度ログインしてください。',
      status: 401
    };
  }

  return fetchApi<RecruitingUsersResponse>(`${API_BASE_URL}/users?currentUserId=${currentUserId}`);
}

/**
 * 指定時間内に募集状態を更新したユーザー取得関数
 *
 * 自分のIDと異なるユーザーを取得
 * マッチング済みのユーザーは除外
 *
 * @param minutes 何分以内の更新かを指定（デフォルト20分）
 * @returns 募集中ユーザー一覧
 */
export async function fetchRecentRecruitingUsers(
  minutes: number = 20
): Promise<RecruitingUsersResponse> {
  const currentUserId = getUserId();

  if (!currentUserId) {
    return {
      error: 'ユーザーIDが取得できません。再度ログインしてください。',
      status: 401
    };
  }

  return fetchApi<RecruitingUsersResponse>(
    `${API_BASE_URL}/users/recent?currentUserId=${currentUserId}&minutes=${minutes}`
  );
}

/**
 * 募集中ユーザーリスト取得のデフォルトキャッシュ時間（秒）
 */
const DEFAULT_CACHE_TIME = 30; // 30秒

/**
 * 募集中ユーザー一覧取得関数
 * SWRと組み合わせて使用するためのフェッチャー
 * @param url - SWRによって生成されたキー
 * @returns 募集中ユーザー一覧のレスポンス
 */
export async function fetchRecruitingUsers(url?: string): Promise<RecruitingUsersResponse> {
  const currentUserId = getUserId();

  if (!currentUserId) {
    return {
      error: 'エラーが発生しました',
      status: 400
    };
  }

  // URLが指定されている場合はそのまま使用、ない場合は生成
  const apiUrl = url || `${API_BASE_URL}/users?currentUserId=${currentUserId}`;

  try {
    return await fetchApi<RecruitingUsersResponse>(apiUrl, {
      // キャッシュ制御ヘッダー設定
      cache: 'no-cache' // 常に最新データを取得
    });
  } catch (error) {
    console.error('募集中ユーザー取得エラー:', error);
    return {
      error: 'エラーが発生しました',
      status: 500
    };
  }
}

/**
 * 募集中ユーザー一覧をSWRで取得するためのキー生成関数
 * @returns SWRのキー、またはnull（ユーザーIDが取得できない場合）
 */
export function getRecruitingUsersKey() {
  const currentUserId = getUserId();
  if (!currentUserId) return null;

  return `${API_BASE_URL}/users?currentUserId=${currentUserId}`;
}

/**
 * SWR設定オプションを生成する関数
 * @param refreshInterval - 自動更新間隔（ミリ秒）
 * @returns SWR設定オプション
 */
export function getRecruitingSwrOptions(refreshInterval: number = DEFAULT_CACHE_TIME * 1000) {
  return {
    refreshInterval, // 自動更新間隔
    revalidateOnFocus: true, // フォーカス時に再検証
    revalidateOnReconnect: true, // 再接続時に再検証
    errorRetryCount: 3 // エラー時のリトライ回数
  };
}

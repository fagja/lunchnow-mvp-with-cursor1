import { cookies } from 'next/headers';
import { STORAGE_KEYS } from './constants';

/**
 * サーバー側非同期コンテキスト用のユーザーID取得関数
 * API RouteやServerActionsで使用
 *
 * @returns Cookieから取得したユーザーID、存在しない場合はnull
 */
export async function getServerUserIdAsync(): Promise<number | null> {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get(STORAGE_KEYS.USER_ID);

  if (!userIdCookie) return null;

  const userId = parseInt(userIdCookie.value, 10);
  return isNaN(userId) ? null : userId;
}

/**
 * サーバーコンポーネント用のユーザーID取得関数
 * サーバーコンポーネントでのみ使用可能
 *
 * @returns Cookieから取得したユーザーID、存在しない場合はnull
 */
export function getServerUserId(): number | null {
  const cookieStore = cookies();
  const userIdCookie = cookieStore.get(STORAGE_KEYS.USER_ID);

  if (!userIdCookie) return null;

  const userId = parseInt(userIdCookie.value, 10);
  return isNaN(userId) ? null : userId;
}

/**
 * サーバー側でリクエストユーザーIDとCookieのユーザーIDを検証する関数
 *
 * @param requestUserId リクエストに含まれるユーザーID
 * @returns 検証結果（成功/失敗）とユーザーID
 */
export async function verifyServerUserId(requestUserId: number): Promise<{ isValid: boolean; userId: number | null }> {
  const authenticatedUserId = await getServerUserIdAsync();

  if (!authenticatedUserId) {
    return { isValid: false, userId: null };
  }

  return {
    isValid: authenticatedUserId === requestUserId,
    userId: authenticatedUserId
  };
}

/**
 * ユーザーIDを数値に変換する関数
 *
 * @param userIdStr ユーザーIDの文字列表現
 * @returns 変換後のユーザーID、無効な場合はnull
 */
export function parseUserId(userIdStr: string | null | undefined): number | null {
  if (!userIdStr) return null;

  const userId = parseInt(userIdStr, 10);
  return isNaN(userId) ? null : userId;
}

/**
 * @deprecated getServerUserIdAsync()を使用してください
 */
export async function getUserIdFromServer(): Promise<number | null> {
  return await getServerUserIdAsync();
}

/**
 * @deprecated getServerUserId()を使用してください
 */
export function getUserIdFromServerSync(): number | null {
  return getServerUserId();
}

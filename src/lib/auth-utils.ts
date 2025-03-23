import { cookies } from 'next/headers';
import { STORAGE_KEYS } from './constants';

/**
 * サーバー側でCookieからユーザーIDを取得する関数
 * App Router内のサーバーコンポーネントやAPI Routeで使用する
 *
 * @returns Cookieから取得したユーザーID、存在しない場合はnull
 */
export async function getUserIdFromServer(): Promise<number | null> {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get(STORAGE_KEYS.USER_ID);

  if (!userIdCookie) return null;

  const userId = parseInt(userIdCookie.value, 10);
  return isNaN(userId) ? null : userId;
}

/**
 * サーバーコンポーネントから同期的にユーザーIDを取得する関数
 * ※パフォーマンス向上のため同期的に実行できるように分離
 *
 * @returns Cookieから取得したユーザーID、存在しない場合はnull
 */
export function getUserIdFromServerSync(): number | null {
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
  const authenticatedUserId = await getUserIdFromServer();

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

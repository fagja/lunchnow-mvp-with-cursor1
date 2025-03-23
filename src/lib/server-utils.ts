import { cookies } from 'next/headers';
import { STORAGE_KEYS, CookieOptions } from './constants';
import { getServerUserId as getServerUserIdFromAuth, getServerUserIdAsync as getServerUserIdAsyncFromAuth } from './auth-utils';

/**
 * サーバー側でCookieを設定する関数
 *
 * @param name - Cookieの名前
 * @param value - Cookieの値
 * @param options - Cookieのオプション
 */
export async function setServerCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): Promise<void> {
  const {
    days = 30,
    path = '/',
    sameSite = 'Lax',
    secure = process.env.NODE_ENV === 'production', // 本番環境のみSecure
  } = options;

  const maxAge = days * 24 * 60 * 60;

  const cookieStore = await cookies();
  cookieStore.set({
    name,
    value,
    path,
    maxAge,
    sameSite: sameSite.toLowerCase() as 'strict' | 'lax' | 'none',
    secure,
    // httpOnlyは指定せず、デフォルト値（false）を使用
  });
}

/**
 * サーバー側でCookieを削除する関数
 *
 * @param name - 削除するCookieの名前
 * @param path - Cookieのパス
 */
export async function removeServerCookie(name: string, path: string = '/'): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name,
    value: '',
    path,
    maxAge: 0
  });
}

/**
 * サーバー側非同期コンテキスト用のユーザーID取得関数
 * API RouteやServerActionsで使用
 *
 * @returns サーバーサイドで取得したユーザーID（存在しない場合はnull）
 */
export async function getServerUserIdAsync(): Promise<number | null> {
  return await getServerUserIdAsyncFromAuth();
}

/**
 * サーバーコンポーネント用のユーザーID取得関数
 * サーバーコンポーネント内でのみ使用できます。クライアントコンポーネントでは utils.ts の getClientUserId() を使用してください。
 *
 * @returns サーバーサイドで取得したユーザーID（存在しない場合はnull）
 */
export function getServerUserId(): number | null {
  return getServerUserIdFromAuth();
}

/**
 * @deprecated getServerUserIdSync()を使用せず、getServerUserId()を使用してください
 */
export function getServerUserIdSync(): number | null {
  return getServerUserId();
}

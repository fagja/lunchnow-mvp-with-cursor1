import { cookies } from 'next/headers';
import { STORAGE_KEYS, CookieOptions } from './constants';
import { getUserIdFromServer, getUserIdFromServerSync } from './auth-utils';

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
 * サーバー側でユーザーIDを取得する関数
 * @deprecated getUserIdFromServer を使用してください
 * @returns サーバーサイドで取得したユーザーID、存在しない場合はnull
 */
export async function getServerUserId(): Promise<number | null> {
  return await getUserIdFromServer();
}

/**
 * サーバーコンポーネントからユーザーIDを取得する関数
 * @returns ユーザーID（存在しない場合はnull）
 */
export function getUserId(): number | null {
  return getUserIdFromServerSync();
}

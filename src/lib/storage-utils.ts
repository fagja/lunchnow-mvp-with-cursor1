/**
 * ローカルストレージ関連のユーティリティ関数
 */

/**
 * LocalStorage関連の定数
 */
export const localStorageKeys = {
  USER_ID: 'lunchnow_user_id',
}

/**
 * ユーザーIDをLocalStorageから取得する
 * @returns ユーザーID（数値）またはnull
 */
export function getUserId(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const userId = localStorage.getItem(localStorageKeys.USER_ID);
  return userId ? parseInt(userId, 10) : null;
}

/**
 * ユーザーIDをLocalStorageに保存する
 * @param userId ユーザーID
 */
export function saveUserId(userId: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(localStorageKeys.USER_ID, userId.toString());
}

/**
 * ユーザーIDが存在するか確認し、存在しない場合はエラーログを出力
 * @returns ユーザーIDまたはnull
 */
export function validateUserId(): number | null {
  const userId = getUserId();
  if (!userId) {
    console.error('ユーザーIDが存在しません。');
  }
  return userId;
}

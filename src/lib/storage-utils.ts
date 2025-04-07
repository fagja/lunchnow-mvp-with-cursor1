/**
 * ローカルストレージ関連のユーティリティ関数
 */

/**
 * LocalStorage関連の定数
 */
export const localStorageKeys = {
  USER_ID: 'lunchnow_user_id',
  LIKED_USERS: 'lunchnow_liked_users',
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

/**
 * いいねしたユーザーのIDリストをLocalStorageから取得する
 * @returns いいねしたユーザーIDの配列
 */
export function getLikedUserIds(): number[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const likedUsersJson = localStorage.getItem(localStorageKeys.LIKED_USERS);
  return likedUsersJson ? JSON.parse(likedUsersJson) : [];
}

/**
 * いいねしたユーザーIDをLocalStorageに保存する
 * @param userId いいねしたユーザーID
 */
export function saveLikedUserId(userId: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  const likedUsers = getLikedUserIds();

  // 重複を防ぐため、既に存在する場合は追加しない
  if (!likedUsers.includes(userId)) {
    likedUsers.push(userId);
    localStorage.setItem(localStorageKeys.LIKED_USERS, JSON.stringify(likedUsers));
  }
}

/**
 * 当日のいいね情報をリセットする
 * 注: 現在のMVP実装では使用しないが、将来的に日次リセット機能で使用する可能性がある
 */
export function resetLikedUsers(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(localStorageKeys.LIKED_USERS);
}

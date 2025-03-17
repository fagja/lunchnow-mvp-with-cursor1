import { UserResponse, UpdateUserRequest } from '@/types/api.types';
import { fetchApi, patchApi, postApi, getUserIdFromLocalStorage, saveUserIdToLocalStorage } from './api-client';

/**
 * APIのベースURL
 */
const API_BASE_URL = '/api/users';

/**
 * ユーザー登録関数
 * @param userData ユーザー情報
 */
export async function createUser(userData: UpdateUserRequest): Promise<UserResponse> {
  // クライアント側での詳細バリデーションは削除

  const result = await postApi<UserResponse>(API_BASE_URL, userData);

  // 成功した場合はローカルストレージにユーザーIDを保存
  if (result.data && result.data.id) {
    saveUserIdToLocalStorage(result.data.id);
  }

  return result;
}

/**
 * ユーザー取得関数
 * @param userId ユーザーID
 */
export async function fetchUser(userId?: number): Promise<UserResponse> {
  // ユーザーIDが指定されていない場合はローカルストレージから取得
  const id = userId || getUserIdFromLocalStorage();

  if (!id) {
    return {
      error: 'エラーが発生しました',
      status: 400
    };
  }

  return fetchApi<UserResponse>(`${API_BASE_URL}/${id}`);
}

/**
 * ユーザー情報更新関数
 * @param userId ユーザーID
 * @param userData 更新するユーザー情報
 */
export async function updateUser(userId?: number, userData?: UpdateUserRequest): Promise<UserResponse> {
  // ユーザーIDが指定されていない場合はローカルストレージから取得
  const id = userId || getUserIdFromLocalStorage();

  if (!id) {
    return {
      error: 'エラーが発生しました',
      status: 400
    };
  }

  // クライアント側での詳細バリデーションは削除

  return patchApi<UserResponse>(`${API_BASE_URL}/${id}`, userData || {});
}

/**
 * 現在のユーザー情報を取得する関数
 * ローカルストレージのIDを使用して自動的にユーザー情報を取得
 */
export async function fetchCurrentUser(): Promise<UserResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return {
      error: 'エラーが発生しました',
      status: 404
    };
  }

  return fetchUser(userId);
}

// LocalStorage関連の関数をエクスポート
export { getUserIdFromLocalStorage, saveUserIdToLocalStorage };

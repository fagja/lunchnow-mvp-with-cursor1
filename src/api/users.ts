import {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UsersResponse
} from '@/types/api.types';
import { User } from '@/types/database.types';
import {
  fetchApi,
  postApi,
  patchApi,
  createUserIdError
} from './api-client';
import { getUserId, saveUserId, validateUserId } from '@/lib/storage-utils';

/**
 * APIのベースURL
 */
const API_BASE_URL = '/api/users';

/**
 * ユーザー登録関数
 * @param userData ユーザー情報
 * @returns 登録結果
 */
export async function registerUser(userData: UpdateUserRequest): Promise<UserResponse> {
  const response = await postApi<User>(API_BASE_URL, userData);

  const userId = response.data?.id;
  if (userId) {
    saveUserId(userId);
  }

  return response;
}

/**
 * ユーザー情報取得関数
 * @param userId ユーザーID（省略時は自分自身）
 * @returns ユーザー情報
 */
export async function fetchUser(userId?: number): Promise<UserResponse> {
  if (!userId) {
    const currentUserId = getUserId();

    if (!currentUserId) {
      return createUserIdError<User>();
    }

    userId = currentUserId;
  }

  return fetchApi<User>(`${API_BASE_URL}/${userId}`);
}

/**
 * ユーザー一覧取得関数
 * @param page ページ番号（1始まり、デフォルト1）
 * @param limit 1ページあたりの件数（デフォルト10、最大50）
 * @returns ユーザー一覧
 */
export async function fetchUsers(
  page: number = 1,
  limit: number = 10
): Promise<UsersResponse> {
  const userId = getUserId();

  if (!userId) {
    return createUserIdError<User[]>();
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  return fetchApi<User[]>(`${API_BASE_URL}?${queryParams.toString()}`);
}

/**
 * ユーザー情報更新関数
 * @param userData 更新するユーザー情報
 * @returns 更新結果
 */
export async function updateUser(userData: UpdateUserRequest): Promise<UserResponse> {
  const userId = getUserId();

  if (!userId) {
    return createUserIdError<User>();
  }

  return patchApi<User>(`${API_BASE_URL}/${userId}`, userData);
}

/**
 * 現在のユーザー情報を取得する関数
 * ローカルストレージのIDを使用して自動的にユーザー情報を取得
 */
export async function fetchCurrentUser(): Promise<UserResponse> {
  const userId = getUserId();

  if (!userId) {
    return createUserIdError<User>();
  }

  return fetchUser(userId);
}

// LocalStorage関連の関数をエクスポート
export { getUserId, saveUserId, validateUserId };

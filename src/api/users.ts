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
  return postApi<UserResponse>(API_BASE_URL, userData);
}

/**
 * ユーザー取得関数
 * @param userId ユーザーID
 */
export async function fetchUser(userId: number): Promise<UserResponse> {
  return fetchApi<UserResponse>(`${API_BASE_URL}/${userId}`);
}

/**
 * ユーザー情報更新関数
 * @param userId ユーザーID
 * @param userData 更新するユーザー情報
 */
export async function updateUser(userId: number, userData: UpdateUserRequest): Promise<UserResponse> {
  return patchApi<UserResponse>(`${API_BASE_URL}/${userId}`, userData);
}

// LocalStorage関連の関数をエクスポート
export { getUserIdFromLocalStorage, saveUserIdToLocalStorage };
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UsersResponse
} from '@/types/api.types';
import {
  fetchApi,
  postApi,
  patchApi,
  createUserIdError
} from './api-client';
import { getUserId, saveUserId } from '@/lib/utils';

/**
 * APIのベースURL
 */
const API_BASE_URL = '/api/users';

/**
 * ユーザー登録関数
 * @param userData ユーザー情報
 * @returns 登録結果
 */
export async function registerUser(userData: CreateUserRequest): Promise<UserResponse> {
  try {
    const response = await postApi<UserResponse>(API_BASE_URL, userData);

    // APIレスポンスからユーザーIDを取得して保存
    if (response.data && response.data.id) {
      saveUserId(response.data.id);
    }

    return response;
  } catch (error) {
    console.error("ユーザー登録中にエラーが発生しました:", error);
    return {
      error: {
        code: 'api_error',
        message: 'ユーザー登録処理中にエラーが発生しました。ネットワーク接続を確認してください。'
      },
      status: 500
    };
  }
}

/**
 * ユーザー情報取得関数
 * @param userId ユーザーID（省略時は自分自身）
 * @returns ユーザー情報
 */
export async function fetchUser(userId?: number): Promise<UserResponse> {
  try {
    if (!userId) {
      const currentUserId = getUserId();

      if (!currentUserId) {
        return createUserIdError<UserResponse>();
      }

      userId = currentUserId;
    }

    return await fetchApi<UserResponse>(`${API_BASE_URL}/${userId}`);
  } catch (error) {
    console.error("ユーザー情報取得中にエラーが発生しました:", error);
    return {
      error: {
        code: 'api_error',
        message: 'ユーザー情報の取得中にエラーが発生しました。ネットワーク接続を確認してください。'
      },
      status: 500
    };
  }
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
  try {
    const userId = getUserId();

    if (!userId) {
      return createUserIdError<UsersResponse>();
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    return await fetchApi<UsersResponse>(`${API_BASE_URL}?${queryParams.toString()}`);
  } catch (error) {
    console.error("ユーザー一覧取得中にエラーが発生しました:", error);
    return {
      error: {
        code: 'api_error',
        message: 'ユーザー一覧の取得中にエラーが発生しました。ネットワーク接続を確認してください。'
      },
      status: 500
    };
  }
}

/**
 * ユーザー情報更新関数
 * @param userData 更新するユーザー情報
 * @returns 更新結果
 */
export async function updateUser(userData: UpdateUserRequest): Promise<UserResponse> {
  try {
    const userId = getUserId();

    if (!userId) {
      return createUserIdError<UserResponse>();
    }

    return await patchApi<UserResponse>(`${API_BASE_URL}/${userId}`, userData);
  } catch (error) {
    console.error("ユーザー情報更新中にエラーが発生しました:", error);
    return {
      error: {
        code: 'api_error',
        message: 'ユーザー情報の更新中にエラーが発生しました。ネットワーク接続を確認してください。'
      },
      status: 500
    };
  }
}

/**
 * 現在のユーザー情報を取得する関数
 * ローカルストレージのIDを使用して自動的にユーザー情報を取得
 */
export async function fetchCurrentUser(): Promise<UserResponse> {
  try {
    const userId = getUserId();

    if (!userId) {
      return {
        error: {
          code: 'not_found',
          message: 'ユーザーIDが見つかりません'
        },
        status: 404
      };
    }

    return await fetchUser(userId);
  } catch (error) {
    console.error("現在のユーザー情報取得中にエラーが発生しました:", error);
    return {
      error: {
        code: 'api_error',
        message: 'ユーザー情報の取得中にエラーが発生しました。ネットワーク接続を確認してください。'
      },
      status: 500
    };
  }
}

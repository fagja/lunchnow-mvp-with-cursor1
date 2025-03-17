import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { fetchApi, postApi, patchApi, deleteApi, getUserIdFromLocalStorage } from '@/api/api-client';
import { ApiResponse } from '@/types/api.types';
import { getUserId } from '@/lib/utils';

/**
 * SWRフェッチャー関数の型定義
 */
type Fetcher<T> = (url: string) => Promise<T>;

/**
 * APIリクエストの基本オプション
 */
type ApiRequestOptions = {
  headers?: Record<string, string>;
  timeout?: number;
};

/**
 * 標準SWR設定と拡張
 */
const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  dedupingInterval: 5000, // 5秒間の重複リクエスト防止
};

/**
 * SWRを使用してAPIからデータを取得するカスタムフック
 *
 * @param url - APIのURL
 * @param options - APIリクエストオプション
 * @param config - SWR設定
 * @returns SWRレスポンス
 */
export function useApiGet<T>(
  url: string | null,
  options: ApiRequestOptions = {},
  config: SWRConfiguration = {}
): SWRResponse<T | null, Error> {
  // カスタムフェッチャーの定義
  const fetcher: Fetcher<T | null> = async (url: string) => {
    const response = await fetchApi<T>(url, {
      headers: options.headers,
      timeout: options.timeout,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data || null;
  };

  // 複合設定
  const mergedConfig: SWRConfiguration = {
    ...defaultSWRConfig,
    ...config,
  };

  // SWRフックの使用
  return useSWR<T | null, Error>(
    url,
    fetcher,
    mergedConfig
  );
}

/**
 * APIを使用してPOSTリクエストを送信する共通関数
 *
 * @param url - APIのURL
 * @param body - POSTリクエストボディ
 * @param options - APIリクエストオプション
 * @returns APIレスポンス
 */
export async function apiPost<T, B = any>(
  url: string,
  body: B,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  return await postApi<T>(url, body, {
    headers: options.headers,
    timeout: options.timeout,
  });
}

/**
 * APIを使用してPATCHリクエストを送信する共通関数
 *
 * @param url - APIのURL
 * @param body - PATCHリクエストボディ
 * @param options - APIリクエストオプション
 * @returns APIレスポンス
 */
export async function apiPatch<T, B = any>(
  url: string,
  body: B,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  return await patchApi<T>(url, body, {
    headers: options.headers,
    timeout: options.timeout,
  });
}

/**
 * APIを使用してDELETEリクエストを送信する共通関数
 *
 * @param url - APIのURL
 * @param options - APIリクエストオプション
 * @returns APIレスポンス
 */
export async function apiDelete<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  return await deleteApi<T>(url, {
    headers: options.headers,
    timeout: options.timeout,
  });
}

/**
 * ユーザーIDが必要なAPIリクエストを送信する前に、ユーザーIDの存在を確認する関数
 *
 * @returns ユーザーID、存在しない場合はnull
 */
export function checkUserIdBeforeRequest(): number | null {
  const userId = getUserId();
  if (!userId) {
    console.error('ユーザーIDが存在しません。');
    return null;
  }
  return userId;
}

/**
 * URLクエリパラメータを構築する関数
 *
 * @param params - クエリパラメータオブジェクト
 * @returns クエリ文字列（?key1=value1&key2=value2形式）
 */
export function buildQueryParams(params: Record<string, string | number | boolean | undefined | null>): string {
  const validParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return validParams.length > 0 ? `?${validParams.join('&')}` : '';
}

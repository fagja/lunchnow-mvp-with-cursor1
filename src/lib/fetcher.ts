/**
 * SWR用のカスタムフェッチャー
 * 
 * @param url - リクエスト先URL
 * @param options - リクエストオプション
 * @returns レスポンスデータ
 */
export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  // レスポンスが正常でない場合はエラーをスロー
  if (!response.ok) {
    // レスポンスからエラー情報を取得
    try {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `サーバーエラーが発生しました: ${response.status}`
      );
    } catch (e) {
      // JSONパースエラーなど
      throw new Error(`サーバーエラーが発生しました: ${response.status}`);
    }
  }

  // 204 No Contentの場合は空オブジェクトを返す
  if (response.status === 204) {
    return {} as T;
  }

  // 正常なレスポンスはJSONとしてパース
  return response.json();
}
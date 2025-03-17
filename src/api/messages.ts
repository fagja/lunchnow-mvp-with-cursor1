import {
  MessageResponse,
  MessagesResponse,
  SendMessageRequest
} from '@/types/api.types';
import {
  fetchApi,
  postApi,
  getUserIdFromLocalStorage,
  createUserIdError
} from './api-client';

/**
 * メッセージ送信関数
 * @param matchId マッチングID
 * @param content メッセージ内容
 * @returns 送信結果
 */
export async function sendMessage(
  matchId: number,
  content: string
): Promise<MessageResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return createUserIdError<MessageResponse>();
  }

  const messageData: SendMessageRequest = {
    from_user_id: userId,
    content
  };

  return postApi<MessageResponse>(`/api/matches/${matchId}/messages`, messageData);
}

/**
 * メッセージ履歴取得関数
 * @param matchId マッチングID
 * @param page ページ番号（1始まり、デフォルト1）
 * @param limit 1ページあたりの件数（デフォルト50、最大100）
 * @returns メッセージ履歴
 */
export async function fetchMessages(
  matchId: number,
  page: number = 1,
  limit: number = 50
): Promise<MessagesResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return createUserIdError<MessagesResponse>();
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  return fetchApi<MessagesResponse>(`/api/matches/${matchId}/messages?${queryParams.toString()}`);
}

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

/**
 * レスポンスヘッダーからページネーション情報を取得
 * @param response Fetchレスポンス
 * @returns ページネーション情報
 */
export function getPaginationInfoFromHeaders(response: Response): PaginationInfo {
  return {
    totalCount: parseInt(response.headers.get('X-Total-Count') || '0'),
    currentPage: parseInt(response.headers.get('X-Page') || '1'),
    pageSize: parseInt(response.headers.get('X-Limit') || '50'),
    totalPages: parseInt(response.headers.get('X-Total-Pages') || '1')
  };
}

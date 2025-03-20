import { MessageResponse, MessageListResponse, CreateMessageRequest } from '@/types/api.types';
import { fetchApi, postApi } from './api-client';
import { getUserId, validateUserId } from '@/lib/storage-utils';

/**
 * APIのベースURL
 */
const API_BASE_URL = '/api/messages';

/**
 * ユーザーIDが存在しない場合のエラーレスポンスを生成
 */
const createUserIdError = (): MessageResponse => ({
  error: 'ユーザーIDが取得できません。再度ログインしてください。',
  status: 401
});

/**
 * メッセージ送信関数
 * @param matchId マッチID
 * @param content メッセージ内容
 * @returns 送信結果
 */
export async function sendMessage(matchId: number, content: string): Promise<MessageResponse> {
  const fromUserId = getUserId();

  if (!fromUserId) {
    return createUserIdError();
  }

  const messageData: CreateMessageRequest = {
    matchId,
    fromUserId,
    content
  };

  return postApi<MessageResponse>(`${API_BASE_URL}`, messageData);
}

/**
 * マッチの過去メッセージ履歴取得関数
 * @param matchId マッチID
 * @param limit 取得件数
 * @returns メッセージ一覧
 */
export async function fetchMessageHistory(
  matchId: number,
  limit: number = 50
): Promise<MessageListResponse> {
  if (!matchId) {
    return {
      error: 'マッチIDが指定されていません',
      status: 400
    };
  }

  return fetchApi<MessageListResponse>(`${API_BASE_URL}/${matchId}?limit=${limit}`);
}

/**
 * 新着メッセージ取得関数
 * @param matchId マッチID
 * @param lastMessageId 最後に取得したメッセージID
 * @returns 新着メッセージ一覧
 */
export async function fetchNewMessages(
  matchId: number,
  lastMessageId?: number
): Promise<MessageListResponse> {
  const userId = getUserId();

  if (!userId) {
    return createUserIdError();
  }

  let url = `${API_BASE_URL}/${matchId}/new?userId=${userId}`;
  if (lastMessageId) {
    url += `&lastMessageId=${lastMessageId}`;
  }

  return fetchApi<MessageListResponse>(url);
}

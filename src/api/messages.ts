import { Message } from '@/types/database.types';
import { MessagesResponse, MessageResponse, SendMessageRequest } from '@/types/api.types';
import { fetchApi, postApi, createUserIdError } from './api-client';
import { getUserId, validateUserId } from '@/lib/storage-utils';

/**
 * APIのベースURL
 */
const API_BASE_URL = '/api/messages';

/**
 * メッセージ送信関数
 * @param matchId マッチID
 * @param content メッセージ内容
 * @returns 送信結果
 */
export async function sendMessage(matchId: number, content: string): Promise<MessageResponse> {
  const fromUserId = getUserId();

  if (!fromUserId) {
    return createUserIdError<Message>();
  }

  const messageData: SendMessageRequest = {
    from_user_id: Number(fromUserId),
    content
  };

  return postApi<Message>(`/api/matches/${matchId}/messages`, messageData);
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
): Promise<MessagesResponse> {
  if (!matchId) {
    return {
      error: 'マッチIDが指定されていません',
      status: 400
    };
  }

  // APIパスを修正 - 正しいエンドポイントを使用
  return fetchApi<Message[]>(`/api/matches/${matchId}/messages?limit=${limit}`);
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
): Promise<MessagesResponse> {
  const userId = getUserId();

  if (!userId) {
    return {
      error: 'ユーザーIDが取得できません。再度ログインしてください。',
      status: 401
    };
  }

  // 新着メッセージAPIがないため、通常のメッセージ履歴APIを使用
  let url = `/api/matches/${matchId}/messages?userId=${userId}`;
  if (lastMessageId) {
    url += `&lastMessageId=${lastMessageId}`;
  }

  return fetchApi<Message[]>(url);
}

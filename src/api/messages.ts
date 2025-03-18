import { MessageResponse, MessagesResponse, SendMessageRequest } from '@/types/api.types';
import { fetchApi, postApi, getUserIdFromLocalStorage } from './api-client';

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
 * @param matchId マッチングID
 * @param content メッセージ内容
 * @returns 送信結果
 */
export async function sendMessage(matchId: number, content: string): Promise<MessageResponse> {
  const fromUserId = getUserIdFromLocalStorage();

  if (!fromUserId) {
    return createUserIdError();
  }

  // 空メッセージは送信しない
  if (!content.trim()) {
    return {
      error: 'メッセージを入力してください。',
      status: 400
    };
  }

  // 長すぎるメッセージはエラー
  if (content.length > 200) {
    return {
      error: 'メッセージは200文字以内で入力してください。',
      status: 400
    };
  }

  const messageData: SendMessageRequest = {
    from_user_id: fromUserId,
    content
  };

  return postApi<MessageResponse>(`${API_BASE_URL}/${matchId}`, messageData);
}

/**
 * メッセージ履歴取得関数
 * @param matchId マッチングID
 * @returns メッセージ一覧
 */
export async function fetchMessages(matchId: number): Promise<MessagesResponse> {
  const userId = getUserIdFromLocalStorage();

  if (!userId) {
    return createUserIdError();
  }

  // キャッシュ制御のためのランダムパラメータを追加しない
  // 3秒間隔のポーリングであり、サーバーから最新データを取得するため
  return fetchApi<MessagesResponse>(`${API_BASE_URL}/${matchId}`);
}

import { SWRResponse } from 'swr';
import { API_BASE_URL, createNoUserIdError, useSWR } from '@/lib/api';
import { getUserId } from '@/lib/utils';
import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/constants';
import { ApiResponse } from '@/types/api.types';

/**
 * メッセージを送信するAPI
 * @param matchId マッチID
 * @param message メッセージ内容
 * @returns APIレスポンス
 */
export async function sendMessage(matchId: number, message: string): Promise<ApiResponse<any>> {
  const userId = getUserId();
  if (!userId) {
    return createNoUserIdError();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        matchId,
        message
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      error: {
        code: ERROR_CODES.SERVER_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR]
      },
      status: 500,
      data: undefined
    };
  }
}

/**
 * マッチのメッセージ履歴を取得するSWRキーを生成
 */
export function getMessageHistoryKey(matchId: number, page = 1, limit = 50) {
  const userId = getUserId();
  if (!userId) return null;
  return `/messages/history?matchId=${matchId}&userId=${userId}&page=${page}&limit=${limit}`;
}

/**
 * マッチのメッセージ履歴を取得するカスタムフック
 */
export function useMessageHistory(matchId: number, page = 1, limit = 50): SWRResponse {
  return useSWR(getMessageHistoryKey(matchId, page, limit));
}

/**
 * マッチの最新メッセージ情報を取得するSWRキーを生成
 */
export function getLatestMessagesKey() {
  const userId = getUserId();
  if (!userId) return null;
  return `/messages/latest?userId=${userId}`;
}

/**
 * マッチの最新メッセージ情報を取得するカスタムフック
 */
export function useLatestMessages(): SWRResponse {
  return useSWR(getLatestMessagesKey());
}
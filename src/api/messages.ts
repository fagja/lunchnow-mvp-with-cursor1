import { SWRResponse } from 'swr';
import { API_BASE_URL, createNoUserIdError, useSWR } from '@/lib/api';
import { getClientUserId } from '@/lib/utils';
import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/constants';
import { ApiResponse } from '@/types/api.types';
import { messageConfig } from '@/lib/swr-config';
import { usePollingWithSWR, PollingWithSWRResponse } from '@/hooks/usePollingWithSWR';
import { useSWRPolling, SWRPollingResponse } from '@/hooks/useSWRPolling';
import { fetcher } from '@/lib/fetcher';
import { MessageDTO, MessageHistoryResponse, LatestMessagesResponse } from '@/types/message';

/**
 * メッセージを送信するAPI
 * @param matchId マッチID
 * @param message メッセージ内容
 * @returns APIレスポンス
 */
export async function sendMessage(matchId: number, message: string): Promise<ApiResponse<any>> {
  const userId = getClientUserId();
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
        code: ERROR_CODES.SYSTEM_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.SYSTEM_ERROR]
      },
      status: 500,
      data: undefined
    };
  }
}

/**
 * メッセージ履歴取得用のSWRキーを生成
 */
export const getMessageHistoryKey = (matchId: string, page = 1, limit = 20) =>
  `/matches/${matchId}/messages?page=${page}&limit=${limit}`;

/**
 * メッセージ履歴を取得するフック
 * 通常のSWRを使用し、3秒ごとに自動更新
 */
export function useMessageHistory(
  matchId: string | null,
  page = 1,
  limit = 20
): SWRResponse<MessageHistoryResponse> {
  const key = matchId ? getMessageHistoryKey(matchId, page, limit) : null;
  return useSWR<MessageHistoryResponse>(key, fetcher, messageConfig);
}

/**
 * メッセージ履歴をリアルタイムで取得するフック
 * SWRの内蔵ポーリング機能を使用
 */
export function useRealtimeMessageHistory(
  matchId: string | null,
  page = 1,
  limit = 20
): SWRPollingResponse<MessageHistoryResponse> {
  const key = matchId ? getMessageHistoryKey(matchId, page, limit) : null;

  return useSWRPolling<MessageHistoryResponse>(
    key,
    fetcher,
    {
      refreshInterval: 3000, // 3秒間隔でポーリング
      stopOnBackground: true, // バックグラウンド時にポーリングを停止
      ...messageConfig,
    }
  );
}

/**
 * 旧式のポーリング実装 - 互換性のために残す
 * @deprecated useRealtimeMessageHistory を使用してください
 */
export function useRealtimeMessageHistoryLegacy(
  matchId: string | null,
  page = 1,
  limit = 20
): PollingWithSWRResponse<MessageHistoryResponse> {
  const key = matchId ? getMessageHistoryKey(matchId, page, limit) : null;

  return usePollingWithSWR<MessageHistoryResponse>(
    key,
    () => fetcher(key as string),
    {
      interval: 3000, // 3秒間隔でポーリング
      swrConfig: messageConfig,
      stopOnBackground: true, // バックグラウンド時にポーリングを停止
    }
  );
}

/**
 * 最新メッセージ取得用のSWRキーを生成
 */
export const getLatestMessagesKey = () => '/messages/latest';

/**
 * 最新メッセージを取得するフック
 * 通常のSWRを使用し、3秒ごとに自動更新
 */
export function useLatestMessages(): SWRResponse<LatestMessagesResponse> {
  return useSWR<LatestMessagesResponse>(getLatestMessagesKey(), fetcher, messageConfig);
}

/**
 * 最新メッセージをリアルタイムで取得するフック
 * SWRの内蔵ポーリング機能を使用
 */
export function useRealtimeLatestMessages(): SWRPollingResponse<LatestMessagesResponse> {
  const key = getLatestMessagesKey();

  return useSWRPolling<LatestMessagesResponse>(
    key,
    fetcher,
    {
      refreshInterval: 3000, // 3秒間隔でポーリング
      stopOnBackground: true, // バックグラウンド時にポーリングを停止
      ...messageConfig,
    }
  );
}

/**
 * 旧式のポーリング実装 - 互換性のために残す
 * @deprecated useRealtimeLatestMessages を使用してください
 */
export function useRealtimeLatestMessagesLegacy(): PollingWithSWRResponse<LatestMessagesResponse> {
  const key = getLatestMessagesKey();

  return usePollingWithSWR<LatestMessagesResponse>(
    key,
    () => fetcher(key),
    {
      interval: 3000, // 3秒間隔でポーリング
      swrConfig: messageConfig,
      stopOnBackground: true, // バックグラウンド時にポーリングを停止
    }
  );
}

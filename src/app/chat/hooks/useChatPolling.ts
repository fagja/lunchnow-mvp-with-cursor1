import { useCallback, useState, useRef } from 'react';
import { usePolling } from '@/hooks/usePolling';
import { Message } from '@/types/database.types';
import { fetchCurrentMatch } from '@/api/matches';
import { fetchMessages } from '@/api/messages';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';

/**
 * チャットメッセージポーリングのオプション型定義
 */
interface ChatPollingOptions {
  /**
   * ポーリング間隔（ミリ秒）
   * デフォルト: 3000 (3秒)
   */
  interval?: number;
  /**
   * 新しいメッセージが見つかった場合のコールバック関数
   */
  onNewMessages?: (messages: Message[]) => void;
  /**
   * マッチングがキャンセルされた場合のコールバック関数
   */
  onMatchCanceled?: () => void;
  /**
   * エラー発生時のコールバック関数
   */
  onError?: (error: Error) => void;
  /**
   * 自動的にバックグラウンド検出を行うかどうか（デフォルト: true）
   */
  detectVisibility?: boolean;
  /**
   * 初回即時実行するかどうか（デフォルト: true）
   */
  immediate?: boolean;
  /**
   * エラーを表示するかどうか（デフォルト: false）
   */
  showError?: boolean;
  /**
   * エラーの自動非表示時間（ミリ秒）
   */
  errorAutoHideTimeout?: number;
}

/**
 * チャットメッセージポーリングフック
 *
 * 指定した間隔でメッセージを定期的に取得し、新しいメッセージがある場合に通知する
 * マッチングがキャンセルされた場合にも通知する
 *
 * @param matchId 現在のマッチングID
 * @param currentMatchId 現在のマッチングIDの参照（変更検知用）
 * @param options ポーリングオプション
 * @returns ポーリング状態と制御関数、最新メッセージ
 */
export function useChatPolling(
  matchId: number | null,
  currentMatchId: number | null,
  options: ChatPollingOptions = {}
) {
  const {
    interval = 3000, // デフォルト3秒
    onNewMessages,
    onMatchCanceled,
    onError,
    detectVisibility = true,
    immediate = true,
    showError = false, // デフォルトでUIにエラーを表示しない
    errorAutoHideTimeout = 5000,
  } = options;

  // メッセージの状態
  const [messages, setMessages] = useState<Message[]>([]);
  // 最後のメッセージ数を保持（パフォーマンス最適化）
  const lastMessageCountRef = useRef<number>(0);

  // ポーリング用のデータ取得関数
  const fetchChatData = useCallback(async () => {
    // マッチIDがない場合は実行しない
    if (matchId === null) {
      return { messages: [], canceled: false };
    }

    try {
      // 現在のマッチ状態を取得して、キャンセルされていないか確認
      const matchResponse = await fetchCurrentMatch();

      // マッチングがキャンセルされていた場合
      if (!matchResponse.data || matchResponse.data.match_id !== currentMatchId) {
        if (onMatchCanceled) {
          onMatchCanceled();
        }
        return { messages: [], canceled: true };
      }

      // マッチが有効な場合のみメッセージを取得
      const messagesResponse = await fetchMessages(matchId);
      if (messagesResponse.data) {
        const newMessages = messagesResponse.data;

        // 新しいメッセージがある場合のみ状態を更新（パフォーマンス最適化）
        if (newMessages.length !== lastMessageCountRef.current) {
          lastMessageCountRef.current = newMessages.length;
          setMessages(newMessages);

          // 新しいメッセージに関するコールバック
          if (onNewMessages) {
            onNewMessages(newMessages);
          }
        }

        return { messages: newMessages, canceled: false };
      }

      return { messages: [], canceled: false };
    } catch (error) {
      throw error;
    }
  }, [matchId, currentMatchId, onNewMessages, onMatchCanceled]);

  // マッチ状態を確認する条件
  const isPollingEnabled = useCallback(() => {
    return matchId !== null;
  }, [matchId]);

  // マッチキャンセルを判定する停止条件
  const stopCondition = useCallback(
    (data: { messages: Message[], canceled: boolean }) => {
      return data.canceled;
    },
    []
  );

  // 標準のポーリングフックを使用
  const polling = usePolling<{ messages: Message[], canceled: boolean }>(fetchChatData, {
    interval,
    immediate,
    detectVisibility,
    enabled: isPollingEnabled(),
    stopCondition,
    showError,
    errorAutoHideTimeout,
    onError,
  });

  return {
    ...polling,
    messages,
  };
}

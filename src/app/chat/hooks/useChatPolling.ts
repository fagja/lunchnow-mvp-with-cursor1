import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { usePolling } from '@/hooks/usePolling';
import { Message } from '@/types/database.types';
import { fetchCurrentMatch } from '@/api/matches';
import { fetchMessageHistory } from '@/api/messages';
import { BasePollingOptions } from '@/types/polling';

/**
 * チャットメッセージポーリングのオプション型定義
 */
interface ChatPollingOptions extends Partial<Omit<BasePollingOptions<{ messages: Message[], canceled: boolean }>, 'stopCondition'>> {
  /**
   * 新しいメッセージが見つかった場合のコールバック関数
   */
  onNewMessages?: (messages: Message[]) => void;
  /**
   * マッチングがキャンセルされた場合のコールバック関数
   */
  onMatchCanceled?: () => void;
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

  // 参照管理によるメモ最適化
  const matchIdRef = useRef<number | null>(matchId);
  const currentMatchIdRef = useRef<number | null>(currentMatchId);
  const onNewMessagesRef = useRef(onNewMessages);
  const onMatchCanceledRef = useRef(onMatchCanceled);
  const onErrorRef = useRef(onError);
  const intervalRef = useRef(interval);
  const detectVisibilityRef = useRef(detectVisibility);
  const immediateRef = useRef(immediate);
  const showErrorRef = useRef(showError);
  const errorAutoHideTimeoutRef = useRef(errorAutoHideTimeout);

  // 最後のメッセージ数を保持（パフォーマンス最適化）
  const lastMessageCountRef = useRef<number>(0);

  // 参照値を最新に保つ
  useEffect(() => {
    matchIdRef.current = matchId;
    currentMatchIdRef.current = currentMatchId;
    onNewMessagesRef.current = onNewMessages;
    onMatchCanceledRef.current = onMatchCanceled;
    onErrorRef.current = onError;
    intervalRef.current = interval;
    detectVisibilityRef.current = detectVisibility;
    immediateRef.current = immediate;
    showErrorRef.current = showError;
    errorAutoHideTimeoutRef.current = errorAutoHideTimeout;
  }, [
    matchId,
    currentMatchId,
    onNewMessages,
    onMatchCanceled,
    onError,
    interval,
    detectVisibility,
    immediate,
    showError,
    errorAutoHideTimeout
  ]);

  // ポーリング用のデータ取得関数 - refで管理して依存配列の問題を回避
  const fetchChatDataRef = useRef(async () => {
    // マッチIDがない場合は実行しない
    if (matchIdRef.current === null) {
      return { messages: [], canceled: false };
    }

    try {
      // 現在のマッチ状態を取得して、キャンセルされていないか確認
      const matchResponse = await fetchCurrentMatch();

      // マッチングがキャンセルされていた場合
      if (!matchResponse.data || matchResponse.data.match_id !== currentMatchIdRef.current) {
        if (onMatchCanceledRef.current) {
          onMatchCanceledRef.current();
        }
        return { messages: [], canceled: true };
      }

      // マッチが有効な場合のみメッセージを取得
      const messagesResponse = await fetchMessageHistory(matchIdRef.current!);
      if (messagesResponse.data) {
        const newMessages = messagesResponse.data;

        // 新しいメッセージがある場合のみ状態を更新（パフォーマンス最適化）
        if (newMessages.length !== lastMessageCountRef.current) {
          lastMessageCountRef.current = newMessages.length;
          setMessages(newMessages);

          // 新しいメッセージに関するコールバック
          if (onNewMessagesRef.current) {
            onNewMessagesRef.current(newMessages);
          }
        }

        return { messages: newMessages, canceled: false };
      }

      return { messages: [], canceled: false };
    } catch (error) {
      throw error;
    }
  });

  // マッチキャンセルを判定する停止条件 - refで管理して依存配列の問題を回避
  const stopConditionRef = useRef((data: { messages: Message[], canceled: boolean }) => {
    return data.canceled;
  });

  // 条件付き実行
  const isPollingEnabled = useCallback(() => {
    return matchIdRef.current !== null;
  }, []);

  // 安定したfetch関数
  const stableFetchFn = useCallback(() => fetchChatDataRef.current(), []);

  // ポーリングオプションをメモ化して安定性を確保し、依存配列を最小化
  const pollingOptions = useMemo(() => ({
    interval: intervalRef.current,
    immediate: immediateRef.current,
    detectVisibility: detectVisibilityRef.current,
    enabled: isPollingEnabled(),
    stopCondition: (data: { messages: Message[], canceled: boolean }) => stopConditionRef.current(data),
    showError: showErrorRef.current,
    errorAutoHideTimeout: errorAutoHideTimeoutRef.current,
    onError: (error: Error) => {
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    },
  }), []); // 依存配列を空にして再レンダリング時の再生成を防止

  // 共通ポーリングフックを使用
  const polling = usePolling<{ messages: Message[], canceled: boolean }>(stableFetchFn, pollingOptions);

  return {
    ...polling,
    messages,
  };
}

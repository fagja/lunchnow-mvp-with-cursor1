'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { MessageBubble } from '@/components/chat/message-bubble';
import { Modal } from '@/components/ui/modal';
import { fetchCurrentMatch, cancelMatch } from '@/api/matches';
import { fetchMessages, sendMessage } from '@/api/messages';
import { Message, MatchedUser } from '@/types/database.types';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';
import { ErrorMessage } from '@/components/ui/error-message';

// ローディング状態の型定義
type StatusState = {
  isLoading: boolean;
  isSending: boolean;
};

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [matchInfo, setMatchInfo] = useState<MatchedUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<StatusState>({
    isLoading: true,
    isSending: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCanceledModal, setShowCanceledModal] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = useState(true); // 画面アクティブ状態の追跡

  // マッチ情報とメッセージを取得する
  const loadMatchAndMessages = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      setError(null);

      // マッチング情報を取得
      const matchResponse = await fetchCurrentMatch();

      if (matchResponse.error) {
        setError(API_ERROR_MESSAGES.FETCH_MATCH);
        setTimeout(() => router.push('/users'), 2000);
        return;
      }

      // マッチングが存在しない場合
      if (!matchResponse.data || !matchResponse.data.match_id) {
        setError(API_ERROR_MESSAGES.MATCH_NOT_FOUND);
        setTimeout(() => router.push('/users'), 2000);
        return;
      }

      setMatchInfo(matchResponse.data);

      // マッチIDがある場合、メッセージを取得
      if (matchResponse.data.match_id) {
        const messagesResponse = await fetchMessages(matchResponse.data.match_id);

        if (messagesResponse.data) {
          setMessages(messagesResponse.data);
        }
      }
    } catch (err) {
      console.error('チャットデータ取得エラー:', err);
      setError(API_ERROR_MESSAGES.FETCH_MESSAGES);
    } finally {
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // メッセージをポーリングする関数を定義（useCallbackでメモ化）
  const pollMessages = useCallback(async () => {
    // 非アクティブまたはマッチIDがない場合は実行しない
    if (!isActive || !matchInfo?.match_id) return;

    try {
      // 現在のマッチ状態を取得して、キャンセルされていないか確認
      const matchResponse = await fetchCurrentMatch();

      // マッチングがキャンセルされていた場合
      if (!matchResponse.data || matchResponse.data.match_id !== matchInfo.match_id) {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setShowCanceledModal(true);
        return;
      }

      // マッチが有効な場合のみメッセージを取得
      const messagesResponse = await fetchMessages(matchInfo.match_id);
      if (messagesResponse.data) {
        // 現在と新しいメッセージ配列の長さを比較
        const currentLength = messages.length;
        const newMessages = messagesResponse.data;

        // 新しいメッセージがある場合のみ状態を更新（パフォーマンス最適化）
        if (newMessages.length !== currentLength) {
          setMessages(newMessages);
        }
      }
    } catch (err) {
      console.error('メッセージポーリングエラー:', err);
      // エラー表示はユーザーエクスペリエンスを損なわない範囲で行う
      // 一時的なネットワークエラーの場合、次のポーリングで自動的に回復する可能性がある
    }
  }, [matchInfo?.match_id, messages.length, pollingInterval, isActive]);

  // 画面のフォーカス状態を監視して、ポーリングを制御する
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
    };

    // visibilitychangeイベントのリスナーを追加
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // クリーンアップ関数
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // アクティブ状態が変化したときのポーリング制御
  useEffect(() => {
    // 非アクティブになったときにポーリングを停止
    if (!isActive && pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    // アクティブになったときにポーリングを再開
    else if (isActive && !pollingInterval && matchInfo?.match_id) {
      // すぐに一度データを取得
      pollMessages();

      // 3秒間隔でポーリングを開始
      const interval = setInterval(pollMessages, 3000);
      setPollingInterval(interval);
    }

    // コンポーネントのアンマウント時にクリーンアップ
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isActive, matchInfo?.match_id, pollingInterval, pollMessages]);

  // 初回レンダリング時にデータを取得し、ポーリングを設定
  useEffect(() => {
    loadMatchAndMessages();

    // マウント時の初期ポーリング設定（画面がアクティブな場合のみ）
    if (isActive) {
      const interval = setInterval(pollMessages, 3000);
      setPollingInterval(interval);
    }

    // クリーンアップ関数でポーリングを停止
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };
  }, [router, pollMessages, isActive]);

  // メッセージが更新されたらスクロールを一番下に移動
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 一番下にスクロールする関数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // メッセージを送信する関数
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !matchInfo?.match_id) return;

    const content = inputValue.trim();
    // 先に入力をクリア（UXの向上）
    setInputValue('');

    try {
      setStatus(prev => ({ ...prev, isSending: true }));
      const response = await sendMessage(matchInfo.match_id, content);

      if (response.error) {
        setError(response.error);
        // エラー時は入力内容を復元
        setInputValue(content);
        return;
      }

      // 送信成功したらメッセージ一覧に追加（イミュータブルに処理）
      if (response.data) {
        setMessages(prevMessages => [...prevMessages, response.data]);
      }
    } catch (err) {
      console.error('メッセージ送信エラー:', err);
      setError(API_ERROR_MESSAGES.SEND_MESSAGE);
      // エラー時は入力内容を復元
      setInputValue(content);
    } finally {
      setStatus(prev => ({ ...prev, isSending: false }));
    }
  };

  // キャンセルモーダルを表示する関数
  const handleShowCancelModal = () => {
    setShowCancelModal(true);
  };

  // マッチングをキャンセルする関数
  const handleCancelMatch = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true }));

      if (!matchInfo?.match_id) {
        throw new Error('マッチングIDが取得できません');
      }

      const response = await cancelMatch(matchInfo.match_id);

      if (response.error) {
        setError(response.error);
        setShowCancelModal(false);
        return;
      }

      // ポーリングを停止
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }

      // キャンセル成功したらユーザー一覧に遷移
      router.push('/users');
    } catch (err) {
      console.error('マッチングキャンセルエラー:', err);
      setError(API_ERROR_MESSAGES.CANCEL_MATCH);
      setShowCancelModal(false);
    } finally {
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // キャンセルされたモーダルを閉じてユーザー一覧に遷移
  const handleCanceledModalClose = () => {
    setShowCanceledModal(false);
    router.push('/users');
  };

  // エンターキーでメッセージ送信（Shiftキー + Enterは改行）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <PageContainer>
      <div className="h-full flex flex-col">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            {matchInfo ? (
              <>
                <h1 className="font-bold text-lg">{matchInfo.user.nickname}</h1>
                <p className="text-sm text-gray-600">
                  {matchInfo.user.grade} {matchInfo.user.department}
                </p>
              </>
            ) : status.isLoading ? (
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p>情報がありません</p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleShowCancelModal}
            className="text-red-500 border-red-300 hover:bg-red-50"
            disabled={status.isLoading}
          >
            キャンセル
          </Button>
        </div>

        {/* エラーメッセージ */}
        <ErrorMessage error={error} className="mx-4" />

        {/* メッセージ一覧 */}
        <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
          {status.isLoading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : messages.length > 0 ? (
            <>
              {messages.map(message => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isMine={message.from_user_id !== matchInfo?.user.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              メッセージがありません。最初のメッセージを送信しましょう！
            </div>
          )}
        </div>

        {/* メッセージ入力 */}
        <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
          <div className="flex">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力..."
              maxLength={200}
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-primary focus:border-primary resize-none min-h-[50px] max-h-[100px]"
              disabled={status.isSending || status.isLoading}
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || status.isSending || status.isLoading}
              className="rounded-l-none"
            >
              送信
            </Button>
          </div>
          <div className="text-xs text-right text-gray-500 mt-1">
            {inputValue.length}/200文字
          </div>
        </form>
      </div>

      {/* キャンセル確認モーダル */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="マッチングをキャンセルしますか？"
        description="相手にもキャンセルが通知されます。この操作は元に戻せません。"
        showCancelButton={true}
        cancelText="戻る"
        confirmText="キャンセルする"
        onCancel={() => setShowCancelModal(false)}
        onConfirm={handleCancelMatch}
      />

      {/* キャンセルされたモーダル */}
      <Modal
        isOpen={showCanceledModal}
        onClose={handleCanceledModalClose}
        title="マッチングがキャンセルされました"
        description="相手がマッチングをキャンセルしました。ユーザー一覧に戻ります。"
        onConfirm={handleCanceledModalClose}
        autoCloseMs={2000}
      />
    </PageContainer>
  );
}

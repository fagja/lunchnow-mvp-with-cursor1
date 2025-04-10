'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { MessageBubble } from '@/components/chat/message-bubble';
import { Modal } from '@/components/ui/modal';
import { fetchCurrentMatch, cancelMatch } from '@/api/matches';
import { sendMessage } from '@/api/messages';
import { Message, MatchedUser } from '@/types/database.types';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';
import { ErrorMessage } from '@/components/ui/error-message';
import { useChatPolling } from './hooks/useChatPolling';
import { getUserId } from '@/lib/storage-utils';

// ローディング状態の型定義
type StatusState = {
  isLoading: boolean;
  isSending: boolean;
};

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [matchInfo, setMatchInfo] = useState<MatchedUser | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<StatusState>({
    isLoading: true,
    isSending: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCanceledModal, setShowCanceledModal] = useState(false);

  // マッチ情報を取得する
  const loadMatchInfo = async () => {
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

      // マッチング情報をセット
      console.log('マッチング情報取得成功:', matchResponse.data.match_id);
      setMatchInfo(matchResponse.data);

      // セッションストレージにマッチングIDを保存（遷移間の整合性のため）
      sessionStorage.setItem('current_match_id', String(matchResponse.data.match_id));
    } catch (err) {
      console.error('チャットデータ取得エラー:', err);
      setError(API_ERROR_MESSAGES.FETCH_MESSAGES);
    } finally {
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // マッチングがキャンセルされた場合のコールバック
  const handleMatchCanceled = () => {
    // 実際にキャンセルされたかどうかを再確認
    const storedMatchId = sessionStorage.getItem('current_match_id');
    console.log('キャンセル検出:', {
      stored: storedMatchId,
      current: matchInfo?.match_id
    });

    // ポーリングがキャンセルを検出した時点で信頼し、モーダルを表示
    setShowCanceledModal(true);
  };

  // ポーリングフックを使用
  const { messages, isLoading, error: pollingError } = useChatPolling(
    matchInfo?.match_id as (number | null),
    matchInfo?.match_id as (number | null),
    {
      interval: 3000, // 3秒間隔
      onNewMessages: (newMessages) => {
        // 必要に応じて追加の処理を実装
      },
      onMatchCanceled: handleMatchCanceled,
      onError: (err) => {
        console.error('メッセージポーリングエラー:', err);
        // UI上にはエラーを表示しない（UXを損なわないため）
      },
    }
  );

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    loadMatchInfo();
  }, [router]);

  // ポーリングエラーを状態に反映
  useEffect(() => {
    if (pollingError) {
      console.error('ポーリングエラー:', pollingError);
      // エラーメッセージはUXを損なわないよう表示しない
    }
  }, [pollingError]);

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
    if (!inputValue.trim() || matchInfo === null || matchInfo.match_id === null) return;

    const content = inputValue.trim();
    // 先に入力をクリア（UXの向上）
    setInputValue('');

    try {
      setStatus(prev => ({ ...prev, isSending: true }));
      const response = await sendMessage(matchInfo.match_id, content);

      if (response.error) {
        setError(typeof response.error === 'string'
          ? response.error
          : response.error.message || 'エラーが発生しました');
        // エラー時は入力内容を復元
        setInputValue(content);
        return;
      }

      // 送信成功時はポーリングによって自動的にメッセージリストが更新される
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

      if (matchInfo === null || matchInfo.match_id === null) {
        throw new Error('マッチングIDが取得できません');
      }

      const response = await cancelMatch(matchInfo.match_id);

      if (response.error) {
        setError(typeof response.error === 'string'
          ? response.error
          : response.error.message || 'エラーが発生しました');
        setShowCancelModal(false);
        return;
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

  // エンターキーでメッセージを送信
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enterキーでの送信を削除（要件に従い改行のみに）
    // ここは空のままにして改行のデフォルト動作を維持
  };

  // ローディング中はスピナーを表示
  if (status.isLoading && !matchInfo) {
    return (
      <PageContainer className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">ロード中...</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col min-h-dvh pb-0">
      {/* ヘッダー */}
      <div
        className="sticky top-0 z-10 flex justify-between items-center p-3.5 border-b bg-white shadow-sm rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <div>
            <h1
              className="text-base font-semibold text-gray-900 mb-0.5 flex items-center gap-1.5"
            >
              {matchInfo?.user?.nickname}
              <span
                className="text-sm text-gray-600 font-normal"
              >
                （{matchInfo?.user?.department}・{matchInfo?.user?.grade}）
              </span>
            </h1>
          </div>
        </div>
        <button
          onClick={handleShowCancelModal}
          className="py-1 px-2.5 rounded-md bg-red-100 text-red-700 text-xs border border-red-200 cursor-pointer font-medium transition-all ease-in-out duration-200 flex items-center gap-1 hover:bg-red-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-0.5"
          >
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
          マッチキャンセル
        </button>
      </div>

      {/* 区切り線 */}
      <div
        className="h-0.5 bg-gradient-to-r from-indigo-500/20 via-indigo-500/60 to-indigo-500/20 mx-2.5 shadow-sm"
      ></div>

      {/* エラーメッセージ */}
      {error && (
        <div
          className="p-3 bg-red-100 text-red-700 m-2.5 rounded-lg flex items-center justify-between text-sm"
        >
          <p className="m-0">{error}</p>
          <button
            onClick={() => setError(null)}
            className="bg-transparent border-none cursor-pointer text-red-700 p-1 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* メッセージエリア */}
      <div
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div
            className="text-center text-gray-500 py-10 text-sm italic"
          >
            メッセージを送信してみましょう
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMine={message.from_user_id === getUserId()}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div
        className="border-t p-3 bg-white shadow-[0_-2px_4px_rgba(0,0,0,0.03)]"
      >
        <div
          className="flex gap-2 relative"
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            maxLength={200}
            className="flex-1 min-h-[50px] max-h-[120px] p-3 rounded-full border border-gray-300 resize-none text-sm leading-snug shadow-inner outline-none transition focus:border-indigo-600 focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_0_0_2px_rgba(79,70,229,0.1)] blur:border-gray-300 blur:shadow-inner"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || status.isSending}
            className={`self-end rounded-full w-[46px] h-[46px] flex items-center justify-center text-white border-none transition-all ease-in-out duration-200 shadow-md ${status.isSending || !inputValue.trim() ? 'bg-indigo-400 cursor-default opacity-70' : 'bg-indigo-600 cursor-pointer hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg'}`}
          >
            {status.isSending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transform rotate-45"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* キャンセル確認モーダル */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="ランチをキャンセルしますか？"
        description="マッチングをキャンセルするとユーザー一覧に戻ります。"
        onConfirm={handleCancelMatch}
        confirmText="キャンセルする"
        cancelText="戻る"
        showCancelButton={true}
        showCloseIcon={true}
      />

      {/* キャンセルされたモーダル */}
      <Modal
        isOpen={showCanceledModal}
        onClose={handleCanceledModalClose}
        title="ランチがキャンセルされました"
        description={`${matchInfo?.user?.nickname}さんがランチをキャンセルしました。ユーザー一覧に戻ります。`}
        onConfirm={handleCanceledModalClose}
        confirmText="OK"
        showCloseIcon={false}
      />
    </PageContainer>
  );
}

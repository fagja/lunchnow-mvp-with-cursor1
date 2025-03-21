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

    // マッチングが取得できている場合は誤検出の可能性があるので、再確認する
    if (matchInfo && matchInfo.match_id && (!storedMatchId || Number(storedMatchId) === matchInfo.match_id)) {
      console.log('キャンセル誤検出の可能性があるため、無視します');
      return;
    }

    // 実際にキャンセルされた場合のみモーダル表示
    setShowCanceledModal(true);
  };

  // ポーリングフックを使用
  const { messages, isLoading, error: pollingError } = useChatPolling(
    matchInfo?.match_id,
    matchInfo?.match_id,
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
        setError(response.error);
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
        setError(response.error);
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
    <PageContainer className="flex flex-col h-screen pb-0">
      {/* ヘッダー */}
      <div className="flex justify-between items-center py-4 border-b">
        <div>
          <h1 className="text-lg font-semibold">
            {matchInfo?.user?.nickname}さんとチャット
          </h1>
          <p className="text-sm text-gray-500">
            {matchInfo?.user?.end_time && `〜${matchInfo.user.end_time}`} {matchInfo?.user?.place}
          </p>
        </div>
        <Button
          onClick={handleShowCancelModal}
          variant="destructive"
          className="text-sm"
        >
          キャンセル
        </Button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <ErrorMessage
          message={error}
          className="mt-4"
          onRetry={() => setError(null)}
        />
      )}

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            メッセージを送信してみましょう
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isMine={message.from_user_id === matchInfo?.current_user_id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="border-t p-4 bg-white">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            maxLength={200}
            className="flex-1 min-h-[60px] p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || status.isSending}
            className="self-end"
          >
            {status.isSending ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
                送信中...
              </span>
            ) : (
              '送信'
            )}
          </Button>
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
      />

      {/* キャンセルされたモーダル */}
      <Modal
        isOpen={showCanceledModal}
        onClose={handleCanceledModalClose}
        title="ランチがキャンセルされました"
        description={`${matchInfo?.user?.nickname}さんがランチをキャンセルしました。ユーザー一覧に戻ります。`}
        onConfirm={handleCanceledModalClose}
        confirmText="OK"
        autoCloseMs={2000}
      />
    </PageContainer>
  );
}

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
    <PageContainer className="flex flex-col h-screen pb-0">
      {/* ヘッダー */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {matchInfo?.user?.nickname?.charAt(0)}
          </div>
          <div>
            <h1
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {matchInfo?.user?.nickname}
              <span
                style={{
                  fontSize: '0.85rem',
                  color: '#4b5563',
                  fontWeight: 'normal',
                }}
              >
                （{matchInfo?.user?.department}・{matchInfo?.user?.grade}）
              </span>
            </h1>
            <p
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                margin: 0,
              }}
            >
              {matchInfo?.user?.end_time && `空き時間: ${matchInfo?.user?.end_time}`}
              {matchInfo?.user?.place && ` / 場所: ${matchInfo?.user?.place}`}
            </p>
          </div>
        </div>
        <button
          onClick={handleShowCancelModal}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            fontSize: '0.75rem',
            border: '1px solid #fecaca',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fecaca';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fee2e2';
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: '2px' }}
          >
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
          マッチキャンセル
        </button>
      </div>

      {/* 区切り線 */}
      <div
        style={{
          height: '2px',
          background: 'linear-gradient(to right, rgba(79, 70, 229, 0.2), rgba(79, 70, 229, 0.6), rgba(79, 70, 229, 0.2))',
          margin: '0 10px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        }}
      ></div>

      {/* エラーメッセージ */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            margin: '10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem'
          }}
        >
          <p style={{ margin: 0 }}>{error}</p>
          <button
            onClick={() => setError(null)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#b91c1c',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* メッセージエリア */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          backgroundColor: '#f9fafb',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8) 2px, transparent 2px), linear-gradient(90deg, rgba(255, 255, 255, 0.8) 2px, transparent 2px)',
          backgroundSize: '30px 30px',
          backgroundPosition: '-2px -2px',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#6b7280',
              padding: '40px 0',
              fontSize: '0.9rem',
              fontStyle: 'italic',
            }}
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
        style={{
          borderTop: '1px solid #e5e7eb',
          padding: '12px 16px',
          backgroundColor: 'white',
          boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            position: 'relative',
          }}
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            maxLength={200}
            style={{
              flex: 1,
              minHeight: '50px',
              maxHeight: '120px',
              padding: '12px',
              borderRadius: '20px',
              border: '1px solid #d1d5db',
              resize: 'none',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={(e) => {
              (e.target as HTMLTextAreaElement).style.borderColor = '#4f46e5';
              (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 2px rgba(79, 70, 229, 0.1)';
            }}
            onBlur={(e) => {
              (e.target as HTMLTextAreaElement).style.borderColor = '#d1d5db';
              (e.target as HTMLTextAreaElement).style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.05)';
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || status.isSending}
            style={{
              alignSelf: 'flex-end',
              backgroundColor: status.isSending || !inputValue.trim() ? '#818cf8' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: status.isSending || !inputValue.trim() ? 'default' : 'pointer',
              opacity: status.isSending || !inputValue.trim() ? 0.7 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
            onMouseOver={(e) => {
              if (!status.isSending && inputValue.trim()) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4338ca';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (!status.isSending && inputValue.trim()) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4f46e5';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            {status.isSending ? (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span
                  style={{
                    height: '16px',
                    width: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                ></span>
              </span>
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
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
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

import { formatTime } from '@/lib/date-utils';
import { Message } from '@/types/database.types';
import { cn } from '@/lib/utils';
import { memo, useEffect } from 'react';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

/**
 * メッセージバブルコンポーネント
 * メッセージの表示とスタイリングを担当
 * メモ化によりメッセージ一覧のパフォーマンスを向上
 */
export const MessageBubble = memo(function MessageBubble({ message, isMine }: MessageBubbleProps) {
  // メッセージの送信時刻をフォーマット
  const formattedTime = formatTime(message.created_at);

  // コンテナのスタイル
  const containerStyle = {
    display: 'flex',
    width: '100%',
    marginBottom: '10px',
    justifyContent: isMine ? 'flex-end' : 'flex-start',
    animation: 'slideUp 0.3s ease-out',
  };

  // バブルのスタイル
  const bubbleStyle = {
    maxWidth: '75%',
    borderRadius: '18px',
    padding: '10px 16px',
    overflowWrap: 'break-word' as const,
    backgroundColor: isMine ? '#4361ee' : '#f3f4f6',
    background: isMine
      ? 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)'
      : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    color: isMine ? 'white' : '#1f2937',
    marginLeft: isMine ? 'auto' : '0',
    marginRight: isMine ? '0' : 'auto',
    borderBottomRightRadius: isMine ? '4px' : '18px',
    borderBottomLeftRadius: isMine ? '18px' : '4px',
    boxShadow: isMine
      ? '0 4px 6px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)'
      : '0 2px 5px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(0)',
    transition: 'all 0.2s ease',
  };

  // 時間表示のスタイル
  const timeStyle = {
    fontSize: '0.7rem',
    marginTop: '4px',
    textAlign: 'right' as const,
    color: isMine ? 'rgba(255, 255, 255, 0.8)' : '#6b7280',
    fontWeight: '300',
  };

  // テキストのスタイル
  const textStyle = {
    fontSize: '0.875rem',
    whiteSpace: 'pre-wrap' as const,
    lineHeight: '1.4',
    letterSpacing: '0.01em',
  };

  return (
    <div
      style={containerStyle}
      data-is-mine={isMine}
      className={cn(
        'flex w-full mb-2',
        isMine ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        style={bubbleStyle}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = isMine
            ? '0 6px 8px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)'
            : '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)';
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = isMine
            ? '0 4px 6px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)'
            : '0 2px 5px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)';
        }}
        className={cn(
          'max-w-[75%] rounded-lg px-4 py-2 break-words',
          isMine
            ? 'bg-blue-500 text-white ml-auto rounded-br-none'
            : 'bg-gray-100 text-gray-900 mr-auto rounded-bl-none'
        )}
      >
        <p style={textStyle} className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          style={timeStyle}
          className={cn(
            'text-xs mt-1 text-right',
            isMine ? 'text-blue-100' : 'text-gray-500'
          )}
        >
          {formattedTime}
        </p>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // メッセージIDが同じ場合は再レンダリングを防止（パフォーマンス最適化）
  return prevProps.message.id === nextProps.message.id &&
         prevProps.isMine === nextProps.isMine;
});

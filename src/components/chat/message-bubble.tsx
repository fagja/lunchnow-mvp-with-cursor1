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
    marginBottom: '8px',
    justifyContent: isMine ? 'flex-end' : 'flex-start',
  };

  // バブルのスタイル
  const bubbleStyle = {
    maxWidth: '70%',
    borderRadius: '8px',
    padding: '8px 16px',
    overflowWrap: 'break-word' as any,
    backgroundColor: isMine ? '#3b82f6' : '#f3f4f6', // blue-500 or gray-100
    color: isMine ? 'white' : '#1f2937', // white or gray-900
    marginLeft: isMine ? 'auto' : '0',
    marginRight: isMine ? '0' : 'auto',
    borderBottomRightRadius: isMine ? '0' : '8px',
    borderBottomLeftRadius: isMine ? '8px' : '0',
  };

  // 時間表示のスタイル
  const timeStyle = {
    fontSize: '0.75rem',
    marginTop: '4px',
    textAlign: 'right' as const,
    color: isMine ? '#93c5fd' : '#6b7280', // blue-200 or gray-500
  };

  // テキストのスタイル
  const textStyle = {
    fontSize: '0.875rem',
    whiteSpace: 'pre-wrap' as const,
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
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2 break-words',
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

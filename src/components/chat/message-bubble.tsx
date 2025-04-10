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

  return (
    <div
      data-is-mine={isMine}
      className={cn(
        'flex w-full mb-2',
        isMine ? 'justify-end' : 'justify-start'
        // animation: 'slideUp 0.3s ease-out', // Requires custom animation setup
      )}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-lg px-4 py-2 break-words',
          'transition-all duration-200 ease-out hover:-translate-y-0.5',
          isMine
            ? 'bg-blue-500 text-white ml-auto rounded-bl-lg rounded-br-none shadow-md hover:shadow-lg'
            : 'bg-gray-100 text-gray-900 mr-auto rounded-br-lg rounded-bl-none shadow-sm hover:shadow-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap leading-snug tracking-normal">{message.content}</p>
        <p
          className={cn(
            'text-xs mt-1 text-right font-light',
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

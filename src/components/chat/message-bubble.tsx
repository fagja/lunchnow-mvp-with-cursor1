import { formatTime } from '@/lib/date-utils';
import { Message } from '@/types/database.types';
import { cn } from '@/lib/utils';
import { memo } from 'react';

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
      className={cn(
        'flex mb-4',
        isMine ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-lg p-3 break-words',
          isMine
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-white border border-gray-200 rounded-bl-none'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <div
          className={cn(
            'text-xs mt-1',
            isMine ? 'text-primary-100' : 'text-gray-500'
          )}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // メッセージIDが同じ場合は再レンダリングを防止（パフォーマンス最適化）
  return prevProps.message.id === nextProps.message.id &&
         prevProps.isMine === nextProps.isMine;
});

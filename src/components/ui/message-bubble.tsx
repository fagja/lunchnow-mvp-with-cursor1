import React from "react";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  message: string;
  isMe: boolean;
  timestamp?: string;
  className?: string;
}

/**
 * チャットメッセージ表示用のバブルコンポーネント
 * 送信者（自分/相手）によって左右の表示位置と色が変わります
 */
export function MessageBubble({
  message,
  isMe,
  timestamp,
  className,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-full",
        isMe ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isMe
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-800 rounded-bl-none"
        )}
        role="log"
        aria-label={isMe ? "自分のメッセージ" : "相手のメッセージ"}
      >
        <p className="break-words">{message}</p>
        {timestamp && (
          <p
            className={cn(
              "text-xs mt-1",
              isMe ? "text-blue-100" : "text-gray-500"
            )}
            aria-label={`送信時間: ${timestamp}`}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

export interface SimpleMessageProps {
  message: string;
  type?: "info" | "success" | "warning" | "error";
  className?: string;
}

/**
 * シンプルなメッセージ表示コンポーネント
 * エラーメッセージやステータス表示に使用
 */
export function SimpleMessage({
  message,
  type = "info",
  className,
}: SimpleMessageProps) {
  const typeClasses = {
    info: "bg-blue-50 text-blue-700 border-blue-100",
    success: "bg-green-50 text-green-700 border-green-100",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-100",
    error: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div
      className={cn(
        "p-3 rounded-md border text-sm",
        typeClasses[type],
        className
      )}
      role={type === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  );
}
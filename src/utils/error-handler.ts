'use client';

import { useToast } from "@/components/ui/toast-context";

/**
 * エラーハンドリングとトースト通知を統合するユーティリティ
 * @param error エラーオブジェクト
 * @param customMessage カスタムエラーメッセージ（省略可）
 */
export const useErrorHandler = () => {
  const { showToast } = useToast();

  /**
   * APIリクエストのエラーをハンドリングし、適切なトースト通知を表示
   */
  const handleError = (error: unknown, customMessage?: string) => {
    console.error('エラーが発生しました:', error);
    
    // エラーメッセージの決定
    let message = customMessage || 'エラーが発生しました。もう一度お試しください。';
    
    // エラーオブジェクトからメッセージを抽出（可能な場合）
    if (error instanceof Error) {
      message = customMessage || error.message;
    }
    
    // トースト通知の表示
    showToast({
      type: 'error',
      message,
      duration: 5000,
    });
    
    return message;
  };

  return { handleError };
};
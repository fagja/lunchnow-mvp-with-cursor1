import { useState, useCallback } from 'react';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';

/**
 * エラー情報の型定義
 */
export interface ErrorInfo {
  message: string;
  timestamp: Date;
  code?: string;
  isVisible: boolean;
}

/**
 * エラーハンドラーフックのオプション
 */
interface ErrorHandlerOptions {
  /**
   * エラーを表示するかどうか（デフォルト: true）
   */
  showError?: boolean;
  /**
   * エラーの自動非表示時間（ミリ秒）（0以下で自動非表示しない）
   */
  autoHideTimeout?: number;
  /**
   * エラー発生時の追加コールバック
   */
  onError?: (error: Error) => void;
}

/**
 * 一貫したエラー処理を提供するフック
 * 
 * @param options エラーハンドラーのオプション
 * @returns エラー関連の状態と関数
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    showError = true,
    autoHideTimeout = 5000, // デフォルト5秒後に自動非表示
    onError,
  } = options;

  // エラー状態の管理
  const [error, setError] = useState<ErrorInfo | null>(null);
  
  // タイマーIDの参照
  let autoHideTimerId: NodeJS.Timeout | null = null;

  /**
   * エラーを設定する関数
   */
  const handleError = useCallback((err: unknown) => {
    // エラーオブジェクトの正規化
    const normalizedError = err instanceof Error
      ? err
      : typeof err === 'string'
        ? new Error(err)
        : new Error(API_ERROR_MESSAGES.UNKNOWN_ERROR);
    
    // 外部コールバックが存在する場合は実行
    if (onError) {
      onError(normalizedError);
    }

    // showErrorがfalseの場合は表示しない
    if (!showError) {
      return normalizedError;
    }

    // エラー情報の設定
    const errorInfo: ErrorInfo = {
      message: normalizedError.message || API_ERROR_MESSAGES.UNKNOWN_ERROR,
      timestamp: new Date(),
      isVisible: true,
    };
    
    setError(errorInfo);
    
    // 自動非表示の設定
    if (autoHideTimeout > 0) {
      // 既存のタイマーがあればクリア
      if (autoHideTimerId) {
        clearTimeout(autoHideTimerId);
      }
      
      // 新しいタイマーを設定
      autoHideTimerId = setTimeout(() => {
        hideError();
      }, autoHideTimeout);
    }
    
    return normalizedError;
  }, [showError, autoHideTimeout, onError]);

  /**
   * エラーを非表示にする関数
   */
  const hideError = useCallback(() => {
    setError((prev) => prev ? { ...prev, isVisible: false } : null);
    
    if (autoHideTimerId) {
      clearTimeout(autoHideTimerId);
      autoHideTimerId = null;
    }
  }, []);

  /**
   * エラーをリセットする関数
   */
  const resetError = useCallback(() => {
    setError(null);
    
    if (autoHideTimerId) {
      clearTimeout(autoHideTimerId);
      autoHideTimerId = null;
    }
  }, []);

  return {
    error,
    handleError,
    hideError,
    resetError,
  };
}
import { ApiError } from '@/types/api.types';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';

/**
 * エラーをApiError型に標準化する
 * 
 * 様々な形式のエラーを統一的なApiError型に変換し、
 * アプリケーション全体で一貫したエラーハンドリングを可能にする
 * 
 * @param error 変換するエラー (Error, ApiError, string, unknown)
 * @param defaultMessage デフォルトのエラーメッセージ
 * @returns 標準化されたApiError
 */
export function normalizeError(
  error: unknown, 
  defaultMessage: string = API_ERROR_MESSAGES.UNKNOWN_ERROR
): ApiError {
  // すでにApiError型の場合はそのまま返す
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return error as ApiError;
  }
  
  // Errorオブジェクトの場合
  if (error instanceof Error) {
    return {
      code: 'general_error',
      message: error.message || defaultMessage
    };
  }
  
  // 文字列の場合
  if (typeof error === 'string') {
    return {
      code: 'general_error',
      message: error
    };
  }
  
  // それ以外の場合（未知の型）
  return {
    code: 'general_error',
    message: defaultMessage
  };
}

/**
 * エラーをハンドリングするためのユーティリティ
 * 
 * エラーを標準化して、必要に応じてコールバックを実行する
 * 
 * @param error 処理するエラー
 * @param onError エラー発生時に実行するコールバック関数
 * @param defaultMessage デフォルトのエラーメッセージ
 * @returns 標準化されたApiError
 */
export function handleError(
  error: unknown,
  onError?: (error: ApiError) => void,
  defaultMessage: string = API_ERROR_MESSAGES.UNKNOWN_ERROR
): ApiError {
  const normalizedError = normalizeError(error, defaultMessage);
  
  if (onError) {
    onError(normalizedError);
  }
  
  return normalizedError;
}
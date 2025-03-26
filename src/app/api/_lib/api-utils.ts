import { NextResponse } from 'next/server';
import { ApiResponse, ApiError, ApiErrorCode } from '@/types/api.types';

/**
 * APIレスポンスを作成するヘルパー関数
 */
export function createApiResponse<T>(
  data: T | undefined,
  status: number,
  error?: ApiError | string,
  headers?: Headers
): NextResponse {
  const response: ApiResponse<T> = {
    data,
    status,
    error
  };

  return NextResponse.json(response, {
    status,
    headers
  });
}

/**
 * API成功レスポンス生成関数
 * @param data レスポンスデータ
 * @param status HTTPステータスコード
 * @param headers レスポンスヘッダー
 * @returns APIレスポンス
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  headers?: Headers
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      status
    },
    {
      status,
      headers
    }
  );
}

/**
 * APIエラーレスポンス生成関数
 * @param error エラーメッセージ
 * @param status HTTPステータスコード
 * @param errorCode エラーコード
 * @returns APIエラーレスポンス
 */
export function createErrorResponse<T>(
  error: string,
  status: number = 400,
  errorCode?: ApiErrorCode
): NextResponse<ApiResponse<T>> {
  // エラーコードが指定されている場合はApiErrorオブジェクトを作成
  const errorObject = errorCode
    ? { code: errorCode, message: error } as ApiError
    : error;

  return NextResponse.json(
    {
      error: errorObject,
      status
    },
    { status }
  );
}

/**
 * バリデーションエラーレスポンス生成関数
 * @param error エラーメッセージ
 * @returns バリデーションエラーレスポンス
 */
export function createValidationErrorResponse<T>(
  error: string
): NextResponse<ApiResponse<T>> {
  return createErrorResponse<T>(error, 400, 'validation_error');
}

/**
 * 認証エラーレスポンス生成関数
 * @param error エラーメッセージ
 * @returns 認証エラーレスポンス
 */
export function createAuthErrorResponse<T>(
  error: string = '認証に失敗しました。再度ログインしてください。'
): NextResponse<ApiResponse<T>> {
  return createErrorResponse<T>(error, 401, 'unauthorized_error');
}

/**
 * 権限エラーレスポンス生成関数
 * @param error エラーメッセージ
 * @returns 権限エラーレスポンス
 */
export function createForbiddenErrorResponse<T>(
  error: string = 'この操作を行う権限がありません。'
): NextResponse<ApiResponse<T>> {
  return createErrorResponse<T>(error, 403, 'forbidden_error');
}

/**
 * 未検出エラーレスポンス生成関数
 * @param error エラーメッセージ
 * @returns 未検出エラーレスポンス
 */
export function createNotFoundErrorResponse<T>(
  error: string = '指定されたリソースが見つかりません。'
): NextResponse<ApiResponse<T>> {
  return createErrorResponse<T>(error, 404, 'not_found');
}

/**
 * 競合エラーレスポンス生成関数
 * @param error エラーメッセージ
 * @returns 競合エラーレスポンス
 */
export function createConflictErrorResponse<T>(
  error: string = 'リソースが既に存在しています。'
): NextResponse<ApiResponse<T>> {
  return createErrorResponse<T>(error, 409, 'conflict_error');
}

/**
 * サーバーエラーレスポンス生成関数
 * @param error エラーメッセージ
 * @returns サーバーエラーレスポンス
 */
export function createServerErrorResponse<T>(
  error: string = 'サーバーエラーが発生しました。しばらく経ってからお試しください。'
): NextResponse<ApiResponse<T>> {
  return createErrorResponse<T>(error, 500, 'general_error');
}

/**
 * 不正なIDパラメータのチェック
 */
export function isValidId(id: string | null | undefined): id is string {
  return !!id && !isNaN(Number(id));
}

/**
 * ログ出力関数
 */
export function logError(context: string, error: any): void {
  console.error(`[API Error] ${context}:`, error);
}

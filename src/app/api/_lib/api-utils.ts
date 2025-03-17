import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api.types';

/**
 * APIレスポンスを作成するヘルパー関数
 */
export function createApiResponse<T>(
  data: T | undefined,
  status: number,
  error?: string,
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
 * 成功レスポンスを作成するヘルパー関数
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  headers?: Headers
): NextResponse {
  return createApiResponse(data, status, undefined, headers);
}

/**
 * エラーレスポンスを作成するヘルパー関数
 */
export function createErrorResponse<T>(error: string, status: number = 500): NextResponse {
  return createApiResponse<T>(undefined, status, error);
}

/**
 * バリデーションエラーレスポンスを作成するヘルパー関数
 */
export function createValidationErrorResponse<T>(error: string): NextResponse {
  return createErrorResponse<T>(error, 400);
}

/**
 * 不正なIDパラメータのチェック
 */
export function isValidId(id: string | null | undefined): boolean {
  return !!id && !isNaN(Number(id));
}

/**
 * ログ出力関数
 */
export function logError(context: string, error: any): void {
  console.error(`[API Error] ${context}:`, error);
}

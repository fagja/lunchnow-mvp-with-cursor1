import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api.types';
import { getUserIdFromServer, verifyServerUserId } from '@/lib/auth-utils';
import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/constants';

/**
 * APIレスポンスを作成する共通関数
 *
 * @param options レスポンスオプション
 * @returns NextResponse
 */
export function createApiResponse<T>(
  options: {
    data?: T;
    error?: { code: string; message: string } | string;
    status?: number;
    headers?: Headers;
  } = {}
): NextResponse<ApiResponse<T>> {
  const {
    data,
    error,
    status = error ? (typeof error === 'string' ? 400 : 400) : 200,
    headers
  } = options;

  let errorObj: { code: string; message: string } | undefined;

  if (error) {
    if (typeof error === 'string') {
      errorObj = {
        code: ERROR_CODES.UNKNOWN_ERROR,
        message: error
      };
    } else {
      errorObj = error;
    }
  }

  const response: ApiResponse<T> = {
    data,
    status,
    error: errorObj
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
 * @returns APIレスポンス
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return createApiResponse<T>({ data, status });
}

/**
 * APIエラーレスポンス生成関数
 * @param errorMessage エラーメッセージ
 * @param status HTTPステータスコード
 * @param errorCode エラーコード
 * @returns APIエラーレスポンス
 */
export function createErrorResponse<T>(
  errorMessage: string,
  status: number = 400,
  errorCode: string = ERROR_CODES.UNKNOWN_ERROR
): NextResponse<ApiResponse<T>> {
  return createApiResponse<T>({
    error: { code: errorCode, message: errorMessage },
    status
  });
}

/**
 * バリデーションエラーレスポンス生成関数
 * @param message エラーメッセージ（省略時はデフォルトメッセージ）
 * @returns バリデーションエラーレスポンス
 */
export function createValidationErrorResponse<T>(
  message: string = ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR]
): NextResponse<ApiResponse<T>> {
  return createErrorResponse<T>(message, 400, ERROR_CODES.VALIDATION_ERROR);
}

/**
 * 認証エラーレスポンス生成関数
 * @param message エラーメッセージ（省略時はデフォルトメッセージ）
 * @returns 認証エラーレスポンス
 */
export function createAuthErrorResponse<T>(
  message: string = ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED]
): NextResponse<ApiResponse<T>> {
  return createErrorResponse<T>(message, 401, ERROR_CODES.UNAUTHORIZED);
}

/**
 * 権限エラーレスポンス生成関数
 * @param message エラーメッセージ（省略時はデフォルトメッセージ）
 * @returns 権限エラーレスポンス
 */
export function createForbiddenErrorResponse<T>(
  message: string = ERROR_MESSAGES[ERROR_CODES.FORBIDDEN_ERROR]
): NextResponse<ApiResponse<T>> {
  return createErrorResponse<T>(message, 403, ERROR_CODES.FORBIDDEN_ERROR);
}

/**
 * 未検出エラーレスポンス生成関数
 * @param message エラーメッセージ（省略時はデフォルトメッセージ）
 * @returns 未検出エラーレスポンス
 */
export function createNotFoundErrorResponse<T>(
  message: string = ERROR_MESSAGES[ERROR_CODES.NOT_FOUND]
): NextResponse<ApiResponse<T>> {
  return createErrorResponse<T>(message, 404, ERROR_CODES.NOT_FOUND);
}

/**
 * 競合エラーレスポンス生成関数
 * @param message エラーメッセージ（省略時はデフォルトメッセージ）
 * @returns 競合エラーレスポンス
 */
export function createConflictErrorResponse<T>(
  message: string = ERROR_MESSAGES[ERROR_CODES.CONFLICT_ERROR]
): NextResponse<ApiResponse<T>> {
  return createErrorResponse<T>(message, 409, ERROR_CODES.CONFLICT_ERROR);
}

/**
 * サーバーエラーレスポンス生成関数
 * @param message エラーメッセージ（省略時はデフォルトメッセージ）
 * @returns サーバーエラーレスポンス
 */
export function createServerErrorResponse<T>(
  message: string = ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR]
): NextResponse<ApiResponse<T>> {
  return createErrorResponse<T>(message, 500, ERROR_CODES.SERVER_ERROR);
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

/**
 * Cookieからユーザーを認証し、IDを取得する関数
 * @returns ユーザーIDまたはnull
 */
export async function authenticateUser(): Promise<number | null> {
  return await getUserIdFromServer();
}

/**
 * リクエストユーザーIDとCookieのユーザーIDを検証する関数
 * @param requestUserId リクエストに含まれるユーザーID
 * @returns 検証結果（成功/失敗）とユーザーID
 */
export async function verifyUserId(requestUserId: number): Promise<{ isValid: boolean; userId: number | null }> {
  return await verifyServerUserId(requestUserId);
}

/**
 * ユーザー認証エラーレスポンスを生成する関数
 */
export function createAuthenticationErrorResponse<T>() {
  return createAuthErrorResponse<T>();
}

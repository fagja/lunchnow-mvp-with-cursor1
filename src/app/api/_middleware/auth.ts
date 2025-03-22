import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromServer, verifyServerUserId } from '@/lib/auth-utils';
import { createAuthErrorResponse, createForbiddenErrorResponse } from '../_lib/api-utils';

/**
 * 基本認証ミドルウェア - ユーザーIDの存在を確認するラッパー関数
 *
 * @param handler - リクエストを処理するハンドラー関数（検証済みのユーザーIDが渡される）
 * @returns 認証済みのリクエストハンドラー
 */
export function withBasicAuth(
  handler: (req: NextRequest, userId: number) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const userId = await getUserIdFromServer();

    if (!userId) {
      return createAuthErrorResponse();
    }

    return handler(request, userId);
  };
}

/**
 * ユーザー一致検証ミドルウェア - リクエストのユーザーIDとCookieのユーザーIDが一致するか確認
 *
 * @param handler - リクエストを処理するハンドラー関数
 * @param getUserIdFromRequest - リクエストからユーザーIDを抽出する関数
 * @returns 認証済みのリクエストハンドラー
 */
export function withMatchingUserAuth(
  handler: (req: NextRequest, userId: number) => Promise<NextResponse>,
  getUserIdFromRequest: (req: NextRequest) => Promise<number | null>
) {
  return withBasicAuth(async (request: NextRequest, authenticatedUserId: number) => {
    // リクエストからユーザーIDを取得
    const requestUserId = await getUserIdFromRequest(request);

    // ユーザーIDの検証
    if (!requestUserId || requestUserId !== authenticatedUserId) {
      return createForbiddenErrorResponse();
    }

    return handler(request, authenticatedUserId);
  });
}

// 後方互換性のために古い名前のエクスポートも維持
/**
 * @deprecated withBasicAuth を使用してください
 */
export const withAuth = withBasicAuth;

/**
 * @deprecated withMatchingUserAuth を使用してください
 */
export const withUserVerification = withMatchingUserAuth;

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Like } from '@/types/database.types';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  isValidId,
  logError,
  authenticateUser,
  createAuthenticationErrorResponse
} from '../_lib/api-utils';
import { withUserVerification } from '../_middleware/auth';

/**
 * いいね登録処理
 * POST /api/likes
 * body: { fromUserId: number, toUserId: number }
 */
export const POST = withUserVerification(
  async (request: NextRequest, authenticatedUserId: number) => {
    try {
      const body = await request.json();
      const { fromUserId, toUserId } = body;

      // パラメータ検証
      if (!isValidId(fromUserId) || !isValidId(toUserId)) {
        return createValidationErrorResponse<Like>('パラメータエラー');
      }

      // リクエストのユーザーIDとCookieのユーザーIDが一致することは
      // すでにミドルウェアで検証済み

      // 自分自身へのいいねを防止
      if (fromUserId === toUserId) {
        return createValidationErrorResponse<Like>('自分自身にいいねはできません');
      }

      // いいね登録処理
      const { data, error } = await supabase
        .from('likes')
        .insert([{
          from_user_id: fromUserId,
          to_user_id: toUserId
        }])
        .select('*')
        .single();

      if (error) {
        logError('いいね登録', error);

        // 一意性制約違反（すでにいいね済み）の場合は専用メッセージ
        if (error.code === '23505') {
          return createErrorResponse<Like>('すでにいいねしています', 409);
        }

        return createErrorResponse<Like>('エラーが発生しました', 500);
      }

      return createSuccessResponse<Like>(data, 201);
    } catch (error) {
      logError('いいね登録処理の例外', error);
      return createErrorResponse<Like>('エラーが発生しました', 500);
    }
  },
  // リクエストボディからユーザーID（fromUserId）を抽出する関数
  async (request: NextRequest): Promise<number | null> => {
    try {
      const body = await request.json();
      return body.fromUserId || null;
    } catch (e) {
      return null;
    }
  }
);

/**
 * ユーザーごとのいいねリスト取得
 * GET /api/likes?fromUserId=123&date=2023-01-01
 */
export async function GET(request: NextRequest) {
  try {
    // Cookieからユーザー認証
    const authenticatedUserId = authenticateUser();
    if (!authenticatedUserId) {
      return createAuthenticationErrorResponse<Like[]>();
    }

    const url = new URL(request.url);
    const fromUserId = url.searchParams.get('fromUserId');
    const toUserId = url.searchParams.get('toUserId');
    const dateParam = url.searchParams.get('date') || new Date().toISOString().split('T')[0]; // 指定がなければ今日の日付

    // パラメータ検証（fromUserIdかtoUserIdのどちらかは必須）
    if ((!isValidId(fromUserId) && !isValidId(toUserId)) || !dateParam) {
      return createValidationErrorResponse<Like[]>('パラメータエラー');
    }

    // リクエストパラメータのユーザーIDとCookieのユーザーIDの検証
    if (isValidId(fromUserId) && parseInt(fromUserId, 10) !== authenticatedUserId) {
      return createErrorResponse<Like[]>('不正なユーザーIDです', 403);
    }

    // クエリ作成
    let query = supabase
      .from('likes')
      .select('*');

    // 日付で絞り込み（当日のみ）
    query = query.gte('created_at', `${dateParam}T00:00:00Z`);
    query = query.lt('created_at', `${dateParam}T23:59:59Z`);

    // ユーザーIDで絞り込み
    if (isValidId(fromUserId)) {
      query = query.eq('from_user_id', fromUserId);
    }

    if (isValidId(toUserId)) {
      query = query.eq('to_user_id', toUserId);
    }

    // クエリ実行
    const { data, error } = await query;

    if (error) {
      logError('いいね一覧取得', error);
      return createErrorResponse<Like[]>('エラーが発生しました', 500);
    }

    return createSuccessResponse<Like[]>(data || []);
  } catch (error) {
    logError('いいね一覧取得処理の例外', error);
    return createErrorResponse<Like[]>('エラーが発生しました', 500);
  }
}

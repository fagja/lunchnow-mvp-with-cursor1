import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { RecruitingUser } from '@/types/database.types';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  isValidId,
  logError,
  authenticateUser,
  createAuthenticationErrorResponse
} from '../../_lib/api-utils';
import { withUserVerification } from '../../_middleware/auth';

/**
 * 募集中ユーザー一覧取得API
 * GET /api/users/recruiting?currentUserId=123
 *
 * 募集中ユーザーの条件：
 * 1. is_matched = false (マッチしていない)
 * 2. recruiting_since > NOW() - INTERVAL '20 minutes' (20分以内に募集開始)
 * 3. id != currentUserId (自分以外)
 */
export const GET = withUserVerification(
  async (request: NextRequest, authenticatedUserId: number) => {
    try {
      // クエリパラメータからcurrentUserIdを取得
      const url = new URL(request.url);
      const currentUserId = url.searchParams.get('currentUserId');

      if (!isValidId(currentUserId)) {
        return createValidationErrorResponse<RecruitingUser[]>('パラメータエラー');
      }

      // 認証されたユーザーIDとクエリパラメータのユーザーIDが一致するか確認
      // すでにミドルウェアでチェック済みだが、念のため確認
      if (parseInt(currentUserId, 10) !== authenticatedUserId) {
        return createErrorResponse<RecruitingUser[]>('不正なユーザーIDです', 403);
      }

      // 20分前の時刻を計算
      const twentyMinutesAgo = new Date();
      twentyMinutesAgo.setMinutes(twentyMinutesAgo.getMinutes() - 20);
      const twentyMinutesAgoStr = twentyMinutesAgo.toISOString();

      // 当日の日付（YYYY-MM-DD）
      const today = new Date().toISOString().split('T')[0];

      // トランザクションを使用して一貫性のあるデータを取得
      const { data, error } = await supabase.rpc('get_recruiting_users', {
        p_current_user_id: parseInt(currentUserId),
        p_min_recruiting_time: twentyMinutesAgoStr,
        p_today: today
      });

      if (error) {
        logError('募集中ユーザー情報取得', error);
        return createErrorResponse<RecruitingUser[]>('エラーが発生しました', 500);
      }

      // APIレスポンス形式に整形
      const recruitingUsers = data || [];

      return createSuccessResponse<RecruitingUser[]>(recruitingUsers);
    } catch (error) {
      logError('募集中ユーザー取得の例外', error);
      return createErrorResponse<RecruitingUser[]>('エラーが発生しました', 500);
    }
  },
  // URLクエリパラメータからユーザーIDを抽出する関数
  async (request: NextRequest): Promise<number | null> => {
    const url = new URL(request.url);
    const currentUserId = url.searchParams.get('currentUserId');
    return currentUserId ? parseInt(currentUserId, 10) : null;
  }
);

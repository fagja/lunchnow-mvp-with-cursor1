import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { RecruitingUser } from '@/types/database.types';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  isValidId,
  logError
} from '../../_lib/api-utils';

/**
 * 募集中ユーザー一覧取得API
 * GET /api/users/recruiting?currentUserId=123
 * 
 * 募集中ユーザーの条件：
 * 1. is_matched = false (マッチしていない)
 * 2. recruiting_since > NOW() - INTERVAL '20 minutes' (20分以内に募集開始)
 * 3. id != currentUserId (自分以外)
 */
export async function GET(request: NextRequest) {
  try {
    // クエリパラメータからcurrentUserIdを取得
    const url = new URL(request.url);
    const currentUserId = url.searchParams.get('currentUserId');
    
    if (!isValidId(currentUserId)) {
      return createValidationErrorResponse<RecruitingUser[]>('現在のユーザーIDが必要です');
    }

    // いいね情報の取得（現在のユーザーが誰にいいねしたか）
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('to_user_id')
      .eq('from_user_id', currentUserId)
      .gte('created_at', new Date().toISOString().split('T')[0]); // 当日のいいねのみ

    if (likesError) {
      logError('いいね取得', likesError);
      return createErrorResponse<RecruitingUser[]>('いいね情報の取得に失敗しました', 500);
    }

    // いいね済みユーザーIDのセット作成
    const likedUserIds = new Set((likes || []).map(like => like.to_user_id));

    // 20分前の時刻を計算
    const twentyMinutesAgo = new Date();
    twentyMinutesAgo.setMinutes(twentyMinutesAgo.getMinutes() - 20);
    
    // 募集中ユーザー取得
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('is_matched', false) // マッチしていない
      .gte('recruiting_since', twentyMinutesAgo.toISOString()) // 20分以内に募集開始
      .neq('id', currentUserId); // 自分以外

    if (usersError) {
      logError('ユーザー取得', usersError);
      return createErrorResponse<RecruitingUser[]>('ユーザー情報の取得に失敗しました', 500);
    }

    // いいね状態を付加した結果を作成
    const recruitingUsers: RecruitingUser[] = (users || []).map(user => ({
      ...user,
      liked_by_me: likedUserIds.has(user.id)
    }));

    return createSuccessResponse<RecruitingUser[]>(recruitingUsers);
  } catch (error) {
    logError('募集中ユーザー取得の例外', error);
    return createErrorResponse<RecruitingUser[]>('予期せぬエラーが発生しました', 500);
  }
}
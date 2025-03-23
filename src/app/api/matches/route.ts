import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Match } from '@/types/database.types';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createConflictErrorResponse,
  isValidId,
  logError,
  authenticateUser,
  createAuthenticationErrorResponse
} from '../_lib/api-utils';
import { withAuth } from '../_middleware/auth';

/**
 * マッチング登録API
 * POST /api/matches
 * body: { userId1: number, userId2: number }
 */
export const POST = withAuth(async (request: NextRequest, authenticatedUserId: number) => {
  try {
    const body = await request.json();
    const { userId1, userId2 } = body;

    // パラメータ検証
    if (!isValidId(userId1) || !isValidId(userId2)) {
      return createValidationErrorResponse<Match>('パラメータエラー');
    }

    // 数値型に変換（一度だけ行う）
    const numericUserId1 = Number(userId1);
    const numericUserId2 = Number(userId2);

    // 自分自身とのマッチングを防止
    if (numericUserId1 === numericUserId2) {
      return createValidationErrorResponse<Match>('自分自身とはマッチングできません');
    }

    // 認証されたユーザーがマッチングのどちらかのユーザーであることを確認
    if (authenticatedUserId !== numericUserId1 && authenticatedUserId !== numericUserId2) {
      return createErrorResponse<Match>('不正なユーザーIDです', 403);
    }

    // トランザクション内でマッチング登録処理を実行
    const { data: match, error } = await supabase.rpc('create_match', {
      p_user_id_1: numericUserId1,
      p_user_id_2: numericUserId2
    });

    if (error) {
      logError('マッチング登録', error);

      // 既存マッチ制約エラーの場合は専用メッセージ
      if (error.code === '23505') {
        return createConflictErrorResponse<Match>('ユーザーは既にマッチング中です');
      }

      return createErrorResponse<Match>('マッチング登録に失敗しました', 500);
    }

    return createSuccessResponse<Match>(match, 201);
  } catch (error) {
    logError('マッチング登録処理の例外', error);
    return createErrorResponse<Match>('エラーが発生しました', 500);
  }
});

/**
 * ユーザーIDからマッチ情報を取得
 * GET /api/matches?userId=123
 */
export const GET = withAuth(async (request: NextRequest, authenticatedUserId: number) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    // パラメータ検証
    if (!isValidId(userId)) {
      return createValidationErrorResponse<Match>('パラメータエラー');
    }

    // リクエストのユーザーIDが認証されたユーザーIDと一致するか確認
    const numericUserId = Number(userId);
    if (numericUserId !== authenticatedUserId) {
      return createErrorResponse<Match>('不正なユーザーIDです', 403);
    }

    // ユーザーIDからアクティブなマッチングを検索
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .eq('is_canceled', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // レコードが見つからない場合
      if (error.code === 'PGRST116') {
        return createSuccessResponse<null>(null);
      }

      logError('マッチング取得', error);
      return createErrorResponse<Match>('マッチング取得に失敗しました', 500);
    }

    return createSuccessResponse<Match>(data);
  } catch (error) {
    logError('マッチング取得処理の例外', error);
    return createErrorResponse<Match>('エラーが発生しました', 500);
  }
});

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MatchedUser, User, Message } from '@/types/database.types';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  isValidId,
  logError
} from '../../_lib/api-utils';

/**
 * 現在のマッチングユーザー情報を取得するAPI
 * GET /api/matches/current?userId=123
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    // パラメータ検証
    if (!isValidId(userId)) {
      return createValidationErrorResponse<MatchedUser>('パラメータエラー');
    }

    // 数値型に変換
    const numericUserId = Number(userId);

    // ユーザーIDからアクティブなマッチングを検索
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .or(`user_id_1.eq.${numericUserId},user_id_2.eq.${numericUserId}`)
      .eq('is_canceled', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (matchError) {
      // レコードが見つからない場合
      if (matchError.code === 'PGRST116') {
        return createSuccessResponse<null>(null);
      }

      logError('マッチング取得', matchError);
      return createErrorResponse<MatchedUser>('マッチング取得に失敗しました', 500);
    }

    // 自分以外のマッチングユーザーIDを取得
    const otherUserId = match.user_id_1 === numericUserId ? match.user_id_2 : match.user_id_1;

    // マッチングしている相手のユーザー情報を取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', otherUserId)
      .single();

    if (userError) {
      logError('マッチングユーザー情報取得', userError);
      return createErrorResponse<MatchedUser>('ユーザー情報の取得に失敗しました', 500);
    }

    // 最新メッセージの取得（あれば）
    const { data: latestMessage, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', match.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (messageError) {
      logError('最新メッセージ取得', messageError);
      // メッセージがなくてもエラーにはしない
    }

    // マッチング情報を返却
    const matchedUserData: MatchedUser = {
      match_id: match.id,
      user: userData as User,
      ...(latestMessage ? { latest_message: latestMessage as Message } : {})
    };

    return createSuccessResponse<MatchedUser>(matchedUserData);
  } catch (error) {
    logError('現在のマッチ取得処理の例外', error);
    return createErrorResponse<MatchedUser>('エラーが発生しました', 500);
  }
}
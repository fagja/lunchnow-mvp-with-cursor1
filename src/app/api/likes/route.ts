import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Like } from '@/types/database.types';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  isValidId,
  logError,
  getQueryParam
} from '../_lib/api-utils';

// このAPIルートを動的に設定
export const dynamic = 'force-dynamic';

/**
 * いいね登録処理
 * POST /api/likes
 * body: { fromUserId: number, toUserId: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromUserId, toUserId } = body;

    // パラメータ検証
    if (!isValidId(fromUserId) || !isValidId(toUserId)) {
      return createValidationErrorResponse<Like>('パラメータエラー');
    }

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

      // 外部キー制約違反の場合（ユーザーが存在しない）
      if (error.code === '23503') {
        return createErrorResponse<Like>('指定されたユーザーが見つかりません。ユーザー登録が正しく行われているか確認してください。', 404);
      }

      return createErrorResponse<Like>('エラーが発生しました', 500);
    }

    // 相互いいねの確認とマッチング作成
    const { data: match, error: matchError } = await supabase.rpc('create_match', {
      p_user_id_1: fromUserId,
      p_user_id_2: toUserId
    });

    if (matchError) {
      // マッチング作成に失敗してもいいね自体は成功しているので、エラーログだけ出力
      logError('マッチング確認・作成', matchError);
    }

    // マッチング情報を含めてレスポンスを返す（マッチングがなければnull）
    return createSuccessResponse({
      ...data,
      match: match || null
    }, 201);
  } catch (error) {
    logError('いいね登録処理の例外', error);
    return createErrorResponse<Like>('エラーが発生しました', 500);
  }
}

/**
 * ユーザーごとのいいねリスト取得
 * GET /api/likes?fromUserId=123&date=2023-01-01
 */
export async function GET(request: NextRequest) {
  try {
    const fromUserId = getQueryParam(request, 'fromUserId');
    const toUserId = getQueryParam(request, 'toUserId');
    const dateParam = getQueryParam(request, 'date') || new Date().toISOString().split('T')[0]; // 指定がなければ今日の日付

    // パラメータ検証（fromUserIdかtoUserIdのどちらかは必須）
    if ((!isValidId(fromUserId) && !isValidId(toUserId)) || !dateParam) {
      return createValidationErrorResponse<Like[]>('パラメータエラー');
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

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Message } from '@/types/database.types';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  isValidId,
  logError
} from '../../../_lib/api-utils';
import { validateMessageContent } from '@/lib/validation';

/**
 * メッセージ送信API
 * POST /api/matches/:id/messages
 * body: { from_user_id: number, content: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;
    const body = await request.json();
    const { from_user_id, content } = body;

    // パラメータ検証
    if (!isValidId(matchId)) {
      return createValidationErrorResponse<Message>('無効なマッチIDです');
    }

    if (!isValidId(from_user_id)) {
      return createValidationErrorResponse<Message>('無効なユーザーIDです');
    }

    // メッセージ内容のバリデーション
    const contentError = validateMessageContent(content);
    if (contentError) {
      return createValidationErrorResponse<Message>(contentError);
    }

    // マッチが存在するか確認
    const { data: matchExists, error: matchCheckError } = await supabase
      .from('matches')
      .select('id')
      .eq('id', matchId)
      .eq('is_canceled', false)
      .single();

    if (matchCheckError) {
      if (matchCheckError.code === 'PGRST116') {
        return createErrorResponse<Message>('有効なマッチが見つかりません', 404);
      }
      logError('マッチ確認', matchCheckError);
      return createErrorResponse<Message>('マッチ確認に失敗しました', 500);
    }

    // メッセージを保存
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        match_id: parseInt(matchId),
        from_user_id: parseInt(from_user_id.toString()),
        content
      })
      .select()
      .single();

    if (error) {
      logError('メッセージ送信', error);
      return createErrorResponse<Message>('メッセージの送信に失敗しました', 500);
    }

    return createSuccessResponse<Message>(message, 201);
  } catch (error) {
    logError('メッセージ送信処理の例外', error);
    return createErrorResponse<Message>('エラーが発生しました', 500);
  }
}

/**
 * メッセージ履歴取得API
 * GET /api/matches/:id/messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;
    const url = new URL(request.url);

    // ページネーションパラメータの取得
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const page = parseInt(url.searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // パラメータ検証
    if (!isValidId(matchId)) {
      return createValidationErrorResponse<Message[]>('無効なマッチIDです');
    }

    // 不正なページネーションパラメータを検証
    if (isNaN(limit) || limit < 1 || limit > 100 || isNaN(page) || page < 1) {
      return createValidationErrorResponse<Message[]>('無効なページネーションパラメータです');
    }

    // マッチに紐づくメッセージを取得（ページネーション対応）
    const { data, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      logError('メッセージ履歴取得', error);
      return createErrorResponse<Message[]>('メッセージ履歴の取得に失敗しました', 500);
    }

    // レスポンスヘッダーにページネーション情報を追加
    const headers = new Headers();
    headers.append('X-Total-Count', count?.toString() || '0');
    headers.append('X-Page', page.toString());
    headers.append('X-Limit', limit.toString());
    headers.append('X-Total-Pages', Math.ceil((count || 0) / limit).toString());

    return createSuccessResponse<Message[]>(data || [], 200, headers);
  } catch (error) {
    logError('メッセージ履歴取得処理の例外', error);
    return createErrorResponse<Message[]>('エラーが発生しました', 500);
  }
}

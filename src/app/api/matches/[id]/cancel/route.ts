import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Match } from '@/types/database.types';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  isValidId,
  logError
} from '../../../_lib/api-utils';

/**
 * マッチングキャンセルAPI
 * POST /api/matches/:id/cancel
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;

    // パラメータ検証
    if (!isValidId(matchId)) {
      return createValidationErrorResponse<Match>('無効なマッチIDです');
    }

    // トランザクション内でマッチングキャンセル処理を実行
    const { data, error } = await supabase.rpc('cancel_match', {
      p_match_id: parseInt(matchId)
    });

    if (error) {
      logError('マッチングキャンセル', error);

      if (error.code === 'PGRST116') {
        // マッチが見つからない場合
        return createErrorResponse<Match>('指定されたマッチは存在しません', 404);
      }

      return createErrorResponse<Match>('マッチングキャンセルに失敗しました', 500);
    }

    return createSuccessResponse<{ status: string }>({ status: 'canceled' });
  } catch (error) {
    logError('マッチングキャンセル処理の例外', error);
    return createErrorResponse<Match>('エラーが発生しました', 500);
  }
}

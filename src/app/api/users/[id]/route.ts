import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateUserRequest } from '@/types/api.types';
import { User } from '@/types/database.types';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  isValidId,
  logError
} from '../../_lib/api-utils';

/**
 * 単一ユーザー取得
 * GET /api/users/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    if (!isValidId(userId)) {
      return createValidationErrorResponse<User>('無効なユーザーIDです');
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      logError('ユーザー取得', error);
      if (error.code === 'PGRST116') {
        return createErrorResponse<User>('指定されたユーザーは存在しません', 404);
      }
      
      return createErrorResponse<User>('ユーザー取得処理でエラーが発生しました', 500);
    }

    return createSuccessResponse<User>(user);
  } catch (error) {
    logError('ユーザー取得処理の例外', error);
    return createErrorResponse<User>('予期せぬエラーが発生しました', 500);
  }
}

/**
 * ユーザー更新処理
 * PATCH /api/users/:id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    if (!isValidId(userId)) {
      return createValidationErrorResponse<User>('無効なユーザーIDです');
    }

    const body = await request.json() as UpdateUserRequest;
    
    // 必須パラメータバリデーション
    if (!body.nickname || !body.grade || !body.department) {
      return createValidationErrorResponse<User>('必須パラメータが不足しています');
    }

    // 更新データ準備
    const updateData: any = {
      nickname: body.nickname,
      grade: body.grade,
      department: body.department
    };

    // 任意フィールドの更新
    if (body.end_time !== undefined) updateData.end_time = body.end_time;
    if (body.place !== undefined) updateData.place = body.place;
    
    // 募集開始時間更新
    updateData.recruiting_since = new Date().toISOString();

    // ユーザー更新処理
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      logError('ユーザー更新', error);
      return createErrorResponse<User>('ユーザー更新処理でエラーが発生しました', 500);
    }

    return createSuccessResponse<User>(user);
  } catch (error) {
    logError('ユーザー更新処理の例外', error);
    return createErrorResponse<User>('予期せぬエラーが発生しました', 500);
  }
}
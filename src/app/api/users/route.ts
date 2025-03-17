import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateUserRequest } from '@/types/api.types';
import { User } from '@/types/database.types';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationErrorResponse,
  logError
} from '../_lib/api-utils';

/**
 * ユーザー登録処理
 * POST /api/users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as UpdateUserRequest;
    
    // 必須パラメータバリデーション
    if (!body.nickname || !body.grade || !body.department) {
      return createValidationErrorResponse<User>('必須パラメータが不足しています');
    }

    // ユーザー登録処理
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        nickname: body.nickname,
        grade: body.grade,
        department: body.department,
        end_time: body.end_time || null,
        place: body.place || null,
        is_matched: false,
        recruiting_since: new Date().toISOString()
      }])
      .select('*')
      .single();

    if (error) {
      logError('ユーザー登録', error);
      return createErrorResponse<User>('ユーザー登録処理でエラーが発生しました', 500);
    }

    return createSuccessResponse<User>(user, 201);
  } catch (error) {
    logError('ユーザー登録処理の例外', error);
    return createErrorResponse<User>('予期せぬエラーが発生しました', 500);
  }
}
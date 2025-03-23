import { User } from '@/types/database.types';

/**
 * ユーザーデータとフォーム表示モードに基づいて初期データを作成
 *
 * @param user ユーザーデータ
 * @param isEditMode 編集モードフラグ
 * @returns 初期化されたフォームデータ
 */
export function getInitialFormData(user: Partial<User> | null, isEditMode: boolean): Partial<User> {
  // ユーザーデータがない場合は空オブジェクトを返す
  if (!user) return {};

  // 編集モードでない場合はプロフィール情報のみを返す
  if (!isEditMode) {
    return {
      nickname: user.nickname || '',
      grade: user.grade || '',
      department: user.department || ''
    };
  }

  // 編集モードの場合はプロフィール情報とステータス情報の両方を返す
  return {
    nickname: user.nickname || '',
    grade: user.grade || '',
    department: user.department || '',
    end_time: user.end_time || '',
    place: user.place || ''
  };
}

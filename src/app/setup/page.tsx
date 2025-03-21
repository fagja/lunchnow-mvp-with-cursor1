'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { ProfileForm } from '@/components/forms/profile-form';
import { fetchUser, registerUser, updateUser } from '@/api/users';
import { getUserId } from '@/lib/storage-utils';
import { UpdateUserRequest } from '@/types/api.types';
import { User } from '@/types/database.types';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';
import { ErrorMessage } from '@/components/ui/error-message';

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 既存ユーザーの情報を取得
  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const userId = getUserId();

        if (userId) {
          const response = await fetchUser(userId);

          if (response.data) {
            setUser(response.data);
          }
        }
      } catch (err) {
        console.error('ユーザー情報取得エラー:', err);
        setError(API_ERROR_MESSAGES.NETWORK_ERROR);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  // フォーム送信処理
  const handleSubmit = async (data: Partial<User>) => {
    try {
      setLoading(true);
      const userId = getUserId();

      let response;

      if (userId) {
        // 既存ユーザーの更新
        response = await updateUser({
          ...data as UpdateUserRequest
        });
      } else {
        // 新規ユーザーの登録
        response = await registerUser({
          ...data as UpdateUserRequest
        });
      }

      if (response.error) {
        // エラーを適切な型に変換して処理
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error.message || 'エラーが発生しました';
        setError(errorMessage);
      } else {
        // セッションストレージとローカルストレージにリフレッシュフラグを設定
        window.sessionStorage.setItem('lunchnow_needs_refresh', 'true');
        window.localStorage.setItem('lunchnow_needs_refresh', 'true');

        // window.locationを使用して直接遷移（より確実な遷移方法）
        window.location.href = '/users?from=setup';
      }
    } catch (err) {
      console.error('ユーザー情報保存エラー:', err);
      setError(API_ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // ユーザーデータとフォーム表示モードを組み合わせた初期データを作成
  const getInitialFormData = () => {
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
  };

  return (
    <PageContainer>
      <div className="w-full max-w-md mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">ランチ設定</h1>

        <ErrorMessage error={error} />

        <ProfileForm
          initialData={getInitialFormData()}
          onSubmit={handleSubmit}
          isLoading={loading}
          isEditMode={isEditMode}
        />
      </div>
    </PageContainer>
  );
}

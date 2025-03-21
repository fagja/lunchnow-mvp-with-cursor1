'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { ProfileForm } from '@/components/forms/profile-form';
import { registerUser, updateUser } from '@/api/users';
import { getUserId } from '@/lib/storage-utils';
import { UpdateUserRequest } from '@/types/api.types';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';
import { ErrorMessage } from '@/components/ui/error-message';
import { useUserData } from '@/hooks/useUserData';
import { getInitialFormData } from '@/lib/form-utils';
import { navigateFromSetupToUsers } from '@/lib/navigation-utils';

// テストモードフラグ - テスト時にはtrueに設定
const TEST_NAVIGATION_UTILS = true;

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // カスタムフックを使ってユーザーデータを取得
  const { user, loading: userLoading, error: userError } = useUserData();

  // フォーム送信処理
  const handleSubmit = async (data: UpdateUserRequest) => {
    try {
      setLoading(true);
      const userId = getUserId();

      let response;

      if (userId) {
        // 既存ユーザーの更新
        response = await updateUser({
          ...data
        });
      } else {
        // 新規ユーザーの登録
        response = await registerUser({
          ...data
        });
      }

      if (response.error) {
        // エラーを適切な型に変換して処理
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error.message || 'エラーが発生しました';
        setError(errorMessage);
      } else {
        if (TEST_NAVIGATION_UTILS) {
          // navigateFromSetupToUsers関数を使用
          navigateFromSetupToUsers(router);
        } else {
          // window.location.hrefを使用した確実な遷移
          window.sessionStorage.setItem('lunchnow_needs_refresh', 'true');
          window.localStorage.setItem('lunchnow_needs_refresh', 'true');
          window.location.href = '/users?from=setup';
        }
      }
    } catch (err) {
      console.error('ユーザー情報保存エラー:', err);
      setError(API_ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // エラー表示の統合
  const displayError = error || userError;

  // 読み込み状態の統合
  const isLoading = loading || userLoading;

  return (
    <PageContainer>
      <div className="w-full max-w-md mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">ランチ設定</h1>

        <ErrorMessage error={displayError} />

        <ProfileForm
          initialData={getInitialFormData(user, isEditMode)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isEditMode={isEditMode}
        />
      </div>
    </PageContainer>
  );
}

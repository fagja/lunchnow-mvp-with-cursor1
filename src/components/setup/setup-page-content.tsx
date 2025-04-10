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
import Link from "next/link";

export function SetupPageContent() {
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
      console.log('フォーム送信処理開始', { userId, isEditMode });

      let response;

      if (userId) {
        // 既存ユーザーの更新
        console.log('既存ユーザーの更新:', userId);
        response = await updateUser({
          ...data
        });
      } else {
        // 新規ユーザーの登録
        console.log('新規ユーザーの登録');
        response = await registerUser({
          ...data
        });
      }

      if (response.error) {
        // エラーを適切な型に変換して処理
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error.message || 'エラーが発生しました';
        console.error('ユーザー情報保存エラー:', errorMessage);
        setError(errorMessage);
      } else {
        console.log('ユーザー情報保存成功:', response.data?.id);
        // navigateFromSetupToUsers関数を使用して遷移
        navigateFromSetupToUsers(router);
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
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background">
        {/* ... */}
      </header>
      <main className="flex-1 overflow-auto p-4">
        <div className="w-full max-w-md mx-auto py-4 min-h-[calc(100vh-40px)] flex flex-col">
          <div className="space-y-4">
            <ErrorMessage error={displayError} />
            <ProfileForm
              initialData={getInitialFormData(user, isEditMode)}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isEditMode={isEditMode}
            />
          </div>
        </div>
      </main>
      <footer className="border-t bg-muted/40 p-4 text-center text-sm">
        <div className="text-[10px] text-gray-500">
          <p className="mb-1">アプリに関するお問い合わせはインスタDMもしくはメールでお願いします。（インスタの方が返信は早いです）</p>
          <p className="mb-0">インスタ: @lunchnow_keio　　　mail: lunchnow.keio@gmail.com</p>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <Link href="/terms" className="underline" prefetch={false}>
            利用規約
          </Link>
          <span className="mx-1">・</span>
          <Link href="/privacy" className="underline" prefetch={false}>
            プライバシーポリシー
          </Link>
        </div>
      </footer>
    </div>
  );
}

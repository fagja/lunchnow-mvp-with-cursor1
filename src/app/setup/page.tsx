'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
        setError(API_ERROR_MESSAGES.NETWORK_ERROR);
        console.error('ユーザー情報取得エラー:', err);
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
        setError(response.error);
      } else {
        // 成功時はユーザー一覧ページへ
        router.push('/users');
      }
    } catch (err) {
      setError(API_ERROR_MESSAGES.NETWORK_ERROR);
      console.error('ユーザー情報保存エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="w-full max-w-md mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">ランチ設定</h1>

        <ErrorMessage error={error} />

        <ProfileForm
          initialData={user || {}}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </PageContainer>
  );
}

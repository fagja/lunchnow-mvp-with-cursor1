'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { ProfileForm } from '@/components/forms/profile-form';
import { fetchUser, registerUser, updateUser } from '@/api/users';
import { getUserIdFromLocalStorage } from '@/api/api-client';
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
        const userId = getUserIdFromLocalStorage();

        if (userId) {
          const response = await fetchUser(userId);
          if (response.data) {
            setUser(response.data);
          }
        }
      } catch (err) {
        setError(API_ERROR_MESSAGES.FETCH_USER);
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
      setError(null);

      const userId = getUserIdFromLocalStorage();
      const userData: UpdateUserRequest = {
        nickname: data.nickname,
        grade: data.grade,
        department: data.department,
        end_time: data.end_time,
        place: data.place
      };

      let response;

      if (userId) {
        // 既存ユーザーの更新
        response = await updateUser(userData);
      } else {
        // 新規ユーザーの登録
        response = await registerUser(userData);
      }

      if (response.error) {
        setError(response.error);
        return;
      }

      // 成功したらユーザー一覧画面へリダイレクト
      router.push('/users');
    } catch (err) {
      setError(API_ERROR_MESSAGES.SAVE_USER);
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

import { useState, useEffect } from 'react';
import { User } from '@/types/database.types';
import { fetchUser } from '@/api/users';
import { getUserId } from '@/lib/storage-utils';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';

type UserDataHookResult = {
  user: Partial<User> | null;
  loading: boolean;
  error: string | null;
};

/**
 * ユーザーデータを取得するカスタムフック
 * コンポーネントからユーザーデータ取得ロジックを分離
 */
export function useUserData(): UserDataHookResult {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUserData() {
      try {
        setLoading(true);
        const userId = getUserId();

        if (userId) {
          console.log('ユーザーデータ取得処理開始:', userId);
          const response = await fetchUser(userId);

          if (isMounted && response.data) {
            console.log('ユーザーデータ取得成功:', response.data);
            setUser(response.data);
          }
        } else {
          console.log('ユーザーID未設定');
        }
      } catch (err) {
        console.error('ユーザー情報取得エラー:', err);
        if (isMounted) {
          setError(API_ERROR_MESSAGES.NETWORK_ERROR);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { user, loading, error };
}

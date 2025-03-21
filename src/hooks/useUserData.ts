import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/database.types';
import { fetchUser } from '@/api/users';
import { getUserId } from '@/lib/storage-utils';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';

type UserDataHookResult = {
  user: Partial<User> | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

/**
 * ユーザーデータを取得するカスタムフック
 * コンポーネントからユーザーデータ取得ロジックを分離
 */
export function useUserData(): UserDataHookResult {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * ユーザーデータを読み込む関数
   * コンポーネント内で再取得したい場合に使用可能
   */
  const loadUserData = useCallback(async (): Promise<void> => {
    let isMounted = true;
    const cleanup = () => { isMounted = false; };

    try {
      setLoading(true);
      setError(null);
      const userId = getUserId();

      if (!userId) {
        console.log('ユーザーID未設定');
        if (isMounted) {
          setError(API_ERROR_MESSAGES.USER_NOT_FOUND);
          setLoading(false);
        }
        return;
      }

      console.log('ユーザーデータ取得処理開始:', userId);
      const response = await fetchUser(userId);

      if (!isMounted) return;

      if (response.error) {
        console.error('ユーザーデータ取得エラー:', response.error);
        setError(response.error.message || API_ERROR_MESSAGES.NETWORK_ERROR);
      } else if (response.data) {
        console.log('ユーザーデータ取得成功:', response.data);
        setUser(response.data);
        setError(null);
      } else {
        setError(API_ERROR_MESSAGES.NETWORK_ERROR);
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

    return cleanup();
  }, []);

  // 初回マウント時にデータを取得
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return { user, loading, error, refresh: loadUserData };
}

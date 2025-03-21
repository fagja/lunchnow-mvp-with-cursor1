'use client';

import { useState, useEffect, startTransition } from 'react';
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
      console.log('【デバッグ】setup画面: フォーム送信処理開始', { userId });

      let response;

      if (userId) {
        // 既存ユーザーの更新
        console.log('【デバッグ】setup画面: 既存ユーザーの更新処理');
        response = await updateUser({
          ...data as UpdateUserRequest
        });
      } else {
        // 新規ユーザーの登録
        console.log('【デバッグ】setup画面: 新規ユーザーの登録処理');
        response = await registerUser({
          ...data as UpdateUserRequest
        });
      }

      if (response.error) {
        console.error('【デバッグ】setup画面: API応答エラー', response.error);
        setError(typeof response.error === 'string' ? response.error : 'エラーが発生しました');
      } else {
        console.log('【デバッグ】setup画面: ユーザー情報保存成功');

        // セッションストレージとローカルストレージの両方にリフレッシュフラグを設定
        console.log('【デバッグ】setup画面: リフレッシュフラグを設定します');
        const timestamp = Date.now(); // タイムスタンプを生成
        window.sessionStorage.setItem('lunchnow_needs_refresh', 'true');
        window.sessionStorage.setItem('lunchnow_refresh_timestamp', timestamp.toString());
        // バックアップとしてローカルストレージにも設定（タブ間共有のため）
        window.localStorage.setItem('lunchnow_needs_refresh', 'true');
        window.localStorage.setItem('lunchnow_refresh_timestamp', timestamp.toString());
        console.log('【デバッグ】setup画面: リフレッシュフラグ設定後の状態 (sessionStorage):', window.sessionStorage.getItem('lunchnow_needs_refresh'));
        console.log('【デバッグ】setup画面: リフレッシュタイムスタンプ:', timestamp);

        // 成功時はユーザー一覧ページへ
        console.log('【デバッグ】setup画面: ユーザー一覧ページへ遷移します');

        // タイムスタンプをクエリパラメータに追加（キャッシュ回避用）
        const userPageUrl = `/users?from=setup&t=${timestamp}`;
        console.log('【デバッグ】setup画面: 遷移先URL:', userPageUrl);

        // startTransitionを使用してナビゲーションの問題を回避
        startTransition(() => {
          // Next.jsのルーターを使用した遷移
          router.push(userPageUrl);
        });

        // バックアップとして window.location も準備（ルーター遷移に問題がある場合用）
        setTimeout(() => {
          console.log('【デバッグ】setup画面: 強制遷移のタイムアウトが発動しました');
          window.location.href = userPageUrl;
        }, 500);
      }
    } catch (err) {
      console.error('【デバッグ】setup画面: 例外発生', err);
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

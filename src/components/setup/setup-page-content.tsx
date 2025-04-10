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
    <PageContainer>
      <div className="w-full max-w-md mx-auto py-4" style={{ minHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
        <div>
          <ErrorMessage error={displayError} />

          <ProfileForm
            initialData={getInitialFormData(user, isEditMode)}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isEditMode={isEditMode}
          />

          {/* ボタンと利用tipsの間の区切り線 - インラインスタイルで確実に表示 */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            marginTop: '20px',
            marginBottom: '16px',
            width: '100%'
          }}></div>

          {/* 利用tips */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '6px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>利用tips</h3>
            <ul style={{ fontSize: '10px', color: '#4b5563', paddingLeft: '8px', margin: 0 }}>
              <li style={{ marginBottom: '2px' }}>すぐにランチ可能な時に利用！</li>
              <li style={{ marginBottom: '2px' }}>10~15時推奨！</li>
              <li style={{ marginBottom: '2px' }}>ピーク時間帯は12~13時！</li>
              <li style={{ marginBottom: '2px' }}>同時アクセスユーザーしか表示されません！</li>
              <li style={{ marginBottom: '0' }}>ランチ時間帯以外の利用は非推奨！</li>
            </ul>
          </div>
        </div>

        {/* お問い合わせ先 - フッターとして画面下部に固定 */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>
            <p style={{ marginBottom: '4px' }}>アプリに関するお問い合わせはインスタDMもしくはメールでお願いします。（インスタの方が返信は早いです）</p>
            <p style={{ marginBottom: '0' }}>インスタ: @lunchnow_keio　　　mail: lunchnow.keio@gmail.com</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

import { Suspense } from 'react';
import { UserListClient } from '@/components/shared/users/UserListClient';
import { Spinner } from '@/components/ui/spinner';
import { getServerUserId } from '@/lib/server-utils';
import { getRecruitingUsers } from '@/api/recruiting';
import { redirect } from 'next/navigation';

// サーバーコンポーネントとしてのユーザー一覧ページ
export default async function UsersPage() {
  // サーバーサイドでユーザーIDを取得
  const userId = getServerUserId();

  // ユーザーIDがない場合はセットアップページにリダイレクト
  if (!userId) {
    redirect('/setup');
  }

  try {
    // サーバーサイドでデータを取得
    const initialUsersData = await getRecruitingUsers(1, 10);

    return (
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Spinner />
        </div>
      }>
        <UserListClient initialData={initialUsersData} />
      </Suspense>
    );
  } catch (error) {
    console.error('サーバーサイドでのデータ取得エラー:', error);

    // エラー時のフォールバックUI
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-2">エラーが発生しました</h2>
        <p className="text-gray-700 mb-4">ユーザー情報の取得に失敗しました。再度お試しください。</p>
        <UserListClient initialData={null} />
      </div>
    );
  }
}

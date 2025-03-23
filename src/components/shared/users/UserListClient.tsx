'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UserCard } from '@/components/shared/users/UserCard';
import { Spinner } from '@/components/ui/spinner';
import MatchPopup from '@/components/shared/users/MatchPopup';
import { RefreshButton } from '@/components/shared/users/RefreshButton';
import { Button } from '@/components/ui/button';
import { RecruitingUser } from '@/types/database.types';
import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/constants';
import { ApiResponse } from '@/types/api.types';
import { useUserList } from '@/hooks/useUserList';

interface UserListClientProps {
  initialData: ApiResponse<any> | null;
}

/**
 * ユーザーリストのクライアントコンポーネント
 * サーバーコンポーネントから受け取った初期データを表示し、
 * その後のインタラクションをクライアントサイドで処理する
 */
export function UserListClient({ initialData }: UserListClientProps) {
  // カスタムフックを使用してロジックを分離
  const {
    users,
    isLoading,
    isError,
    errorMessage,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    showMatchPopup,
    matchedUser,
    loadingLike,
    handleLike,
    handleRefreshUsers,
    closeMatchPopup,
    goToNextPage,
    goToPrevPage,
    goToProfileEdit,
    setErrorMessage
  } = useUserList(initialData);

  // ローディング中表示
  if (isLoading && !initialData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // エラー表示
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-2">エラーが発生しました</h2>
        <p className="text-gray-700 mb-4">{errorMessage || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]}</p>
        <Button
          onClick={handleRefreshUsers}
          className="px-4 py-2"
        >
          再読み込み
        </Button>
      </div>
    );
  }

  // ユーザーが見つからない場合
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Image
          src="/images/no-users.svg"
          alt="No users found"
          width={200}
          height={200}
          className="mb-4"
        />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">現在募集中のユーザーはいません</h2>
        <p className="text-gray-600 mb-6 text-center">
          しばらく経ってからもう一度お試しください。または、あなたが募集を開始してみましょう！
        </p>
        <Button
          onClick={handleRefreshUsers}
          className="px-4 py-2"
        >
          再読み込み
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        {/* プロフィール・ステータス編集ボタン */}
        <Button
          onClick={goToProfileEdit}
          variant="outline"
          className="px-4 py-2 min-h-[44px]"
        >
          プロフィール編集
        </Button>

        <h1 className="text-2xl font-bold text-center flex-grow">今日のランチメンバー</h1>

        <div className="w-32">
          {/* スペース確保用の空div */}
        </div>
      </div>

      {/* 募集状態説明テキスト */}
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600">募集状態は20分間有効です</p>
        <p className="text-sm text-gray-600">20分経過した場合、再度ランチ設定画面に戻り、再設定してください</p>
      </div>

      {/* 手動リロードボタンと最終更新時刻 */}
      <RefreshButton 
        onRefresh={handleRefreshUsers} 
        onError={setErrorMessage}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user: RecruitingUser) => (
          <UserCard
            key={user.id}
            user={user}
            onLike={() => handleLike(user)}
            isLoading={loadingLike === user.id}
          />
        ))}
      </div>

      {/* ページネーション */}
      {(hasNextPage || hasPrevPage) && (
        <div className="flex justify-center mt-8 space-x-4">
          <Button
            onClick={goToPrevPage}
            disabled={!hasPrevPage}
            variant={hasPrevPage ? "default" : "outline"}
            className="min-h-[44px]"
          >
            前へ
          </Button>
          <span className="px-4 py-2 bg-gray-100 rounded flex items-center">
            {currentPage} / {totalPages}
          </span>
          <Button
            onClick={goToNextPage}
            disabled={!hasNextPage}
            variant={hasNextPage ? "default" : "outline"}
            className="min-h-[44px]"
          >
            次へ
          </Button>
        </div>
      )}

      {/* マッチングポップアップ */}
      {showMatchPopup && matchedUser && (
        <MatchPopup user={matchedUser} onClose={closeMatchPopup} />
      )}
    </div>
  );
}

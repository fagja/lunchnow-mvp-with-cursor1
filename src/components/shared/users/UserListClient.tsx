'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserCard } from '@/components/shared/users/UserCard';
import { Spinner } from '@/components/ui/spinner';
import MatchPopup from '@/components/shared/users/MatchPopup';
import { RecruitingUser } from '@/types/database.types';
import { getUserId } from '@/lib/utils';
import { useRecruitingUsers } from '@/api/recruiting';
import { createLike } from '@/api/likes';
import { ERROR_CODES } from '@/lib/constants';
import { ApiResponse } from '@/types/api.types';

interface UserListClientProps {
  initialData: ApiResponse<any> | null;
}

/**
 * ユーザーリストのクライアントコンポーネント
 * サーバーコンポーネントから受け取った初期データを表示し、
 * その後のインタラクションをクライアントサイドで処理する
 */
export function UserListClient({ initialData }: UserListClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [likedUserIds, setLikedUserIds] = useState<number[]>([]);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchedUser, setMatchedUser] = useState<RecruitingUser | null>(null);
  const [loadingLike, setLoadingLike] = useState<number | null>(null);
  const router = useRouter();

  // SWRを使用して募集中ユーザー一覧を取得
  // initialDataがある場合は初期値として設定
  const { data: usersData, error: usersError, isLoading, mutate: refreshUsers } = useRecruitingUsers(
    currentPage,
    10,
    undefined,
    { fallbackData: initialData }
  );

  // ユーザーデータとエラーハンドリング
  const users = usersData?.data?.users || [];
  const isError = usersError || usersData?.error;

  // ページネーション情報
  const totalPages = usersData?.data?.pagination?.totalPages || 1;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // いいねが成功したときの処理
  const handleLikeSuccess = async (likedUserId: number, isMatched: boolean, matchedUserData?: RecruitingUser) => {
    setLikedUserIds((prev) => [...prev, likedUserId]);
    setLoadingLike(null);

    // マッチした場合、ポップアップを表示
    if (isMatched && matchedUserData) {
      setMatchedUser(matchedUserData);
      setShowMatchPopup(true);
    }

    // ユーザー一覧を再取得
    refreshUsers();
  };

  // いいね処理
  const handleLike = async (user: RecruitingUser) => {
    try {
      if (loadingLike !== null) return; // 既に処理中の場合は何もしない

      const userId = getUserId();
      if (!userId) {
        router.push('/setup');
        return;
      }

      setLoadingLike(user.id);

      // いいねを送信
      const likeResponse = await createLike(user.id);

      if (likeResponse.error) {
        console.error('いいねの送信に失敗しました:', likeResponse.error);
        setLoadingLike(null);
        return;
      }

      // マッチの有無を確認
      const isMatched = likeResponse.data?.isMatched || false;

      // マッチ成功時の処理
      handleLikeSuccess(user.id, isMatched, user);

    } catch (error) {
      console.error('いいねの送信中にエラーが発生しました:', error);
      setLoadingLike(null);
    }
  };

  // ポップアップを閉じる
  const closeMatchPopup = () => {
    setShowMatchPopup(false);
    setMatchedUser(null);
  };

  // 次のページへ移動
  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 前のページへ移動
  const goToPrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

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
    const errorCode = usersData?.error?.code || ERROR_CODES.UNKNOWN_ERROR;
    const errorMessage = usersData?.error?.message || 'ユーザー情報の取得に失敗しました。';

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-2">エラーが発生しました</h2>
        <p className="text-gray-700 mb-4">{errorMessage}</p>
        <p className="text-sm text-gray-500 mb-6">エラーコード: {errorCode}</p>
        <button
          onClick={() => refreshUsers()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          再読み込み
        </button>
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
        <button
          onClick={() => refreshUsers()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">今日のランチメンバー</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
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
          <button
            onClick={goToPrevPage}
            disabled={!hasPrevPage}
            className={`px-4 py-2 rounded ${
              hasPrevPage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            前へ
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={!hasNextPage}
            className={`px-4 py-2 rounded ${
              hasNextPage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            次へ
          </button>
        </div>
      )}

      {/* マッチングポップアップ */}
      {showMatchPopup && matchedUser && (
        <MatchPopup user={matchedUser} onClose={closeMatchPopup} />
      )}
    </div>
  );
}

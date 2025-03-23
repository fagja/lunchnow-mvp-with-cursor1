'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecruitingUsers } from '@/api/recruiting';
import { createLike } from '@/api/likes';
import { getClientUserId } from '@/lib/utils';
import { RecruitingUser } from '@/types/database.types';
import { ApiResponse } from '@/types/api.types';
import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/constants';

/**
 * ユーザー一覧の状態管理と操作を行うカスタムフック
 * 
 * @param initialData - 初期データ
 * @returns ユーザー一覧の状態と操作方法
 */
export function useUserList(initialData: ApiResponse<any> | null) {
  const [currentPage, setCurrentPage] = useState(1);
  const [likedUserIds, setLikedUserIds] = useState<number[]>([]);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchedUser, setMatchedUser] = useState<RecruitingUser | null>(null);
  const [loadingLike, setLoadingLike] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // SWRを使用して募集中ユーザー一覧を取得
  const { 
    data: usersData, 
    error: usersError, 
    isLoading, 
    mutate: refreshUsers 
  } = useRecruitingUsers(
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

  // いいね処理
  const handleLike = async (user: RecruitingUser) => {
    try {
      if (loadingLike !== null) return; // 既に処理中の場合は何もしない

      const userId = getClientUserId();
      if (!userId) {
        router.push('/setup');
        return;
      }

      setLoadingLike(user.id);
      setErrorMessage(null);

      // いいねを送信
      const likeResponse = await createLike(user.id);

      if (likeResponse.error) {
        const errorCode = typeof likeResponse.error === 'string' 
          ? likeResponse.error 
          : likeResponse.error.code || ERROR_CODES.UNKNOWN_ERROR;
        
        setErrorMessage(ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]);
        setLoadingLike(null);
        return;
      }

      // マッチの有無を確認
      const isMatched = likeResponse.data?.isMatched || false;

      // いいね成功時の処理
      setLikedUserIds((prev) => [...prev, user.id]);
      setLoadingLike(null);

      // マッチした場合、ポップアップを表示
      if (isMatched) {
        setMatchedUser(user);
        setShowMatchPopup(true);
      }

      // ユーザー一覧を再取得
      refreshUsers();

    } catch (error) {
      console.error('いいねの送信中にエラーが発生しました:', error);
      setErrorMessage(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]);
      setLoadingLike(null);
    }
  };

  // マッチポップアップを閉じる
  const closeMatchPopup = () => {
    setShowMatchPopup(false);
    setMatchedUser(null);
  };

  // ページネーション - 次のページへ
  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  // ページネーション - 前のページへ
  const goToPrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  // ユーザー一覧手動リフレッシュ処理
  const handleRefreshUsers = async () => {
    try {
      setErrorMessage(null);
      await refreshUsers();
    } catch (error) {
      console.error('ユーザーリスト更新エラー:', error);
      setErrorMessage(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]);
    }
  };

  // プロフィール編集画面へ移動
  const goToProfileEdit = () => {
    router.push('/setup');
  };

  return {
    // 状態
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
    
    // アクション
    handleLike,
    handleRefreshUsers,
    closeMatchPopup,
    goToNextPage,
    goToPrevPage,
    goToProfileEdit,
    setErrorMessage
  };
}
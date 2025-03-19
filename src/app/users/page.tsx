'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { UserCard } from '@/components/users/user-card';
import { RecruitingUser } from '@/types/database.types';
import { fetchRecruitingUsers } from '@/api/recruiting';
import { createLike } from '@/api/likes';
import { fetchCurrentMatch } from '@/api/matches';
import { Modal } from '@/components/ui/modal';
import { RECRUITING_EXPIRY_MINUTES } from '@/constants/app-settings';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';
import { ErrorMessage } from '@/components/ui/error-message';
import { useMatchPolling } from './hooks/useMatchPolling';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<RecruitingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<RecruitingUser | null>(null);

  // ユーザーデータを取得する関数
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchRecruitingUsers();

      if (response.error) {
        setError(response.error);
        return;
      }

      setUsers(response.data || []);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error('ユーザー一覧取得エラー:', err);
      setError(API_ERROR_MESSAGES.FETCH_USERS);
    } finally {
      setLoading(false);
    }
  };

  // マッチング成立時のコールバック関数
  const handleMatchFound = (matchData: any) => {
    // マッチングが存在し、相手ユーザーが含まれている場合
    if (matchData && matchData.user) {
      // マッチしたユーザーの情報をモーダル表示用に設定
      const partnerUser = {
        id: matchData.user.id,
        nickname: matchData.user.nickname,
        grade: matchData.user.grade,
        department: matchData.user.department,
        end_time: matchData.user.end_time,
        place: matchData.user.place,
        is_matched: true,
        recruiting_since: matchData.user.recruiting_since,
        created_at: matchData.user.created_at,
        updated_at: matchData.user.updated_at,
        liked_by_me: true
      } as RecruitingUser;
      
      // マッチングモーダルを表示
      setMatchedUser(partnerUser);
      setShowMatchModal(true);
      
      // 2秒後に自動的にチャット画面に遷移
      setTimeout(() => {
        handleMatchModalClose();
      }, 2000);
    }
  };

  // マッチング検出用ポーリングを設定
  const { startPolling, stopPolling } = useMatchPolling({
    interval: 7000, // 7秒間隔でポーリング
    onMatchFound: handleMatchFound,
    onError: (err) => {
      console.error('マッチングポーリングエラー:', err);
      // UI上にはエラーを表示しない（ユーザーエクスペリエンスを損なわないため）
    },
    detectVisibility: true, // バックグラウンド時に自動停止
    stopOnMatch: true, // マッチング成立時に自動停止
  });

  // 初回レンダリング時にマッチングを確認し、なければユーザーデータを取得
  useEffect(() => {
    const checkMatchAndLoadUsers = async () => {
      try {
        setLoading(true);
        // 既存のマッチングがあるか確認
        const matchResponse = await fetchCurrentMatch();

        // マッチングがあれば、チャット画面に遷移
        if (matchResponse.data && matchResponse.data.match_id) {
          router.push('/chat');
          return;
        }

        // マッチングがなければ、ユーザー一覧を取得
        await loadUsers();
        
        // マッチングポーリングを開始
        startPolling();
      } catch (err) {
        console.error('初期データ取得エラー:', err);
        setError('データの取得に失敗しました。再試行してください。');
        setLoading(false);
      }
    };

    checkMatchAndLoadUsers();
    
    // コンポーネントのアンマウント時にポーリングを停止
    return () => {
      stopPolling();
    };
  }, [router, startPolling, stopPolling]);

  // 「とりまランチ？」ボタンをクリックした時の処理
  const handleLike = async (userId: number) => {
    try {
      setLoading(true);
      const response = await createLike(userId);

      if (response.error) {
        // エラーメッセージがオブジェクトの場合、message プロパティを使用
        const errorMessage = typeof response.error === 'object' && response.error.message
          ? response.error.message
          : response.error;
        setError(errorMessage);
        return;
      }

      // いいねが成功した場合、ユーザーデータを更新
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, liked_by_me: true };
        }
        return user;
      });

      setUsers(updatedUsers);

      // マッチした場合、マッチモーダルを表示
      if (response.data?.match) {
        const matchedUserData = users.find(user => user.id === userId) || null;
        setMatchedUser(matchedUserData);
        setShowMatchModal(true);

        // 2秒後に自動的にチャット画面に遷移
        setTimeout(() => {
          handleMatchModalClose();
        }, 2000);
        
        // マッチング成立時にポーリングを停止（不要になるため）
        stopPolling();
      }
    } catch (err) {
      console.error('いいね送信エラー:', err);
      setError(API_ERROR_MESSAGES.SEND_LIKE);
    } finally {
      setLoading(false);
    }
  };

  // マッチモーダルを閉じてチャット画面に遷移
  const handleMatchModalClose = () => {
    setShowMatchModal(false);
    router.push('/chat');
  };

  // プロフィール編集画面に遷移
  const handleEditProfile = () => {
    router.push('/setup');
  };

  return (
    <PageContainer>
      <div className="w-full py-6">
        {/* ヘッダーセクション */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleEditProfile}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            プロフィール編集
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              募集状態は{RECRUITING_EXPIRY_MINUTES}分間有効です
            </p>
            <p className="text-xs text-gray-400">
              {RECRUITING_EXPIRY_MINUTES}分経過した場合、再度ランチ設定画面に戻り、再設定してください
            </p>
          </div>

          <button
            onClick={loadUsers}
            disabled={loading}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? '更新中...' : '更新'}
          </button>
        </div>

        {/* 最終更新時刻 */}
        {lastUpdated && (
          <p className="text-xs text-gray-500 text-right mb-4">
            最終更新: {lastUpdated}
          </p>
        )}

        {/* エラーメッセージ */}
        <ErrorMessage error={error} />

        {/* ユーザー一覧 */}
        {loading && users.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onLike={() => handleLike(user.id)}
                disabled={loading || user.liked_by_me}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <p className="text-gray-600">
              現在募集中のユーザーはいません。また後で確認してください。
            </p>
          </div>
        )}
      </div>

      {/* マッチングモーダル */}
      <Modal
        isOpen={showMatchModal}
        onClose={handleMatchModalClose}
        title="マッチング成立！"
        description={matchedUser ? `${matchedUser.nickname}さんとマッチングしました！` : ''}
        onConfirm={handleMatchModalClose}
        confirmText="OK"
        autoCloseMs={2000}
      >
        <div className="py-4 text-center">
          <p className="text-lg font-semibold text-primary">
            チャット画面に移動します
          </p>
        </div>
      </Modal>
    </PageContainer>
  );
}
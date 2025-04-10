'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { UserCard } from '@/components/users/user-card';
import { RecruitingUser, MatchedUser } from '@/types/database.types';
import { fetchRecruitingUsers } from '@/api/recruiting';
import { createLike } from '@/api/likes';
import { fetchCurrentMatch } from '@/api/matches';
import { Modal } from '@/components/ui/modal';
import { RECRUITING_EXPIRY_MINUTES } from '@/constants/app-settings';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';
import { ErrorMessage } from '@/components/ui/error-message';
import { useMatchPolling } from './hooks/useMatchPolling';
import { navigateToSetup, navigateToChat } from '@/lib/navigation-utils';
import { getLikedUserIds, saveLikedUserId } from '@/lib/storage-utils';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<RecruitingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<RecruitingUser | null>(null);
  const isMountedRef = useRef(true);
  const [gridCols, setGridCols] = useState('repeat(2, minmax(0, 1fr))');

  // ウィンドウサイズの変更を監視して列数を調整
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // スマートフォン
        setGridCols('repeat(2, minmax(0, 1fr))');
      } else if (width < 768) {
        // sm
        setGridCols('repeat(3, minmax(0, 1fr))');
      } else if (width < 1024) {
        // md
        setGridCols('repeat(4, minmax(0, 1fr))');
      } else {
        // lg以上
        setGridCols('repeat(5, minmax(0, 1fr))');
      }
    };

    // 初期設定
    handleResize();

    // リサイズイベントリスナーを追加
    window.addEventListener('resize', handleResize);

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // マウント状態を確認して状態を安全に更新する関数
  const safeSetState = (setter: any, value: any) => {
    if (isMountedRef.current) {
      setter(value);
    }
  };

  // セッションとローカルストレージのリフレッシュフラグをチェックして削除する関数
  const checkAndClearRefreshFlags = () => {
    console.log('リフレッシュフラグをチェック');
    const sessionNeedsRefresh = window.sessionStorage.getItem('lunchnow_needs_refresh');
    const localNeedsRefresh = window.localStorage.getItem('lunchnow_needs_refresh');

    // リフレッシュフラグが存在する場合は削除
    if (sessionNeedsRefresh || localNeedsRefresh) {
      console.log('リフレッシュフラグを検出、クリアします');
      window.sessionStorage.removeItem('lunchnow_needs_refresh');
      window.localStorage.removeItem('lunchnow_needs_refresh');
      return true;
    }
    return false;
  };

  // ユーザーデータを取得する関数
  const loadUsers = async () => {
    if (!isMountedRef.current) return;

    try {
      console.log('ユーザーデータ取得開始');
      const response = await fetchRecruitingUsers();

      if (!isMountedRef.current) return;

      if (response.error) {
        console.error('ユーザーデータ取得エラー:', response.error);

        // HTTP 404エラーの特別処理
        if (response.status === 404) {
          safeSetState(setError, 'データの取得に失敗しました。しばらく待ってから再試行してください。');
          safeSetState(setUsers, []); // 空の配列を設定して表示を更新
        } else {
          // APIエラーオブジェクトまたは文字列を適切に処理
          const errorMessage = typeof response.error === 'object' && response.error.message
            ? response.error.message
            : String(response.error);
          safeSetState(setError, errorMessage);
        }
      } else {
        console.log('ユーザーデータ取得成功:', response.data?.length || 0, '件');

        // 現在のユーザー状態と新しく取得したデータをマージ
        // LocalStorageのいいね情報も考慮する
        const mergedUsers = mergeUserData(users, response.data || []);

        // デバッグログ
        console.log('LocalStorageのいいね情報:', getLikedUserIds());
        console.log('マージ後のユーザー:', mergedUsers.filter(u => u.liked_by_me).length, '人がいいね済み');

        safeSetState(setUsers, mergedUsers);
        safeSetState(setLastUpdated, new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('ユーザー一覧取得エラー:', err);
      safeSetState(setError, API_ERROR_MESSAGES.FETCH_USERS);
    }
  };

  // 現在のユーザーデータと新しいユーザーデータをマージする関数
  const mergeUserData = (currentUsers: RecruitingUser[], newUsers: RecruitingUser[]): RecruitingUser[] => {
    // ユーザーIDごとのいいね状態を管理するマップを作成
    const likedStatusMap = new Map<number, boolean>();

    // 現在のユーザーからいいね状態を取り出す
    currentUsers.forEach(user => {
      if (user.liked_by_me) {
        likedStatusMap.set(user.id, true);
      }
    });

    // LocalStorage からいいね情報を取得
    const likedUserIds = getLikedUserIds();

    // LocalStorage のいいね情報をマップに追加
    likedUserIds.forEach(userId => {
      likedStatusMap.set(userId, true);
    });

    // 新しいユーザーデータに現在のいいね状態を適用
    return newUsers.map(user => {
      // サーバー側でいいね済みと判定されているか、クライアント側でいいね済みだった場合
      const isLikedByMe = user.liked_by_me || likedStatusMap.has(user.id);

      return {
        ...user,
        liked_by_me: isLikedByMe
      };
    });
  };

  // マッチング状態をチェックする関数
  const checkMatchStatus = async () => {
    if (!isMountedRef.current) return false;

    try {
      console.log('マッチング状態を確認');
      const matchResponse = await fetchCurrentMatch();

      if (!isMountedRef.current) return false;

      // マッチングがあれば、チャット画面に遷移
      if (matchResponse.data && matchResponse.data.match_id) {
        console.log('マッチングが見つかりました:', matchResponse.data.match_id);
        router.push('/chat');
        return true;
      }

      console.log('アクティブなマッチングはありません');
      return false;
    } catch (err) {
      console.error('マッチング確認エラー:', err);
      return false; // エラーが発生しても処理を続行
    }
  };

  // マッチング成立時のコールバック関数
  const handleMatchFound = (matchData: MatchedUser) => {
    // マッチングが存在し、相手ユーザーが含まれている場合
    if (matchData && matchData.user) {
      console.log('マッチング成立:', matchData.match_id);

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
      safeSetState(setMatchedUser, partnerUser);
      safeSetState(setShowMatchModal, true);
    }
  };

  // マッチング検出ポーリングの初期化
  const { startPolling: startMatchPolling, stopPolling: stopMatchPolling } = useMatchPolling({
    interval: 10000, // 10秒ごとにポーリング（適切なバランス）
    detectVisibility: true, // 画面が見えなくなったら自動停止
    immediate: true, // 即時実行
    stopOnMatch: false, // マッチング検出後もポーリングを継続
    onMatchFound: handleMatchFound, // マッチング検出時のコールバック
    onError: (error) => {
      console.error('[UsersPage] マッチングポーリングエラー:', error);
      // エラー発生時は静かに処理（ユーザーに通知せずに再試行）
    },
    showError: false, // エラーをUIに表示しない
  });

  // 初回レンダリング時にマッチングを確認し、なければユーザーデータを取得
  useEffect(() => {
    // コンポーネントマウント時に一度だけ実行される初期化関数
    const initializeData = async () => {
      try {
        safeSetState(setLoading, true);

        // セッションストレージとローカルストレージのフラグをチェック
        checkAndClearRefreshFlags();

        // マッチング状態の確認
        const hasMatch = await checkMatchStatus();

        // マッチングがない場合のみユーザーデータを取得
        if (!hasMatch && isMountedRef.current) {
          await loadUsers();

          // マッチングポーリングを開始
          startMatchPolling();
        }
      } catch (error) {
        console.error('初期化エラー:', error);
        safeSetState(setError, API_ERROR_MESSAGES.NETWORK_ERROR);
      } finally {
        safeSetState(setLoading, false);
      }
    };

    // コンポーネントのマウント状態を設定
    isMountedRef.current = true;

    // 初期化を実行
    initializeData();

    // クリーンアップ関数
    return () => {
      console.log('UsersPageコンポーネントのクリーンアップ');
      isMountedRef.current = false;
      stopMatchPolling();
    };
  }, []);

  // 「とりまランチ？」ボタンをクリックした時の処理
  const handleLike = async (userId: number) => {
    try {
      safeSetState(setLoading, true);
      console.log(`ユーザーID: ${userId} に「とりまランチ？」を送信`);

      const response = await createLike(userId);

      if (response.error) {
        handleLikeError(response.error);
        return;
      }

      // いいねが成功した場合、ユーザーデータを更新
      updateUserLikeStatus(userId);

      // LocalStorage にいいね情報を保存
      saveLikedUserId(userId);

      // マッチング処理
      handleMatchIfExists(response.data, userId);
    } catch (err) {
      console.error('いいね送信エラー:', err);
      safeSetState(setError, API_ERROR_MESSAGES.SEND_LIKE);
    } finally {
      safeSetState(setLoading, false);
    }
  };

  // いいねエラー処理
  const handleLikeError = (error: any) => {
    // エラーメッセージがオブジェクトの場合、message プロパティを使用
    const errorMessage = typeof error === 'object' && error.message
      ? error.message
      : String(error);
    safeSetState(setError, errorMessage);
  };

  // ユーザーのいいね状態を更新
  const updateUserLikeStatus = (userId: number) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, liked_by_me: true };
      }
      return user;
    });

    safeSetState(setUsers, updatedUsers);
  };

  // マッチング処理
  const handleMatchIfExists = (data: any, userId: number) => {
    if (data && 'match' in data && data.match) {
      console.log('マッチング成立:', data.match.id);
      const matchedUserData = users.find(user => user.id === userId) || null;
      safeSetState(setMatchedUser, matchedUserData);
      safeSetState(setShowMatchModal, true);
    }
  };

  // マッチモーダルを閉じてチャット画面に遷移
  const handleMatchModalClose = () => {
    // マッチングが確定したのでポーリングを停止
    stopMatchPolling();
    safeSetState(setShowMatchModal, false);
    navigateToChat(router);
  };

  // プロフィール編集画面に遷移
  const handleEditProfile = () => {
    console.log('プロフィール編集ボタンがクリックされました');

    // ナビゲーションユーティリティを使用して遷移
    navigateToSetup(router, {
      isEdit: true,
      beforeNavigate: stopMatchPolling,
      fallbackUrl: '/setup?edit=true'
    });
  };

  return (
    <PageContainer>
      <div className="w-full py-6">
        {/* ヘッダーセクション */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleEditProfile();
            }}
            style={{
              padding: '8px 16px',
              fontSize: '0.875rem',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white';
            }}
          >
            プロフィール編集
          </button>

          <div className="text-center">
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginBottom: '2px'
            }}>
              募集状態は{RECRUITING_EXPIRY_MINUTES}分間有効です
            </p>
            <p style={{
              fontSize: '0.65rem',
              color: '#9ca3af'
            }}>
              {RECRUITING_EXPIRY_MINUTES}分経過した場合、再度ランチ設定画面に戻り、再設定してください
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {lastUpdated && (
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                margin: '0'
              }}>
                最終更新: {lastUpdated}
              </p>
            )}
            <button
              onClick={loadUsers}
              disabled={loading}
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                backgroundColor: loading ? '#818cf8' : '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'background-color 0.2s, opacity 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4338ca';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4f46e5';
                }
              }}
            >
              {loading ? '更新中...' : '更新'}
            </button>
          </div>
        </div>

        {/* エラーメッセージ */}
        <ErrorMessage error={error} />

        {/* ユーザー一覧 */}
        {loading && users.length === 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '16rem'
          }}>
            <div style={{
              height: '3rem',
              width: '3rem',
              borderRadius: '9999px',
              borderBottom: '2px solid #4f46e5',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : users.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              gap: '1rem',
              width: '100%'
            }}
          >
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
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{ color: '#4b5563' }}>
              同時アクセスの未マッチユーザーはいません。また後で確認してください。 *10~15時(特に12~13時)の利用を推奨しています
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
        showCloseIcon={false}
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

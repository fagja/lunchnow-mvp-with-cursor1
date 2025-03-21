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

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<RecruitingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<RecruitingUser | null>(null);
  const isMountedRef = useRef(true);

  // ユーザーデータを取得する関数
  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    console.log('【デバッグ】ユーザーデータ取得開始');

    try {
      const response = await fetchRecruitingUsers();
      console.log('【デバッグ】fetchRecruitingUsers応答:', response);

      if (response.error) {
        console.error('【デバッグ】API呼び出しエラー:', response.error, 'ステータス:', response.status);

        // HTTP 404エラーの特別処理
        if (response.status === 404) {
          console.error('【デバッグ】リソースが見つかりません（404エラー）');
          setError('データの取得に失敗しました。しばらく待ってから再試行してください。');
          setUsers([]); // 空の配列を設定して表示を更新
        } else {
          setError(response.error);
        }
      } else {
        console.log('【デバッグ】取得ユーザー数:', response.data?.length || 0);
        setUsers(response.data || []);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('【デバッグ】ユーザー一覧取得例外:', err);
      setError(API_ERROR_MESSAGES.FETCH_USERS);
    }

    console.log('【デバッグ】ユーザーデータ取得完了');
    setLoading(false);
  };

  // マッチング成立時のコールバック関数
  const handleMatchFound = (matchData: MatchedUser) => {
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
    interval: 15000, // 15秒間隔でポーリング (7秒から延長)
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
    // グローバルにデバッグ情報を公開
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.__lunchnow_debug = {
        checkRefreshFlag: () => {
          const sessionFlag = window.sessionStorage.getItem('lunchnow_needs_refresh');
          const localFlag = window.localStorage.getItem('lunchnow_needs_refresh');
          const timestamp = window.sessionStorage.getItem('lunchnow_refresh_timestamp') ||
                          window.localStorage.getItem('lunchnow_refresh_timestamp');
          console.log('【デバッグツール】リフレッシュフラグ (session):', sessionFlag);
          console.log('【デバッグツール】リフレッシュフラグ (local):', localFlag);
          console.log('【デバッグツール】リフレッシュタイムスタンプ:', timestamp);
          return { sessionFlag, localFlag, timestamp };
        },
        clearFlags: () => {
          window.sessionStorage.removeItem('lunchnow_needs_refresh');
          window.localStorage.removeItem('lunchnow_needs_refresh');
          window.sessionStorage.removeItem('lunchnow_refresh_timestamp');
          window.localStorage.removeItem('lunchnow_refresh_timestamp');
          console.log('【デバッグツール】リフレッシュフラグをクリアしました');
        },
        forceLoadUsers: () => {
          console.log('【デバッグツール】ユーザーデータの強制ロードを開始します');
          loadUsers();
        }
      };
    }

    const checkMatchAndLoadUsers = async () => {
      console.log('【デバッグ】checkMatchAndLoadUsers関数が呼び出されました');

      if (!isMountedRef.current) return;

      try {
        setLoading(true);

        // すでにマッチがあるか確認
        try {
          console.log('【デバッグ】マッチング確認開始');
          const matchResponse = await fetchCurrentMatch();
          console.log('【デバッグ】マッチ情報:', matchResponse);

          if (matchResponse.data && matchResponse.data.match_id) {
            console.log('【デバッグ】既存のマッチが見つかりました。チャット画面へ遷移します。');
            // マッチが見つかった場合、チャット画面へ遷移
            router.push('/chat');
            return;
          }
        } catch (error) {
          console.error('【デバッグ】マッチ確認中にエラーが発生しました:', error);
        }

        // リフレッシュフラグをチェック（セッションストレージとローカルストレージの両方）
        const sessionNeedsRefresh = window.sessionStorage.getItem('lunchnow_needs_refresh');
        const localNeedsRefresh = window.localStorage.getItem('lunchnow_needs_refresh');
        const needsRefresh = sessionNeedsRefresh === 'true' || localNeedsRefresh === 'true';
        console.log('【デバッグ】リフレッシュフラグ状態:',
          { sessionNeedsRefresh, localNeedsRefresh, needsRefresh });

        // URLからタイムスタンプを取得
        const url = new URL(window.location.href);
        const urlTimestamp = url.searchParams.get('t');
        console.log('【デバッグ】URLタイムスタンプ:', urlTimestamp);
        // fromパラメータの確認
        const fromSetup = url.searchParams.get('from') === 'setup';
        console.log('【デバッグ】setup画面からの遷移:', fromSetup);

        // ナビゲーションタイプを取得（Chromeでは、window.performance.navigation.typeが使用可能）
        let navigationType = -1;
        try {
          // @ts-ignore - 型エラーを無視（一部のブラウザではサポートされていないため）
          if (window.performance && window.performance.navigation) {
            // @ts-ignore
            navigationType = window.performance.navigation.type;
            console.log('【デバッグ】ナビゲーションタイプ:', navigationType);
            // 0: 通常ナビゲーション, 1: リロード, 2: 戻る/進む, 255: その他
          }
        } catch (e) {
          console.error('【デバッグ】ナビゲーションタイプの取得に失敗:', e);
        }

        // 遷移タイプの総合判定
        const isRedirectFromSetup = fromSetup || urlTimestamp;
        const isReload = navigationType === 1;
        const isBackForward = navigationType === 2;

        console.log('【デバッグ】遷移タイプ分析:',
          { isRedirectFromSetup, isReload, isBackForward });

        console.log('【デバッグ】ユーザー一覧データ取得開始（loadUsers関数呼び出し）');
        // ユーザー一覧データを取得（リフレッシュフラグの有無にかかわらず一度だけ実行）
        try {
          await loadUsers();
          console.log('【デバッグ】ユーザー一覧データ取得完了');
        } catch (error) {
          console.error('【デバッグ】ユーザー一覧データ取得中にエラーが発生しました:', error);
          setError('データの取得に失敗しました。更新ボタンを押して再試行してください。');
        }

        // マッチングポーリングを開始
        if (isMountedRef.current) {
          console.log('【デバッグ】マッチングポーリング開始');
          startPolling();
        }

        // フラグが存在した場合は削除（セッションストレージとローカルストレージの両方）
        if (needsRefresh || isRedirectFromSetup) {
          console.log('【デバッグ】リフレッシュフラグまたはURLパラメータが検出されました。フラグを削除します。');
          window.sessionStorage.removeItem('lunchnow_needs_refresh');
          window.localStorage.removeItem('lunchnow_needs_refresh');
        }

        setLoading(false);
      } catch (err) {
        console.error('【デバッグ】checkMatchAndLoadUsers関数内でエラー発生:', err);
        if (isMountedRef.current) {
          setError('予期せぬエラーが発生しました。更新ボタンを押して再試行してください。');
          setLoading(false);
        }
      }
    };

    // 初期ロード時と再ロード時にチェックを実行
    checkMatchAndLoadUsers();

    // window.loadイベントのリスナーを追加
    window.addEventListener('load', () => {
      console.log('【デバッグ】window.loadイベントが発火しました');
      // リロード時に必要ならリフレッシュを実行
      setTimeout(() => checkMatchAndLoadUsers(), 100);
    });

    // popstateイベントのリスナーを追加
    window.addEventListener('popstate', () => {
      console.log('【デバッグ】popstateイベントが発火しました');
      // 戻る/進むボタンが使用された場合にも更新を行う
      setTimeout(() => checkMatchAndLoadUsers(), 100);
    });

    // コンポーネントのアンマウント時にポーリングを停止
    return () => {
      console.log('【デバッグ】コンポーネントアンマウント: クリーンアップ処理実行');
      isMountedRef.current = false;
      stopPolling();
      window.removeEventListener('load', () => checkMatchAndLoadUsers());
      window.removeEventListener('popstate', () => checkMatchAndLoadUsers());
    };
  }, []); // routerを依存配列から削除

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
    console.log('プロフィール編集ボタンがクリックされました');

    // 要件定義通り、画面遷移時に明示的にポーリングを停止
    stopPolling();

    // 状態更新と遷移のタイミングを確保
    Promise.resolve().then(() => {
      // edit=trueパラメータを追加して、編集モードで開く
      router.push('/setup?edit=true');
    }).catch(err => {
      console.error('遷移中にエラーが発生しました:', err);
      // フォールバック
      window.location.href = '/setup?edit=true';
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

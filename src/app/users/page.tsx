"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { Spinner } from "@/components/ui/spinner";
import { SimpleMessage } from "@/components/ui/simple-message";
import { Modal } from "@/components/ui/modal";
import { UserCard } from "@/components/shared/users/UserCard";
import { 
  fetchRecruitingUsers, 
  getRecruitingUsersKey, 
  getRecruitingSwrOptions 
} from "@/api/recruiting";
import { createLike } from "@/api/likes";
import { checkMatchStatus } from "@/api/matches";
import { getUserIdFromLocalStorage } from "@/api/api-client";
import { RecruitingUser } from "@/types/database.types";

/**
 * ユーザー一覧画面コンポーネント
 * 未マッチのユーザーリストを表示し、いいね機能を提供する
 */
export default function UsersPage() {
  const router = useRouter();
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchedUser, setMatchedUser] = useState<RecruitingUser | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("");

  // 募集中ユーザーデータ取得
  const { 
    data: usersData, 
    error: usersError, 
    mutate: refreshUsers, 
    isLoading: isLoadingUsers 
  } = useSWR(
    getRecruitingUsersKey(),
    fetchRecruitingUsers,
    getRecruitingSwrOptions()
  );

  // マッチング状態確認（7秒間隔）
  const { 
    data: matchData, 
    error: matchError,
    mutate: refreshMatch 
  } = useSWR(
    getUserIdFromLocalStorage() ? `/api/matches/check?userId=${getUserIdFromLocalStorage()}` : null,
    checkMatchStatus,
    {
      refreshInterval: 7000, // 7秒間隔
      revalidateOnFocus: true,
      dedupingInterval: 3000
    }
  );

  // マッチング状態の監視
  useEffect(() => {
    if (matchData?.data && matchData.data.isMatched) {
      // マッチが見つかった場合、マッチングユーザー情報を設定
      const matchedUserInfo = usersData?.data?.find(
        (user) => user.id === matchData.data.matchedWithUserId
      ) || null;
      
      if (matchedUserInfo) {
        setMatchedUser(matchedUserInfo);
        setShowMatchPopup(true);
      } else {
        // ユーザー情報が見つからない場合は直接チャット画面へ
        router.push('/chat');
      }
    }
  }, [matchData, usersData, router]);

  // いいね処理
  const handleLike = async (userId: number) => {
    if (isLiking) return;
    
    setIsLiking(true);
    
    try {
      const currentUserId = getUserIdFromLocalStorage();
      if (!currentUserId) {
        console.error("ユーザーIDが見つかりません");
        return;
      }
      
      const response = await createLike({
        fromUserId: currentUserId,
        toUserId: userId
      });
      
      // いいね成功後にユーザーリスト更新
      if (response.data) {
        await refreshUsers();
        
        // いいね後すぐにマッチング状態を確認
        const matchStatus = await refreshMatch();
        
        if (matchStatus?.data?.isMatched && matchStatus.data.matchedWithUserId === userId) {
          // マッチングしたユーザーを特定
          const matchedUserInfo = usersData?.data?.find(user => user.id === userId) || null;
          
          if (matchedUserInfo) {
            setMatchedUser(matchedUserInfo);
            setShowMatchPopup(true);
          }
        }
      }
    } catch (error) {
      console.error("いいね処理中にエラーが発生しました:", error);
    } finally {
      setIsLiking(false);
    }
  };

  // 手動更新処理
  const handleRefresh = async () => {
    await refreshUsers();
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  // マッチングポップアップでOKが押された時の処理
  const handleMatchConfirm = () => {
    setShowMatchPopup(false);
    router.push('/chat');
  };

  // 初回ロード時に最終更新時刻を設定
  useEffect(() => {
    if (!isLoadingUsers && usersData) {
      setLastRefreshed(new Date().toLocaleTimeString());
    }
  }, [isLoadingUsers, usersData]);

  return (
    <PageContainer>
      {/* ヘッダー部分 */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <Button
          variant="outline"
          onClick={() => router.push('/setup')}
          className="w-full sm:w-auto"
        >
          プロフィール・ステータス編集
        </Button>
        
        <div className="text-center text-sm">
          <div>募集状態は20分間有効です</div>
          <div className="text-xs text-muted-foreground">
            最終更新: {lastRefreshed || "--:--"}
          </div>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={isLoadingUsers}
          className="w-full sm:w-auto"
        >
          {isLoadingUsers ? <Spinner className="h-4 w-4 mr-2" /> : null}
          更新
        </Button>
      </div>

      {/* 説明テキスト */}
      <div className="text-sm text-center mb-6 text-muted-foreground">
        20分経過した場合、再度ランチ設定画面に戻り、再設定してください
      </div>

      {/* エラー表示 */}
      {usersError && (
        <SimpleMessage
          message="ユーザー情報の取得中にエラーが発生しました。しばらくしてから再試行してください。"
          type="error"
          className="mb-4"
        />
      )}

      {/* ユーザー一覧 */}
      {isLoadingUsers ? (
        <div className="flex justify-center items-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : usersData?.data && usersData.data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {usersData.data.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onLike={handleLike}
              isLoading={isLiking}
            />
          ))}
        </div>
      ) : (
        <SimpleMessage
          message="現在募集中のユーザーはいません。また後で確認してください。"
          type="info"
          className="my-8"
        />
      )}

      {/* マッチング成立ポップアップ */}
      <Modal
        isOpen={showMatchPopup}
        title="マッチング成立！"
        onClose={() => setShowMatchPopup(false)}
        onConfirm={handleMatchConfirm}
        confirmText="OK"
      >
        <div className="text-center py-2">
          <p className="mb-2">
            <span className="font-semibold">{matchedUser?.nickname}</span> さんとマッチングしました！
          </p>
          <p className="text-sm">
            チャット画面でランチの約束をしましょう！
          </p>
        </div>
      </Modal>
    </PageContainer>
  );
}
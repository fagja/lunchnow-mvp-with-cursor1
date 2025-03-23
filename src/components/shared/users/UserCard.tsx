"use client";

import { RecruitingUser } from "@/types/database.types";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserCardProps {
  user: RecruitingUser;
  onLike: (userId: number) => void;
  isLoading?: boolean;
}

/**
 * ユーザーカードコンポーネント
 * ユーザー一覧画面で各ユーザーの情報を表示するカード
 * 
 * @param user - 表示するユーザー情報
 * @param onLike - いいねボタン押下時のコールバック
 * @param isLoading - ローディング状態
 */
export function UserCard({ user, onLike, isLoading = false }: UserCardProps) {
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{user.nickname}</CardTitle>
        <CardDescription>{user.grade} {user.department}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-1">
          <div className="text-sm">
            <span className="font-medium">空き時間:</span> {user.end_time || '未設定'}
          </div>
          <div className="text-sm">
            <span className="font-medium">場所:</span> {user.place || '未設定'}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onLike(user.id)}
          variant={user.liked_by_me ? "secondary" : "default"}
          disabled={isLoading || user.liked_by_me}
          className="w-full"
        >
          {user.liked_by_me ? 'とりまランチ中...' : 'とりまランチ？'}
        </Button>
      </CardFooter>
    </Card>
  );
}
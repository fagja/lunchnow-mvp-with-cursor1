import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecruitingUser } from '@/types/database.types';
import { UserCardProps } from '@/types/component.types';

export function UserCard({ user, onLike, disabled = false }: UserCardProps) {
  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow duration-200"
      style={{ border: '1px solid rgba(0, 0, 0, 0.12)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}
    >
      <CardContent className="p-6">
        <div className="flex flex-col">
          {/* ニックネーム */}
          <h3 className="font-bold text-xl mb-1">{user.nickname}</h3>

          {/* 学年と学部 */}
          <p className="text-gray-600 mb-4">
            {user.grade} {user.department}
          </p>

          {/* ステータス情報 */}
          <div className="border-t pt-4 space-y-2">
            {/* 空き時間 */}
            {user.end_time && (
              <div className="flex items-center">
                <span className="text-gray-500 w-24">空き時間:</span>
                <span className="font-medium">{user.end_time}</span>
              </div>
            )}

            {/* 場所 */}
            {user.place && (
              <div className="flex items-center">
                <span className="text-gray-500 w-24">希望場所:</span>
                <span className="font-medium">{user.place}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 bg-gray-50 border-t">
        <Button
          onClick={onLike}
          disabled={disabled}
          variant={user.liked_by_me ? "secondary" : "default"}
          className={`w-full transition-colors ${user.liked_by_me ? 'bg-green-100 hover:bg-green-200 text-green-700' : ''}`}
        >
          {user.liked_by_me ? '✓ いいね済み' : 'いいね！'}
        </Button>
      </CardFooter>
    </Card>
  );
}

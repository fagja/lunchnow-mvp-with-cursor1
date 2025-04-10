import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecruitingUser } from '@/types/database.types';
import { UserCardProps } from '@/types/component.types';
import { cn } from '@/lib/utils';

export function UserCard({ user, onLike, disabled = false }: UserCardProps) {
  return (
    <Card
      className={cn(
        'border border-black/10 shadow-md rounded-xl w-full flex flex-col justify-between h-full max-h-[220px]',
        'transition duration-200 ease-in-out hover:-translate-y-[3px] hover:shadow-lg'
      )}
    >
      <CardContent className="px-4 pt-3 pb-2 flex-1">
        <div className="flex flex-col">
          {/* ニックネーム */}
          <h3 className="font-bold text-lg mb-0.5 text-gray-800">
            {user.nickname}
          </h3>

          {/* 学年と学部 */}
          <p className="text-xs text-gray-600 mb-2 leading-tight">
            {user.grade} {user.department}
          </p>

          {/* ステータス情報 */}
          <div className="border-t border-gray-200 pt-2 mb-0">
            {/* 空き時間 */}
            <div className="flex items-center mb-1">
              <span className="text-xs text-gray-600 w-20">
                空き時間:
              </span>
              <span className="text-xs font-medium text-gray-800">
                {user.end_time || '未設定'}
              </span>
            </div>

            {/* 場所 */}
            <div className="flex items-center">
              <span className="text-xs text-gray-600 w-20">
                希望場所:
              </span>
              <span className="text-xs font-medium text-gray-800">
                {user.place || '未設定'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 pt-2 pb-3 bg-gray-50 border-t border-gray-200">
        <Button
          onClick={onLike}
          disabled={disabled}
          className={cn(
            'w-full text-sm px-3 py-1.5 rounded-lg transition-all duration-200 font-medium',
            user.liked_by_me
              ? 'bg-green-100 text-green-600 border border-green-300'
              : 'bg-indigo-600 text-white border border-indigo-700',
            disabled && !user.liked_by_me && 'opacity-60 cursor-not-allowed'
          )}
        >
          {user.liked_by_me ? '✓ いいね済み' : 'いいね！'}
        </Button>
      </CardFooter>
    </Card>
  );
}

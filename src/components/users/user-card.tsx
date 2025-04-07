import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecruitingUser } from '@/types/database.types';
import { UserCardProps } from '@/types/component.types';

export function UserCard({ user, onLike, disabled = false }: UserCardProps) {
  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow duration-200"
      style={{
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        width: '100%',
        height: '100%'
      }}
    >
      <CardContent className="p-6" style={{ padding: '1.5rem' }}>
        <div className="flex flex-col">
          {/* ニックネーム */}
          <h3 className="font-bold text-xl mb-1" style={{
            fontWeight: 'bold',
            fontSize: '1.25rem',
            marginBottom: '0.25rem'
          }}>
            {user.nickname}
          </h3>

          {/* 学年と学部 */}
          <p className="text-xs text-gray-600 mb-4" style={{
            fontSize: '0.75rem',
            color: '#4b5563',
            marginBottom: '1rem'
          }}>
            {user.grade} {user.department}
          </p>

          {/* ステータス情報 */}
          <div className="border-t pt-4 space-y-2" style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '1rem'
          }}>
            {/* 空き時間 */}
            {user.end_time && (
              <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="text-xs text-gray-500 w-24" style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  width: '6rem'
                }}>
                  空き時間:
                </span>
                <span className="text-xs font-medium" style={{
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {user.end_time}
                </span>
              </div>
            )}

            {/* 場所 */}
            {user.place && (
              <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="text-xs text-gray-500 w-24" style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  width: '6rem'
                }}>
                  希望場所:
                </span>
                <span className="text-xs font-medium" style={{
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {user.place}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 bg-gray-50 border-t" style={{
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb'
      }}>
        <Button
          onClick={onLike}
          disabled={disabled}
          variant={user.liked_by_me ? "secondary" : "default"}
          className={`w-full transition-colors ${user.liked_by_me ? 'bg-green-100 hover:bg-green-200 text-green-700' : ''}`}
          style={{
            width: '100%',
            transition: 'background-color 0.2s',
            ...(user.liked_by_me ? {
              backgroundColor: '#dcfce7',
              color: '#15803d'
            } : {})
          }}
        >
          {user.liked_by_me ? '✓ いいね済み' : 'いいね！'}
        </Button>
      </CardFooter>
    </Card>
  );
}

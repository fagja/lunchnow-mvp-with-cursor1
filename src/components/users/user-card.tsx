import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecruitingUser } from '@/types/database.types';
import { UserCardProps } from '@/types/component.types';

export function UserCard({ user, onLike, disabled = false }: UserCardProps) {
  return (
    <Card
      style={{
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: '12px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        maxHeight: '220px',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
    >
      <CardContent style={{ padding: '12px 16px 8px', flex: '1 1 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* ニックネーム */}
          <h3 style={{
            fontWeight: 'bold',
            fontSize: '1.1rem',
            marginBottom: '2px',
            color: '#333'
          }}>
            {user.nickname}
          </h3>

          {/* 学年と学部 */}
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            marginBottom: '8px',
            lineHeight: '1.2'
          }}>
            {user.grade} {user.department}
          </p>

          {/* ステータス情報 */}
          <div style={{
            borderTop: '1px solid #eaeaea',
            paddingTop: '8px',
            marginBottom: '0'
          }}>
            {/* 空き時間 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <span style={{
                fontSize: '0.75rem',
                color: '#666',
                width: '5rem'
              }}>
                空き時間:
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#333'
              }}>
                {user.end_time || '未設定'}
              </span>
            </div>

            {/* 場所 */}
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '0.75rem',
                color: '#666',
                width: '5rem'
              }}>
                希望場所:
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#333'
              }}>
                {user.place || '未設定'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter style={{
        padding: '8px 16px 12px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #eaeaea'
      }}>
        <Button
          onClick={onLike}
          disabled={disabled}
          style={{
            width: '100%',
            fontSize: '0.85rem',
            padding: '6px 12px',
            borderRadius: '8px',
            transition: 'all 0.2s',
            fontWeight: '500',
            ...(user.liked_by_me ? {
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              border: '1px solid #86efac'
            } : {
              backgroundColor: '#4f46e5',
              color: 'white',
              border: '1px solid #4338ca'
            }),
            ...(disabled && !user.liked_by_me ? {
              opacity: 0.6,
              cursor: 'not-allowed'
            } : {})
          }}
        >
          {user.liked_by_me ? '✓ いいね済み' : 'いいね！'}
        </Button>
      </CardFooter>
    </Card>
  );
}

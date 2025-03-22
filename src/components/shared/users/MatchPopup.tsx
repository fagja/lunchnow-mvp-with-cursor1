'use client';

import { useRouter } from 'next/navigation';
import { RecruitingUser } from '@/types/database.types';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface MatchPopupProps {
  user: RecruitingUser;
  onClose: () => void;
}

/**
 * マッチング成立ポップアップコンポーネント
 * 相互Likeでマッチが成立した時に表示されるポップアップ
 *
 * @param user - マッチしたユーザー情報
 * @param onClose - ポップアップを閉じる時のコールバック
 */
export default function MatchPopup({ user, onClose }: MatchPopupProps) {
  const router = useRouter();

  const handleOk = () => {
    onClose();
    router.push('/chat');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">マッチング成立！</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="text-center mb-4">
            <p className="text-lg font-semibold">{user.nickname}さんとマッチしました！</p>
            <p className="text-sm text-gray-600">{user.grade} {user.department}</p>
            <p className="text-sm mt-2">
              <span className="font-medium">空き時間:</span> {user.end_time || '未設定'}
            </p>
            <p className="text-sm">
              <span className="font-medium">場所:</span> {user.place || '未設定'}
            </p>
          </div>
          <p className="text-center text-gray-700">
            チャットでランチの待ち合わせを決めましょう！
          </p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleOk} className="w-full sm:w-auto">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

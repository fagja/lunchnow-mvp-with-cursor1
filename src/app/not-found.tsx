import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * 404ページ
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h2 className="text-2xl font-bold mb-4">ページが見つかりません</h2>
      <p className="mb-8 text-muted-foreground">
        お探しのページが存在しないか、移動した可能性があります。
      </p>
      <Link href="/">
        <Button>ホームに戻る</Button>
      </Link>
    </div>
  );
}
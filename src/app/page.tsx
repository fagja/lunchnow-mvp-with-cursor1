import { redirect } from 'next/navigation';

/**
 * ルートページコンポーネント
 * setup ページに自動的にリダイレクトします
 */
export default function Home() {
  redirect('/setup');
}

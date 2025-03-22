import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * ルートページコンポーネント
 * ユーザーIDの有無に応じて適切なページにリダイレクト
 * 
 * 1. ユーザーIDが存在する場合はユーザー一覧画面にリダイレクト
 * 2. ユーザーIDが存在しない場合は設定画面にリダイレクト
 */
export default function Home() {
  // Note: サーバーコンポーネントなのでlocalStorageではなくcookiesを使用
  const cookieStore = cookies();
  const userId = cookieStore.get('lunchnow_user_id');

  // ユーザーIDが存在すれば一覧画面へ、なければ設定画面へ
  if (userId) {
    redirect('/users');
  } else {
    redirect('/setup');
  }
}

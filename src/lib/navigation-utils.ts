import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * ナビゲーションオプションインターフェース
 */
export interface NavigationOptions {
  /**
   * 編集モードかどうか
   */
  isEdit?: boolean;
  /**
   * 遷移前に実行する関数
   */
  beforeNavigate?: () => void;
  /**
   * フォールバックURL
   */
  fallbackUrl?: string;
  /**
   * 完全なページリロードを強制するかどうか
   */
  forceFullReload?: boolean;
  /**
   * セッションストレージに設定するフラグのリスト
   */
  storageFlags?: string[];
  /**
   * URLクエリパラメータ
   */
  queryParams?: Record<string, string | number | boolean>;
}

/**
 * アプリ内統一ナビゲーション関数
 * @param router Next.jsのrouterオブジェクト
 * @param url 遷移先URL
 * @param options ナビゲーションオプション
 * @returns Promise<void>
 */
export function navigateTo(
  router: AppRouterInstance,
  url: string,
  options: NavigationOptions = {}
): Promise<void> {
  console.log(`navigateTo: ${url}`, options);

  // クエリパラメータの処理
  if (options.queryParams) {
    const queryString = Object.entries(options.queryParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
    console.log(`クエリパラメータ追加後のURL: ${url}`);
  }

  // isEditが指定されている場合
  if (options.isEdit) {
    url = `${url}${url.includes('?') ? '&' : '?'}edit=true`;
    console.log(`編集モード追加後のURL: ${url}`);
  }

  // ストレージフラグの設定
  if (options.storageFlags && options.storageFlags.length > 0) {
    options.storageFlags.forEach(flag => {
      console.log(`ストレージフラグを設定: ${flag}`);
      sessionStorage.setItem(flag, 'true');
    });
  }

  // 遷移前の処理
  if (options.beforeNavigate) {
    try {
      console.log('beforeNavigate関数を実行');
      options.beforeNavigate();
    } catch (error) {
      console.error('遷移前処理でエラーが発生:', error);
    }
  }

  // 完全リロードが必要な場合
  if (options.forceFullReload) {
    console.log('完全なページリロードを実行');
    window.location.href = url;
    return Promise.resolve();
  }

  // 通常のNext.js遷移
  try {
    console.log('Next.jsルーターで遷移実行');
    router.push(url);
    return Promise.resolve();
  } catch (error) {
    console.error('ナビゲーションエラー:', error);

    // フォールバックURLが指定されている場合
    if (options.fallbackUrl) {
      console.log(`フォールバックURLに遷移: ${options.fallbackUrl}`);
      router.push(options.fallbackUrl);
    }

    return Promise.resolve();
  }
}

/**
 * ランチ設定画面への遷移
 * @param router Next.jsのrouterオブジェクト
 * @param options 遷移オプション
 * @returns Promise<void>
 */
export function navigateToSetup(
  router: AppRouterInstance,
  options: NavigationOptions = {}
): Promise<void> {
  return navigateTo(router, '/setup', options);
}

/**
 * ユーザー一覧画面への遷移
 * @param router Next.jsのrouterオブジェクト
 * @param options 遷移オプション
 * @returns Promise<void>
 */
export function navigateToUsers(
  router: AppRouterInstance,
  options: NavigationOptions = {}
): Promise<void> {
  return navigateTo(router, '/users', options);
}

/**
 * セットアップからユーザー一覧への特殊遷移
 * 完全なページリロードを行い、最新データを確実に読み込む
 * @param router Next.jsのrouterオブジェクト
 * @returns Promise<void>
 */
export function navigateFromSetupToUsers(
  router: AppRouterInstance
): Promise<void> {
  console.log('セットアップからユーザー一覧への特殊遷移を実行します');
  return navigateTo(router, '/users', {
    forceFullReload: true, // window.location.hrefを使用した完全なページリロード
    storageFlags: ['lunchnow_needs_refresh'], // 遷移先でのリフレッシュフラグ
    fallbackUrl: '/users?from=setup' // エラー時のフォールバックURL
  });
}

/**
 * チャット画面への遷移
 * @param router Next.jsのrouterオブジェクト
 * @param options 遷移オプション
 * @returns Promise<void>
 */
export function navigateToChat(
  router: AppRouterInstance,
  options: NavigationOptions = {}
): Promise<void> {
  return navigateTo(router, '/chat', options);
}

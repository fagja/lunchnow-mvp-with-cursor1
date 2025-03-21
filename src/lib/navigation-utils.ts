import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * ナビゲーション機能のオプション
 * @property {boolean} isEdit - 編集モードでの遷移かどうか
 * @property {string} fallbackUrl - エラー時のフォールバックURL
 * @property {Function} beforeNavigate - 遷移前に実行するコールバック関数
 * @property {boolean} forceFullReload - フルリロードで遷移するかどうか
 * @property {string[]} storageFlags - 遷移時に設定するストレージフラグの配列
 * @property {Record<string, string>} queryParams - 追加のクエリパラメータ
 */
export type NavigationOptions = {
  isEdit?: boolean;
  fallbackUrl?: string;
  beforeNavigate?: () => void | Promise<void>;
  forceFullReload?: boolean; // フルリロードを強制するフラグ
  storageFlags?: string[]; // 遷移時に設定するストレージフラグ
  queryParams?: Record<string, string>; // 追加のクエリパラメータ
};

/**
 * アプリ内で統一された画面遷移を提供する関数
 * @param router Next.jsのrouterオブジェクト
 * @param path 遷移先のパス
 * @param options 遷移オプション
 * @returns Promise<void>
 */
export async function navigateTo(
  router: AppRouterInstance,
  path: string,
  options: NavigationOptions = {}
): Promise<void> {
  try {
    // 遷移前の処理があれば実行
    if (options.beforeNavigate) {
      await Promise.resolve(options.beforeNavigate());
    }

    // ストレージフラグの設定
    if (options.storageFlags && options.storageFlags.length > 0) {
      options.storageFlags.forEach(flag => {
        window.sessionStorage.setItem(flag, 'true');
        window.localStorage.setItem(flag, 'true');
      });
    }

    // クエリパラメータの構築
    let url = path;
    const queryParamsObj: Record<string, string> = {};

    // 編集モードフラグを追加
    if (options.isEdit) {
      queryParamsObj.edit = 'true';
    }

    // 追加のクエリパラメータを統合
    if (options.queryParams) {
      Object.assign(queryParamsObj, options.queryParams);
    }

    // クエリパラメータ文字列の構築
    const queryParams = Object.entries(queryParamsObj)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    if (queryParams) {
      url = `${path}?${queryParams}`;
    }

    // フルリロードが必要な場合
    if (options.forceFullReload) {
      window.location.href = url;
      return;
    }

    // 通常のNext.jsルーティング
    router.push(url);
  } catch (err) {
    console.error('Navigation error:', err);
    // フォールバック処理
    if (options.fallbackUrl) {
      window.location.href = options.fallbackUrl;
    }
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
  return navigateTo(router, '/users', {
    forceFullReload: true,
    storageFlags: ['lunchnow_needs_refresh'],
    fallbackUrl: '/users?from=setup'
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

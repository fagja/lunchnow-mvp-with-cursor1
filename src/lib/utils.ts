import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * tailwindのクラス名を結合するユーティリティ
 * shadcn/uiのデフォルト実装
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * LocalStorage操作用ユーティリティ
 */
export const localStorageKeys = {
  USER_ID: 'lunchnow_user_id',
};

/**
 * レスポンシブデザイン用のユーティリティ
 * UI要件に基づいたブレークポイント
 * 注: これらの値はtailwind.config.jsのscreens設定と一致させています
 */
export const breakpoints = {
  sm: 375, // スマートフォン（最小幅）
  md: 768, // タブレット
  lg: 1024, // デスクトップ
  xl: 1280, // 大型デスクトップ
  '2xl': 1536, // 超大型ディスプレイ
};

/**
 * レスポンシブデザイン用のコンテナサイズ
 * モバイルファーストのアプローチに基づいて設定
 */
export const containerSizes = {
  sm: 'max-w-[540px]', // スマートフォン用（375px以上）
  md: 'max-w-[720px]', // タブレット用（768px以上）
  lg: 'max-w-[960px]', // デスクトップ用（1024px以上）
  xl: 'max-w-[1140px]', // 大型デスクトップ用（1280px以上）
  '2xl': 'max-w-[1320px]', // 超大型ディスプレイ用（1536px以上）
};

/**
 * レスポンシブなパディングを生成するユーティリティ
 * モバイルファーストのアプローチに基づいて設定
 */
export const responsivePadding = {
  base: 'px-4 py-3', // 基本（スマートフォン）
  md: 'md:px-6 md:py-4', // タブレット以上
  lg: 'lg:px-8 lg:py-5', // デスクトップ以上
};

/**
 * 現在時刻からend_time選択肢を生成する関数
 * ~HH:MM形式で、30分ごとに最大6時間後までの選択肢を生成
 *
 * @returns end_time選択肢の配列
 */
export function generateEndTimeOptions(): string[] {
  const now = new Date();
  const options: string[] = [];

  // 現在時刻を30分単位に切り上げる処理
  const roundToNextHalfHour = (date: Date): Date => {
    const result = new Date(date);
    const minutes = result.getMinutes();
    const roundedMinutes = minutes < 30 ? 30 : 0;
    const hoursToAdd = minutes < 30 ? 0 : 1;

    result.setMinutes(roundedMinutes);
    result.setSeconds(0);
    result.setMilliseconds(0);
    result.setHours(result.getHours() + hoursToAdd);

    return result;
  };

  // 時刻をフォーマットする関数
  const formatEndTime = (date: Date): string => {
    return `~${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 開始時刻を30分単位に切り上げる
  const startTime = roundToNextHalfHour(now);

  // 最大6時間後まで30分ごとに選択肢を生成
  for (let i = 0; i < 12; i++) {
    const currentTime = new Date(startTime);
    currentTime.setMinutes(currentTime.getMinutes() + (i * 30));
    options.push(formatEndTime(currentTime));
  }

  return options;
}

/**
 * 日付文字列を整形する関数（日本時間）
 *
 * @param dateString - 日付文字列
 * @returns 整形された日付文字列 (例: 2023年4月1日 12:30)
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 最終更新時刻を表示用に整形する関数
 *
 * @returns 「最終更新: HH:MM」形式の文字列
 */
export function getLastUpdateText(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `最終更新: ${hours}:${minutes}`;
}

/**
 * 必須入力チェックを行うユーティリティ関数
 *
 * @param value - チェック対象の値
 * @returns 値が存在する場合はtrue、それ以外はfalse
 */
export function isRequired(value: string | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  return value.trim().length > 0;
}

/**
 * 文字数チェックを行うユーティリティ関数
 *
 * @param value - チェック対象の文字列
 * @param minLength - 最小文字数（デフォルト: 1）
 * @param maxLength - 最大文字数（デフォルト: 無制限）
 * @returns 文字数が範囲内の場合はtrue、それ以外はfalse
 */
export function isValidLength(
  value: string | null | undefined,
  minLength: number = 1,
  maxLength: number = Number.MAX_SAFE_INTEGER
): boolean {
  if (value === null || value === undefined) return minLength === 0;
  const trimmedValue = value.trim();
  return trimmedValue.length >= minLength && trimmedValue.length <= maxLength;
}

/**
 * 特殊文字チェックを行うユーティリティ関数
 * デフォルトでは英数字、かな、カナ、漢字、スペース、一部記号のみを許可
 *
 * @param value - チェック対象の文字列
 * @param allowedPattern - 許可するパターン（正規表現）
 * @returns 特殊文字が含まれていない場合はtrue、含まれている場合はfalse
 */
export function hasNoSpecialChars(
  value: string | null | undefined,
  allowedPattern: RegExp = /^[\p{L}\p{N}\p{Z}ぁ-んァ-ヶー一-龠々\s.,!?()_-]*$/u
): boolean {
  if (value === null || value === undefined) return true;
  return allowedPattern.test(value);
}

/**
 * ユーザーIDをLocalStorageに保存する関数
 *
 * @param userId - 保存するユーザーID
 * @returns 保存に成功した場合true、失敗した場合false
 */
export function saveUserId(userId: number): boolean {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(localStorageKeys.USER_ID, userId.toString());
      return true;
    } catch (error) {
      console.error('ユーザーIDの保存に失敗しました:', error);
      return false;
    }
  }
  return false;
}

/**
 * LocalStorageからユーザーIDを取得する関数
 *
 * @returns 保存されたユーザーID、存在しない場合または取得に失敗した場合はnull
 */
export function getUserId(): number | null {
  if (typeof window !== 'undefined') {
    try {
      const userId = localStorage.getItem(localStorageKeys.USER_ID);
      return userId ? parseInt(userId, 10) : null;
    } catch (error) {
      console.error('ユーザーIDの取得に失敗しました:', error);
      return null;
    }
  }
  return null;
}

/**
 * 設定をLocalStorageに保存する関数
 *
 * @param key - 設定のキー
 * @param value - 保存する値
 * @returns 保存に成功した場合true、失敗した場合false
 */
export function saveSettings<T>(key: string, value: T): boolean {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`設定[${key}]の保存に失敗しました:`, error);
      return false;
    }
  }
  return false;
}

/**
 * LocalStorageから設定を取得する関数
 *
 * @param key - 設定のキー
 * @param defaultValue - デフォルト値
 * @returns 保存された設定値、存在しない場合または取得に失敗した場合はデフォルト値
 */
export function getSettings<T>(key: string, defaultValue: T): T {
  if (typeof window !== 'undefined') {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`設定[${key}]の取得に失敗しました:`, error);
      return defaultValue;
    }
  }
  return defaultValue;
}

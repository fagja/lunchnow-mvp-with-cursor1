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

import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';

/**
 * 時刻を30分単位で切り上げる
 * @param time 切り上げる時刻
 * @returns 30分単位で切り上げられた時刻
 */
function roundToNextHalfHour(time: Dayjs): Dayjs {
  const minute = time.minute();
  const roundedMinute = minute < 30 ? 30 : 0;
  const hoursToAdd = minute < 30 ? 0 : 1;

  return time
    .hour(time.hour() + hoursToAdd)
    .minute(roundedMinute)
    .second(0)
    .millisecond(0);
}

/**
 * 時刻文字列を生成する
 * @param time 時刻
 * @returns ~HH:MM形式の文字列
 */
function formatEndTimeString(time: Dayjs): string {
  return `~${time.format('HH:mm')}`;
}

/**
 * 現在時刻からend_timeの選択肢を生成する
 * 現在時刻から最大6時間後まで30分刻みで生成
 * @returns end_timeの選択肢配列
 */
export function generateEndTimeOptions(): Array<{ value: string, label: string }> {
  const now = dayjs();
  const startTime = roundToNextHalfHour(now);
  const endTime = now.add(6, 'hour');
  const options: Array<{ value: string, label: string }> = [];

  let currentTime = startTime;
  while (currentTime.isBefore(endTime) || currentTime.isSame(endTime)) {
    const timeString = formatEndTimeString(currentTime);
    options.push({
      value: timeString,
      label: timeString
    });

    currentTime = currentTime.add(30, 'minute');
  }

  return options;
}

/**
 * タイムスタンプをHH:MM形式にフォーマットする
 * @param timestamp タイムスタンプ文字列
 * @returns フォーマット済みの時刻文字列
 */
export function formatTime(timestamp: string): string {
  return dayjs(timestamp).format('HH:mm');
}

/**
 * 指定された日付が今日かどうかを判定する
 * @param timestamp タイムスタンプ文字列
 * @returns 今日の場合はtrue
 */
export function isToday(timestamp: string): boolean {
  return dayjs(timestamp).isSame(dayjs(), 'day');
}

import dayjs from 'dayjs';

/**
 * 現在時刻からend_timeの選択肢を生成する
 * 現在時刻から最大6時間後まで30分刻みで生成
 * @returns end_timeの選択肢配列
 */
export function generateEndTimeOptions(): Array<{ value: string, label: string }> {
  const now = dayjs();
  const options: Array<{ value: string, label: string }> = [];
  
  // 現在時刻の分を30分単位で切り上げ
  let currentMinute = now.minute();
  let startHour = now.hour();
  let startMinute = currentMinute < 30 ? 30 : 0;
  
  // 分が30以上なら次の時間の0分にする
  if (currentMinute >= 30) {
    startHour = startHour + 1;
  }
  
  // 現在時刻から6時間後まで30分刻みでオプションを生成
  for (let h = 0; h <= 6; h++) {
    for (let m = 0; m < 60; m += 30) {
      // 最初のループでは、startMinuteから開始
      if (h === 0 && m < startMinute) continue;
      
      const hour = (startHour + h) % 24;
      const minute = (h === 0 && m === 30) ? startMinute : m;
      
      // 24時間表記で時間を生成
      const timeString = `~${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      options.push({
        value: timeString,
        label: timeString
      });
      
      // 6時間を超えたら終了
      if (hour === (startHour + 6) % 24 && minute === 0) break;
    }
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
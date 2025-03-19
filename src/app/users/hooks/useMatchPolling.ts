import { useCallback, useRef, useState } from 'react';
import { usePolling } from '@/hooks/usePolling';
import { MatchedUser } from '@/types/database.types';
import { fetchCurrentMatch } from '@/api/matches';
import { API_ERROR_MESSAGES } from '@/constants/error-messages';

/**
 * マッチング状態ポーリングのオプション型定義
 */
interface MatchPollingOptions {
  /**
   * ポーリング間隔（ミリ秒）
   * デフォルト: 7000 (7秒)
   */
  interval?: number;
  /**
   * マッチングが見つかった場合のコールバック関数
   */
  onMatchFound?: (matchData: MatchedUser) => void;
  /**
   * エラー発生時のコールバック関数
   */
  onError?: (error: Error) => void;
  /**
   * 自動的にバックグラウンド検出を行うかどうか（デフォルト: true）
   */
  detectVisibility?: boolean;
  /**
   * 初回即時実行するかどうか（デフォルト: true）
   */
  immediate?: boolean;
  /**
   * マッチング成立時に自動的にポーリングを停止するかどうか（デフォルト: true）
   */
  stopOnMatch?: boolean;
}

/**
 * マッチング確認用ポーリングフック
 *
 * 指定した間隔でマッチング状態を定期的に確認し、マッチングが成立した場合に通知する
 *
 * @param options マッチングポーリングオプション
 * @returns ポーリング状態と制御関数
 */
export function useMatchPolling(options: MatchPollingOptions = {}) {
  const {
    interval = 7000, // デフォルト7秒
    onMatchFound,
    onError,
    detectVisibility = true,
    immediate = true,
    stopOnMatch = true,
  } = options;

  // マッチング情報の状態
  const [matchInfo, setMatchInfo] = useState<MatchedUser | null>(null);
  // 最後にマッチングが確認された時のIDを保持（不要なコールバック実行を防ぐ）
  const lastMatchIdRef = useRef<number | null>(null);

  // マッチングチェック関数
  const checkMatchStatus = useCallback(async () => {
    try {
      const matchResponse = await fetchCurrentMatch();

      if (matchResponse.error) {
        throw new Error(typeof matchResponse.error === 'string' 
          ? matchResponse.error 
          : matchResponse.error.message || API_ERROR_MESSAGES.UNKNOWN_ERROR);
      }

      const match = matchResponse.data;

      // マッチ情報を更新
      setMatchInfo(match);

      // マッチングが存在し、前回と異なる場合にコールバックを実行
      if (match && match.match_id && match.match_id !== lastMatchIdRef.current) {
        lastMatchIdRef.current = match.match_id;

        if (onMatchFound) {
          onMatchFound(match);
        }

        return match;
      }

      return match;
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(API_ERROR_MESSAGES.UNKNOWN_ERROR));
      }
      throw error;
    }
  }, [onMatchFound, onError]);

  // マッチング成立を判定する停止条件
  const stopCondition = useCallback(
    (data: MatchedUser | null) => {
      // stopOnMatchが有効で、かつマッチングが存在する場合
      return stopOnMatch && !!data && !!data.match_id;
    },
    [stopOnMatch]
  );

  // 標準のポーリングフックを使用
  const polling = usePolling<MatchedUser | null>(checkMatchStatus, {
    interval,
    immediate,
    detectVisibility,
    stopCondition,
  });

  return {
    ...polling,
    matchInfo,
  };
}
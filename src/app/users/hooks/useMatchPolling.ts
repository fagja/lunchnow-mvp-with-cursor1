import { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import { usePolling } from '@/hooks/usePolling';
import { MatchedUser } from '@/types/database.types';
import { fetchCurrentMatch } from '@/api/matches';
import { BasePollingOptions } from '@/types/polling';

/**
 * マッチング状態ポーリングのオプション型定義
 */
interface MatchPollingOptions extends Partial<Omit<BasePollingOptions<MatchedUser | null>, 'stopCondition'>> {
  /**
   * マッチングが見つかった場合のコールバック関数
   */
  onMatchFound?: (matchData: MatchedUser) => void;
  /**
   * マッチング成立時に自動的にポーリングを停止するかどうか（デフォルト: true）
   */
  stopOnMatch?: boolean;
}

/**
 * マッチング確認用ポーリングフック
 * 要件定義：バックグラウンド時自動停止、画面遷移時自動停止、条件達成時自動停止
 */
export function useMatchPolling(options: MatchPollingOptions = {}) {
  // オプションの展開とデフォルト値設定
  const {
    interval = 15000,
    detectVisibility = true,
    stopOnMatch = true,
    onMatchFound,
    onError,
    immediate = true,
    showError = false
  } = options;

  // マッチデータをステート管理
  const [matchData, setMatchData] = useState<MatchedUser | null>(null);

  // ref経由でオプションとコールバック関数を安定的に管理
  const onMatchFoundRef = useRef(onMatchFound);
  const onErrorRef = useRef(onError);
  const stopOnMatchRef = useRef(stopOnMatch);
  const intervalRef = useRef(interval);
  const detectVisibilityRef = useRef(detectVisibility);
  const immediateRef = useRef(immediate);
  const showErrorRef = useRef(showError);

  // 最後に見つかったマッチングIDを追跡
  const lastMatchIdRef = useRef<number | null>(null);
  // マッチングが見つかったかどうかのフラグ
  const matchFoundRef = useRef<boolean>(false);

  // 参照値を最新に保つ
  useEffect(() => {
    onMatchFoundRef.current = onMatchFound;
    onErrorRef.current = onError;
    stopOnMatchRef.current = stopOnMatch;
    intervalRef.current = interval;
    detectVisibilityRef.current = detectVisibility;
    immediateRef.current = immediate;
    showErrorRef.current = showError;
  }, [onMatchFound, onError, stopOnMatch, interval, detectVisibility, immediate, showError]);

  // マッチングデータを取得する関数
  const fetchMatchDataRef = useRef(async () => {
    try {
      const response = await fetchCurrentMatch();

      if (response.error) {
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error.message || '不明なエラーが発生しました';
        console.error('[useMatchPolling] エラー発生:', errorMessage);
        throw new Error(errorMessage);
      }

      // 取得したマッチングデータを保存
      const fetchedMatchData = response.data || null;

      // ステート更新
      setMatchData(fetchedMatchData);

      if (fetchedMatchData && fetchedMatchData.match_id) {
        console.log('[useMatchPolling] マッチングデータ取得:', {
          matchId: fetchedMatchData.match_id,
        });
      }

      return fetchedMatchData;
    } catch (error) {
      console.error('[useMatchPolling] 例外発生:', error);
      throw error;
    }
  });

  // マッチングデータの変更を検出し、コールバックを実行するエフェクト
  useEffect(() => {
    // マッチングが見つかり、かつマッチIDが変更された場合に処理
    if (matchData && matchData.match_id &&
        (!lastMatchIdRef.current || matchData.match_id !== lastMatchIdRef.current)) {
      // マッチIDを更新
      lastMatchIdRef.current = matchData.match_id;
      // マッチフラグを設定
      matchFoundRef.current = true;

      console.log('[useMatchPolling] 新しいマッチング発見:', {
        matchId: matchData.match_id
      });

      // マッチング発見時のコールバック実行
      if (onMatchFoundRef.current) {
        onMatchFoundRef.current(matchData);
      }
    }
  }, [matchData]); // matchDataの変更を監視

  // 停止条件関数
  const stopConditionRef = useRef((matchData: MatchedUser | null) => {
    if (!matchData) return false;

    // マッチングが見つかっていて、stopOnMatchが有効なら停止
    return matchFoundRef.current && stopOnMatchRef.current;
  });

  // 安定したfetch関数
  const stableFetchFn = useCallback(() => fetchMatchDataRef.current(), []);

  // ポーリングオプションをメモ化して安定性を確保
  const pollingOptions = useMemo(() => ({
    interval: intervalRef.current,
    immediate: immediateRef.current,
    detectVisibility: detectVisibilityRef.current,
    stopCondition: (data: MatchedUser | null) => stopConditionRef.current(data),
    onError: (error: Error) => {
      console.error('[useMatchPolling] エラー発生:', error);
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    },
    showError: showErrorRef.current
  }), []); // 依存配列を空にして再レンダリング時の再生成を防止

  // 共通ポーリングフックを使用
  const polling = usePolling<MatchedUser | null>(stableFetchFn, pollingOptions);

  return {
    ...polling,
    // lastMatchIdがあればマッチしていると判断する補助関数
    hasMatch: !!lastMatchIdRef.current
  };
}

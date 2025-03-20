import { useCallback, useRef, useMemo, useEffect } from 'react';
import { usePolling } from '@/hooks/usePolling';
import { MatchedUser } from '@/types/database.types';
import { fetchCurrentMatch } from '@/api/matches';

/**
 * マッチング状態ポーリングのオプション型定義
 */
interface MatchPollingOptions {
  /**
   * ポーリング間隔（ミリ秒）
   * デフォルト: 15000 (15秒)
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
  } = options;

  // ref経由でオプションとコールバック関数を安定的に管理
  const onMatchFoundRef = useRef(options.onMatchFound);
  const onErrorRef = useRef(options.onError);
  const stopOnMatchRef = useRef(stopOnMatch);
  const intervalRef = useRef(interval);
  const detectVisibilityRef = useRef(detectVisibility);

  // 最後に見つかったマッチングIDを追跡
  const lastMatchIdRef = useRef<number | null>(null);
  // 現在のマッチングデータを保持
  const currentMatchDataRef = useRef<MatchedUser | null>(null);
  // マッチングが見つかったかどうかのフラグ
  const matchFoundRef = useRef<boolean>(false);

  // 参照値を最新に保つ
  useEffect(() => {
    onMatchFoundRef.current = options.onMatchFound;
    onErrorRef.current = options.onError;
    stopOnMatchRef.current = stopOnMatch;
    intervalRef.current = interval;
    detectVisibilityRef.current = detectVisibility;
  }, [options.onMatchFound, options.onError, stopOnMatch, interval, detectVisibility]);

  // マッチングデータを取得する関数 - refで管理して依存配列の問題を回避
  const fetchMatchDataRef = useRef(async () => {
    try {
      const response = await fetchCurrentMatch();

      if (response.error) {
        throw new Error(
          typeof response.error === 'string'
            ? response.error
            : response.error.message || '不明なエラーが発生しました'
        );
      }

      // 取得したマッチングデータを保存
      const matchData = response.data || null;
      currentMatchDataRef.current = matchData;

      return matchData;
    } catch (error) {
      throw error;
    }
  });

  // マッチングデータの変更を検出し、コールバックを実行するエフェクト
  useEffect(() => {
    const matchData = currentMatchDataRef.current;

    // マッチングが見つかり、前回と異なる場合のみ処理
    if (matchData && matchData.match_id && matchData.match_id !== lastMatchIdRef.current) {
      // マッチIDを更新
      lastMatchIdRef.current = matchData.match_id;
      // マッチフラグを設定
      matchFoundRef.current = true;

      // マッチング発見時のコールバック実行
      if (onMatchFoundRef.current) {
        onMatchFoundRef.current(matchData);
      }
    }
  }, [currentMatchDataRef.current]); // 依存配列にrefオブジェクトの現在値を入れる

  // 停止条件関数 - refで管理して依存配列の問題を回避
  const stopConditionRef = useRef((matchData: MatchedUser | null) => {
    if (!matchData) return false;

    // マッチングが見つかっていて、stopOnMatchが有効なら停止
    return matchFoundRef.current && stopOnMatchRef.current;
  });

  // ポーリングオプションをメモ化して安定性を確保し、依存配列を最小化
  const pollingOptions = useMemo(() => ({
    interval: intervalRef.current,
    immediate: true,
    detectVisibility: detectVisibilityRef.current,
    stopCondition: (data: MatchedUser | null) => stopConditionRef.current(data),
    onError: (error: Error) => {
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    },
    // デフォルトでエラーを表示しない
    showError: false
  }), []); // 依存配列を空にして再レンダリング時の再生成を防止

  // 安定したfetch関数
  const stableFetchFn = useCallback(() => fetchMatchDataRef.current(), []);

  // 共通ポーリングフックを使用
  const polling = usePolling<MatchedUser | null>(stableFetchFn, pollingOptions);

  return {
    ...polling,
    // lastMatchIdがあればマッチしていると判断する補助関数
    hasMatch: !!lastMatchIdRef.current
  };
}

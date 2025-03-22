"use client";

import { useState } from "react";
import usePolling from "@/hooks/usePolling";
import { Button } from "@/components/ui/button";

/**
 * ポーリングユーティリティの使用例を示すコンポーネント
 * 
 * 本番環境では使用しない開発用の参考サンプルです。
 */
export default function PollingExample() {
  const [pollingEnabled, setPollingEnabled] = useState(false);
  
  // 模擬的なデータ取得関数
  const fetchData = async () => {
    // API呼び出しをシミュレート
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(1000); // 1秒間の遅延
    
    // ランダムなタイムスタンプとデータを返す
    return {
      timestamp: new Date().toLocaleTimeString(),
      value: Math.floor(Math.random() * 100)
    };
  };
  
  // ポーリングフックの使用
  const { 
    data, 
    isLoading, 
    error, 
    isPolling, 
    lastUpdated,
    start,
    stop,
    refresh
  } = usePolling(fetchData, {
    interval: 5000, // 5秒ごとにポーリング
    enabled: false, // 初期状態は無効
    stopOnBackground: true,
    onSuccess: (data) => {
      console.log('データ取得成功:', data);
    },
    onError: (error) => {
      console.error('ポーリングエラー:', error);
    }
  });
  
  // ポーリングの開始/停止を切り替える
  const togglePolling = () => {
    if (isPolling) {
      stop();
    } else {
      start();
    }
    setPollingEnabled(!pollingEnabled);
  };
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">ポーリングユーティリティの動作確認</h2>
      
      {/* ステータス表示 */}
      <div className="mb-4 space-y-2">
        <p>ステータス: {isPolling ? '実行中' : '停止中'}</p>
        {isLoading && <p className="text-blue-500">データ取得中...</p>}
        {error && <p className="text-red-500">エラー: {error.message}</p>}
        {lastUpdated && (
          <p>最終更新: {lastUpdated.toLocaleTimeString()}</p>
        )}
      </div>
      
      {/* データ表示 */}
      {data && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h3 className="font-semibold">取得データ:</h3>
          <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      
      {/* 操作ボタン */}
      <div className="flex gap-2">
        <Button onClick={togglePolling}>
          {isPolling ? 'ポーリング停止' : 'ポーリング開始'}
        </Button>
        <Button variant="outline" onClick={refresh} disabled={!isPolling}>
          今すぐ更新
        </Button>
      </div>
      
      {/* 使用方法のヒント */}
      <div className="mt-4 text-sm text-gray-600">
        <p>※ このコンポーネントは開発確認用です。実際の使用例:</p>
        <ul className="list-disc ml-5 mt-1">
          <li>チャット機能: 3秒間隔でメッセージ取得</li>
          <li>マッチング確認: 7秒間隔でマッチング状態確認</li>
        </ul>
      </div>
    </div>
  );
}
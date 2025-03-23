'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { Modal } from '@/components/ui/modal';
import { useErrorHandler } from '@/utils/error-handler';

/**
 * 通知コンポーネントの使用例を示すページ
 */
export default function NotificationExamples() {
  // トースト通知の使用
  const { showToast } = useToast();
  
  // エラーハンドラの使用
  const { handleError } = useErrorHandler();
  
  // モーダルの状態管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // トースト通知のサンプル関数
  const showToastExample = (type: 'default' | 'success' | 'error' | 'warning') => {
    const messages = {
      default: '通常のメッセージです',
      success: '操作が成功しました！',
      error: 'エラーが発生しました',
      warning: '注意が必要です',
    };
    
    showToast({
      type,
      message: messages[type],
      duration: 3000,
    });
  };
  
  // エラーハンドリングのサンプル関数
  const simulateError = () => {
    try {
      // エラーをシミュレート
      throw new Error('シミュレートされたAPIエラーです');
    } catch (error) {
      handleError(error);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">通知コンポーネント使用例</h1>
      
      {/* トースト通知セクション */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">トースト通知</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => showToastExample('default')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            通常トースト
          </button>
          <button
            onClick={() => showToastExample('success')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            成功トースト
          </button>
          <button
            onClick={() => showToastExample('error')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            エラートースト
          </button>
          <button
            onClick={() => showToastExample('warning')}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            警告トースト
          </button>
        </div>
      </section>
      
      {/* エラーハンドリングセクション */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">エラーハンドリング</h2>
        <button
          onClick={simulateError}
          className="px-4 py-2 bg-red-100 rounded hover:bg-red-200"
        >
          APIエラーをシミュレート
        </button>
        <p className="mt-2 text-sm text-gray-600">
          このボタンをクリックすると、エラーハンドラーを使用したエラー通知が表示されます。
        </p>
      </section>
      
      {/* モーダルセクション */}
      <section>
        <h2 className="text-xl font-semibold mb-4">モーダル</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          モーダルを開く
        </button>
        
        <Modal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="確認"
          description="この操作を実行してもよろしいですか？"
          cancelButton={{
            text: "キャンセル",
            onClick: () => setIsModalOpen(false),
          }}
          confirmButton={{
            text: "確認",
            onClick: () => {
              setIsModalOpen(false);
              showToast({ 
                type: 'success', 
                message: 'モーダルで確認されました！' 
              });
            },
          }}
        />
      </section>
    </div>
  );
}
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from './toast';

type ToastType = 'default' | 'success' | 'error' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * トースト通知を表示するためのプロバイダーコンポーネント
 * アプリケーションのルートコンポーネントでラップして使用します
 *
 * 使用例:
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  }>({
    message: '',
    type: 'default',
    visible: false,
  });

  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  const showToast = useCallback(
    ({ message, type = 'default', duration = 3000 }: ToastOptions) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      setToast({
        message,
        type,
        visible: true,
      });

      const id = setTimeout(() => {
        hideToast();
      }, duration);

      setTimeoutId(id);
    },
    [hideToast, timeoutId]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        variant={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      >
        {toast.message}
      </Toast>
    </ToastContext.Provider>
  );
}

/**
 * トースト通知を表示するためのフック
 * ToastProviderの子コンポーネント内でのみ使用できます
 *
 * 使用例:
 * ```tsx
 * const { showToast } = useToast();
 *
 * // 成功メッセージを表示
 * showToast({
 *   message: "保存しました",
 *   type: "success",
 *   duration: 3000
 * });
 *
 * // エラーメッセージを表示
 * showToast({
 *   message: "エラーが発生しました",
 *   type: "error"
 * });
 * ```
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

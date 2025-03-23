import { XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ErrorInfo } from '@/hooks/useErrorHandler';

interface ErrorMessageProps {
  /**
   * エラー情報
   */
  error: ErrorInfo | Error | string | null;
  /**
   * エラーを閉じるためのコールバック関数
   */
  onClose?: () => void;
  /**
   * 再試行するためのコールバック関数
   */
  onRetry?: () => void;
  /**
   * 自動的に非表示になるかどうか
   */
  autoHide?: boolean;
  /**
   * アラートの種類
   * デフォルト: destructive
   */
  variant?: 'default' | 'destructive';
}

/**
 * 共通エラーメッセージコンポーネント
 * 
 * さまざまな種類のエラーオブジェクトを受け取り、一貫した形式でエラーを表示する
 */
export function ErrorMessage({
  error,
  onClose,
  onRetry,
  autoHide = true,
  variant = 'destructive',
}: ErrorMessageProps) {
  // エラーがないか、ErrorInfoで非表示フラグが立っている場合は何も表示しない
  if (!error || (error as ErrorInfo)?.isVisible === false) {
    return null;
  }

  // エラーメッセージを取得
  const errorMessage = typeof error === 'string'
    ? error
    : error instanceof Error
      ? error.message
      : (error as ErrorInfo).message || '不明なエラーが発生しました';

  return (
    <Alert variant={variant} className="mb-4 animate-in fade-in duration-300">
      <XCircle className="h-4 w-4" />
      <AlertTitle>エラーが発生しました</AlertTitle>
      <AlertDescription className="flex flex-col space-y-2">
        <p>{errorMessage}</p>
        {(onClose || onRetry) && (
          <div className="flex space-x-2 mt-2">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                再試行
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                閉じる
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
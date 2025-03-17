import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  autoCloseMs?: number;
}

/**
 * モーダルダイアログコンポーネント
 * 確認ダイアログや重要な通知の表示に使用します
 *
 * 使用例:
 * ```tsx
 * // 確認ダイアログ
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="確認"
 *   description="本当にキャンセルしますか？"
 *   showCancelButton={true}
 *   showConfirmButton={true}
 *   onConfirm={handleConfirm}
 * />
 *
 * // 通知ダイアログ（自動クローズ）
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="マッチング成立"
 *   description="チャット画面に移動します"
 *   autoCloseMs={2000}
 * />
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  showCancelButton = false,
  showConfirmButton = true,
  cancelText = "キャンセル",
  confirmText = "OK",
  onCancel,
  onConfirm,
  autoCloseMs,
}: ModalProps) {
  // 自動クローズのタイマー設定
  React.useEffect(() => {
    if (isOpen && autoCloseMs) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseMs, onClose]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
        >
          {title && (
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <DialogPrimitive.Title
                className="text-lg font-semibold leading-none tracking-tight"
              >
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description
                  className="text-sm text-muted-foreground"
                >
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
          )}
          {children}
          {(showCancelButton || showConfirmButton || footer) && (
            <div
              className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
            >
              {footer || (
                <>
                  {showCancelButton && (
                    <Button variant="outline" onClick={handleCancel}>
                      {cancelText}
                    </Button>
                  )}
                  {showConfirmButton && (
                    <Button onClick={handleConfirm}>{confirmText}</Button>
                  )}
                </>
              )}
            </div>
          )}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">閉じる</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

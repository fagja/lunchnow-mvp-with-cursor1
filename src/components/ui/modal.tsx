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
  showCloseIcon?: boolean;
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
 * // 通知ダイアログ
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="マッチング成立"
 *   description="チャット画面に移動します"
 *   showCloseIcon={false}
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
  showCloseIcon = true,
}: ModalProps) {
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

  // オーバーレイとコンテンツのインラインスタイル定義
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9998
  };

  const contentStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
    width: '90%',
    maxWidth: '28rem',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '1.5rem'
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 bg-black/70"
          style={overlayStyle}
        />
        <DialogPrimitive.Content
          className="bg-background p-6 shadow-lg rounded-lg"
          style={contentStyle}
        >
          {title && (
            <div className="flex flex-col space-y-2 text-center">
              <DialogPrimitive.Title
                className="text-xl font-semibold leading-none tracking-tight"
              >
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description
                  className="text-base text-muted-foreground mt-2"
                >
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
          )}

          {children && <div className="py-2">{children}</div>}

          {(showCancelButton || showConfirmButton || footer) && (
            <div className="flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-4 mt-4">
              {footer || (
                <>
                  {showCancelButton && (
                    <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto mb-2 sm:mb-0 min-w-[100px]">
                      {cancelText}
                    </Button>
                  )}
                  {showConfirmButton && (
                    <Button onClick={handleConfirm} className="w-full sm:w-auto min-w-[100px]">
                      {confirmText}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {showCloseIcon && (
            <DialogPrimitive.Close
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              style={{ zIndex: 10000 }}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">閉じる</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

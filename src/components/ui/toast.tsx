import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error" | "warning";
  visible?: boolean;
  onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", visible = true, onClose, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(visible);

    React.useEffect(() => {
      setIsVisible(visible);
    }, [visible]);

    const handleClose = () => {
      setIsVisible(false);
      onClose?.();
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
          "max-w-md w-full rounded-lg shadow-lg p-4 flex items-center justify-between",
          "animate-in fade-in slide-in-from-bottom-5 duration-300",
          {
            "bg-white text-gray-800 border border-gray-200": variant === "default",
            "bg-green-500 text-white": variant === "success",
            "bg-red-500 text-white": variant === "error",
            "bg-yellow-500 text-white": variant === "warning",
          },
          className
        )}
        role="status"
        aria-live="polite"
        {...props}
      >
        <div className="flex-1">{children}</div>
        <button
          onClick={handleClose}
          className="ml-4 text-sm font-medium opacity-70 hover:opacity-100"
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>
    )
  }
)

Toast.displayName = "Toast"

export { Toast }

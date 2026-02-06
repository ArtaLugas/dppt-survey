import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  const getIcon = (variant) => {
    const iconProps = { className: "h-5 w-5 flex-shrink-0" };

    switch (variant) {
      case "success":
        return <CheckCircle2 {...iconProps} className="h-5 w-5 flex-shrink-0 text-green-600" />;
      case "destructive":
        return <XCircle {...iconProps} className="h-5 w-5 flex-shrink-0 text-red-600" />;
      case "warning":
        return <AlertCircle {...iconProps} className="h-5 w-5 flex-shrink-0 text-amber-600" />;
      default:
        return <Info {...iconProps} className="h-5 w-5 flex-shrink-0 text-blue-600" />;
    }
  };

  return (
    <ToastProvider>
      {toasts.map((toast) => {
        const { id, title, description, action, variant, ...props } = toast;

        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="flex gap-3 items-start w-full">
              {getIcon(variant)}
              <div className="grid gap-1 flex-1">
                {title && (
                  <ToastTitle className="text-sm font-semibold leading-none">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-sm opacity-90">
                    {description}
                  </ToastDescription>
                )}
              </div>
              {action}
            </div>
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

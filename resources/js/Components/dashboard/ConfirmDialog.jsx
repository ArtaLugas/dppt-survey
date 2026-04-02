import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmDisabled = false,
    onConfirm,
    variant = "default", // Tambahkan ini
    hideFooter = false,
    children,
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader className="mb-2">
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {children && <div className="py-2">{children}</div>}

                {!hideFooter && (
                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
                        <Button
                            variant={variant} // Sekarang sudah aman
                            disabled={confirmDisabled}
                            onClick={onConfirm}
                        >
                            {confirmLabel}
                        </Button>
                    </AlertDialogFooter>
                )}
            </AlertDialogContent>
        </AlertDialog>
    );
}

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    hideFooter = false,
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
                {description}
            </AlertDialogDescription>
            </AlertDialogHeader>

            {!hideFooter && (
            <AlertDialogFooter className="gap-3">
                <AlertDialogCancel>
                {cancelLabel}
                </AlertDialogCancel>

                <AlertDialogAction onClick={onConfirm}>
                {confirmLabel}
                </AlertDialogAction>
            </AlertDialogFooter>
            )}
        </AlertDialogContent>
        </AlertDialog>
    );
}

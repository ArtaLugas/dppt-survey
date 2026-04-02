import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
// Asumsi badgeVariants didefinisikan di file UI Badge Anda
import { badgeVariants } from '@/components/ui/badge';

const statusConfig = {
    draft: {
        label: 'Draft',
        variant: 'secondary' // Abu-abu profesional
    },
    submitted: {
        label: 'Submitted',
        variant: 'warning' // Amber (Menunggu)
    },
    verified: {
        label: 'Verified',
        variant: 'success' // Emerald (Disetujui)
    },
    locked: {
        label: 'Locked',
        variant: 'destructive' // Merah Tinted (Final)
    },
};

export function StatusBadge({ status, showLockIcon = true, className }) {
    // 1. Defensive: Pastikan status selalu lowercase untuk pencocokan config
    const statusCode = status?.toLowerCase();
    const config = statusConfig[statusCode];

    // 2. Fallback jika status aneh/tidak terdaftar
    if (!config) {
        return (
            <span className={badgeVariants({ variant: 'outline' })}>
                {status || 'Unknown'}
            </span>
        );
    }

    return (
        <span className={cn(
            // Menggunakan badgeVariants untuk gaya Enterprise-grade
            badgeVariants({ variant: config.variant }),
            "gap-1.5 py-1", // Overwrite padding sedikit agar lebih proporsional
            className
        )}>
            {/* Icon Lock khusus untuk status locked */}
            {statusCode === 'locked' && showLockIcon && (
                <Lock className="h-3 w-3 shrink-0" />
            )}

            {config.label}

            {/* Label tambahan untuk Locked agar berwibawa */}
            {statusCode === 'locked' && (
                <span className="ml-1 text-[9px] font-black opacity-60 border-l border-red-300 pl-1.5 whitespace-nowrap">
                    READ ONLY
                </span>
            )}
        </span>
    );
}

export default StatusBadge;

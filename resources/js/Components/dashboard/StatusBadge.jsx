import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  draft: { label: 'Draft', className: 'status-draft' },
  submitted: { label: 'Submitted', className: 'status-submitted' },
  verified: { label: 'Verified', className: 'status-verified' },
  locked: { label: 'Locked', className: 'status-locked' },
};

export function StatusBadge({ status, showLockIcon = true }) {
  const config = statusConfig[status];

  // Fallback jika status tidak valid (penting untuk JS)
  if (!config) return null;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      config.className
    )}>
      {status === 'locked' && showLockIcon && (
        <Lock className="h-3 w-3" />
      )}
      {config.label}
      {status === 'locked' && (
        <span className="text-[10px] opacity-75 ml-1">FINAL</span>
      )}
    </span>
  );
}

// Menambahkan default export untuk kompatibilitas maksimal
export default StatusBadge;

import { cn } from '@/lib/utils';

const variantStyles = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-[hsl(var(--status-verified))]',
    warning: 'text-amber-600',
    danger: 'text-[hsl(var(--status-locked))]',
};

const iconBgStyles = {
    default: 'bg-muted',
    primary: 'bg-primary/10',
    success: 'bg-[hsl(var(--status-verified-bg))]',
    warning: 'bg-amber-50',
    danger: 'bg-[hsl(var(--status-locked-bg))]',
};

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
    variant = 'default',
}) {
    return (
        <div className="stat-card">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                        {value}
                    </p>
                    {description && (
                        <p className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>

                <div
                    className={cn(
                        'rounded-lg p-3',
                        iconBgStyles[variant]
                    )}
                >
                    <Icon
                        className={cn(
                            'h-6 w-6',
                            variantStyles[variant]
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

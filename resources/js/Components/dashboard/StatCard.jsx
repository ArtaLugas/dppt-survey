import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const variantStyles = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-[hsl(var(--status-verified))]',
    warning: 'text-amber-600',
    danger: 'text-[hsl(var(--status-locked))]',
};

const iconBgStyles = {
    default: 'bg-muted/50',
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
    index = 0,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
        >
            {/* Background Accent */}
            <div
                className={cn(
                    'absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-110',
                    iconBgStyles[variant]
                )}
            />

            <div className="relative flex items-start justify-between">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                            {title}
                        </p>
                        <h3 className="text-3xl font-bold tracking-tight text-foreground">
                            {value}
                        </h3>
                    </div>
                    {description && (
                        <p className="flex items-center text-xs font-medium text-muted-foreground/70">
                            <span className="mr-1.5 h-1 w-1 rounded-full bg-muted-foreground/30" />
                            {description}
                        </p>
                    )}
                </div>

                <div
                    className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300',
                        iconBgStyles[variant]
                    )}
                >
                    <Icon
                        className={cn(
                            'h-6 w-6 transition-transform duration-300 group-hover:scale-110',
                            variantStyles[variant]
                        )}
                    />
                </div>
            </div>
        </motion.div>
    );
}

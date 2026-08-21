import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'processing';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-[var(--surface-2)] text-[var(--text-2)]',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    processing:
      'bg-forge-100 text-forge-700 dark:bg-forge-900/30 dark:text-forge-300 animate-pulse',
  };

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};

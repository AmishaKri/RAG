import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('relative overflow-hidden rounded-lg bg-[var(--surface-2)]', className)}
    {...props}
  >
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />
  </div>
);

export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" style={{ width: i === lines - 1 ? '70%' : '100%' }} />
    ))}
  </div>
);

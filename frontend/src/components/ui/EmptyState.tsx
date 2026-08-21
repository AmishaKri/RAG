import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center', className)}>
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)]">
      <Icon className="h-7 w-7 text-forge-500" />
    </div>
    <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-[var(--text-2)]">{description}</p>
    {actionLabel && onAction && (
      <Button className="mt-6" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export const Progress = ({ value, max = 100, className }: ProgressProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]', className)}>
      <div
        className="h-full rounded-full gradient-bg transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

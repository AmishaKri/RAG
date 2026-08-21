import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Loading = ({ className, text = 'Loading...' }: { className?: string; text?: string }) => (
  <div className={cn('flex flex-col items-center justify-center gap-3 text-[var(--text-2)]', className)}>
    <Loader2 className="h-8 w-8 animate-spin text-forge-500" />
    <p className="text-sm">{text}</p>
  </div>
);

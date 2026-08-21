import { cn } from '@/lib/utils';
import { Database } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className, showText = true, size = 'md' }: LogoProps) => {
  const sizes = {
    sm: { icon: 18, text: 'text-base' },
    md: { icon: 24, text: 'text-xl' },
    lg: { icon: 32, text: 'text-2xl' },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="gradient-bg flex items-center justify-center rounded-xl p-1.5 shadow-lg shadow-forge-500/20">
        <Database className="text-white" size={sizes[size].icon} />
      </div>
      {showText && <span className={cn('font-bold tracking-tight text-[var(--text)]', sizes[size].text)}>KnowledgeForge</span>}
    </div>
  );
};

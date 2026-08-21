import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/uiStore';

const options = [
  { key: 'light', icon: Sun },
  { key: 'dark', icon: Moon },
  { key: 'system', icon: Monitor },
] as const;

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className={cn('inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1', className)}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => setTheme(opt.key)}
            className={cn(
              'rounded-md p-1.5 transition-all',
              active ? 'gradient-bg text-white shadow-sm' : 'text-[var(--text-2)] hover:text-[var(--text)]'
            )}
            title={opt.key}
            aria-label={opt.key}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
};

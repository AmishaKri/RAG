import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar = ({ name, src, size = 'md', className }: AvatarProps) => {
  const sizeClasses = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div
      className={cn(
        'gradient-bg flex select-none items-center justify-center rounded-full font-semibold text-white shadow-sm',
        sizeClasses[size],
        className
      )}
    >
      {src ? <img src={src} alt={name} className="h-full w-full rounded-full object-cover" /> : getInitials(name)}
    </div>
  );
};

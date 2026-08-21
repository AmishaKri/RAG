import { useNavigate } from 'react-router-dom';
import { Search, Bell, Command, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useThemeStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useCurrentUser } from '@/hooks/queries';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const TopBar = () => {
  const { toggleCommand } = useThemeStore();
  const { currentWorkspace } = useWorkspaceStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleCommand}
          className="group hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm text-[var(--text-2)] transition-all hover:border-forge-400 hover:text-[var(--text)] md:flex"
        >
          <Search className="h-4 w-4" />
          <span className="min-w-[8rem] text-left">Search...</span>
          <kbd className="ml-2 rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-xs">
            <Command className="inline h-3 w-3" />K
          </kbd>
        </button>

        {currentWorkspace && (
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-sm text-[var(--text-2)]">Workspace</span>
            <span className="rounded-lg bg-forge-100 px-2.5 py-1 text-sm font-semibold text-forge-700 dark:bg-forge-900/30 dark:text-forge-300">
              {currentWorkspace.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-xl p-2 text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1.5 pr-3 transition-all hover:border-forge-400"
            >
              <Avatar name={user.name} size="sm" />
              <span className="hidden text-sm font-medium text-[var(--text)] md:inline">{user.name}</span>
              <ChevronDown className="h-4 w-4 text-[var(--text-2)]" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
                <div className="border-b border-[var(--border)] p-4">
                  <p className="font-medium text-[var(--text)]">{user.name}</p>
                  <p className="text-xs text-[var(--text-2)]">{user.email}</p>
                </div>
                <div className="p-2">
                  <MenuItem icon={User} label="Profile" onClick={() => { setOpen(false); navigate('/profile'); }} />
                  <MenuItem icon={Settings} label="Settings" onClick={() => { setOpen(false); navigate('/settings'); }} />
                  <div className="my-1 h-px bg-[var(--border)]" />
                  <MenuItem
                    icon={LogOut}
                    label="Logout"
                    onClick={() => { setOpen(false); logout(); navigate('/login'); }}
                    danger
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button size="sm" onClick={() => navigate('/login')}>Sign In</Button>
        )}
      </div>
    </header>
  );
};

const MenuItem = ({ icon: Icon, label, onClick, danger }: { icon: React.ElementType; label: string; onClick: () => void; danger?: boolean }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
      danger
        ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
        : 'text-[var(--text)] hover:bg-[var(--surface-2)]'
    )}
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

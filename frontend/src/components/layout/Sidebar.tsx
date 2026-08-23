import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { useThemeStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/hooks/queries';
import {
  LayoutDashboard,
  Folder,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const mainNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/workspaces', label: 'Workspaces', icon: Folder },
  { path: '/chat', label: 'AI Chat', icon: MessageSquare },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const bottomNav = [
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/help', label: 'Help', icon: HelpCircle },
];

export const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useThemeStore();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useCurrentUser();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:translate-x-0',
          !sidebarOpen && '-translate-x-full lg:hidden'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-5">
          <Logo size="sm" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-[var(--text-2)] hover:bg-[var(--surface-2)] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.path) || (item.path !== '/dashboard' && location.pathname.includes(item.path.slice(1)));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive || active
                        ? 'gradient-bg text-white shadow-md shadow-forge-500/20'
                        : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                    )
                  }
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className="my-4 h-px bg-[var(--border)]" />

          <div className="space-y-1">
            {bottomNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-[var(--surface-2)] text-[var(--text)]'
                        : 'text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                    )
                  }
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[var(--border)] p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-2)]">Theme</span>
            <ThemeToggle />
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text)]">{user.name}</p>
                <p className="truncate text-xs text-[var(--text-2)]">{user.email}</p>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="rounded-lg p-1.5 text-[var(--text-2)] hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="h-7 w-full animate-pulse rounded bg-[var(--surface-2)]" />
          )}
        </div>
      </motion.aside>
    </>
  );
};

export const MobileTopBar = () => {
  const { toggleSidebar } = useThemeStore();
  return (
    <div className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:hidden">
      <button onClick={toggleSidebar} className="rounded-lg p-2 text-[var(--text)] hover:bg-[var(--surface-2)]">
        <Menu className="h-5 w-5" />
      </button>
      <Logo size="sm" />
      <div className="w-9" />
    </div>
  );
};

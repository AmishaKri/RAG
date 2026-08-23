import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, MobileTopBar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useWorkspaces } from '@/hooks/queries';
import { useThemeStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export const AppShell = () => {
  const { data: workspaces } = useWorkspaces();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const { sidebarOpen } = useThemeStore();
  const location = useLocation();

  // Sync current workspace from URL where possible
  const workspaceIdMatch = location.pathname.match(/\/workspace\/([^/]+)/);
  useEffect(() => {
    if (workspaceIdMatch && workspaces) {
      const ws = workspaces.find((w) => w.id === workspaceIdMatch[1]);
      if (ws && ws.id !== currentWorkspace?.id) setCurrentWorkspace(ws);
    }
  }, [workspaceIdMatch, workspaces, currentWorkspace, setCurrentWorkspace]);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <MobileTopBar />
      <div className={cn('flex min-h-screen flex-col', sidebarOpen && 'lg:pl-64')}>
        <TopBar />
        <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
};

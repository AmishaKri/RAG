import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Folder,
  FileText,
  MessageSquare,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { useWorkspace } from '@/hooks/queries';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';

const tabs = [
  { path: '', label: 'Overview', icon: Folder },
  { path: 'documents', label: 'Documents', icon: FileText },
  { path: 'chat', label: 'AI Chat', icon: MessageSquare },
  { path: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Workspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: workspace, isLoading } = useWorkspace(id);
  const { setCurrentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (workspace) setCurrentWorkspace(workspace);
  }, [workspace, setCurrentWorkspace]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text="Loading workspace..." />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-semibold text-[var(--text)]">Workspace not found</p>
        <p className="text-sm text-[var(--text-2)]">The workspace you are looking for does not exist.</p>
        <Button onClick={() => navigate('/workspaces')}>Back to Workspaces</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-[var(--text-2)]">
            <span className="cursor-pointer hover:text-[var(--text)]" onClick={() => navigate('/workspaces')}>Workspaces</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-[var(--text)]">{workspace.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">{workspace.name}</h1>
          <p className="mt-1 text-sm text-[var(--text-2)]">{workspace.description || 'No description'}</p>
        </div>

      </div>

      <div className="border-b border-[var(--border)]">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const to = tab.path ? `/workspace/${id}/${tab.path}` : `/workspace/${id}`;
            return (
              <NavLink
                key={tab.path}
                to={to}
                end={tab.path === ''}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-forge-500 text-forge-600'
                      : 'border-transparent text-[var(--text-2)] hover:text-[var(--text)]',
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.div>
    </div>
  );
}

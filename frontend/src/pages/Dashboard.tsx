import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Folder,
  MessageSquare,
  Search,
  Upload,
  Plus,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useWorkspaces, useDocuments, useConversations } from '@/hooks/queries';
import { useWorkspaceStore } from '@/store/workspaceStore';


export default function Dashboard() {
  const navigate = useNavigate();
  const { data: workspaces, isLoading: wsLoading } = useWorkspaces();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace, setCurrentWorkspace]);

  const activeWorkspace = currentWorkspace || workspaces?.[0];

  const { data: documents, isLoading: docsLoading } = useDocuments(activeWorkspace?.id);
  const { data: conversations } = useConversations(activeWorkspace?.id);

  const stats = useMemo(() => {
    const ready = documents?.filter((d) => d.status === 'ready').length || 0;
    const chunks = documents?.reduce((acc, d) => acc + (d.chunk_count || 0), 0) || 0;
    return {
      documents: documents?.length || 0,
      chunks,
      ready,
      conversations: conversations?.length || 0,
    };
  }, [documents, conversations]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (wsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text="Loading your dashboard..." />
      </div>
    );
  }

  if (!workspaces?.length) {
    return (
      <EmptyState
        icon={Folder}
        title="Create your first knowledge workspace"
        description="A workspace is where you organize documents and start AI conversations."
        actionLabel="Create Workspace"
        onAction={() => navigate('/workspaces')}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] md:text-3xl">{greeting}.</h1>
          <p className="mt-1 text-[var(--text-2)]">Here's what is happening across your knowledge.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => activeWorkspace && navigate(`/workspace/${activeWorkspace.id}/documents`)}>
            <Upload className="mr-2 h-4 w-4" /> Upload Document
          </Button>
          <Button variant="outline" onClick={() => navigate('/workspaces')}>
            <Plus className="mr-2 h-4 w-4" /> New Workspace
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Documents" value={stats.documents} />
        <StatCard icon={Search} label="Chunks" value={stats.chunks} />
        <StatCard icon={FileText} label="Ready" value={stats.ready} />
        <StatCard icon={MessageSquare} label="Conversations" value={stats.conversations} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent documents</CardTitle>
            <CardDescription>Latest documents uploaded to {activeWorkspace?.name || 'your workspace'}</CardDescription>
          </CardHeader>
          {docsLoading ? (
            <Loading className="py-12" />
          ) : !documents?.length ? (
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Upload your first document to start searching and asking AI."
              actionLabel="Upload Document"
              onAction={() => activeWorkspace && navigate(`/workspace/${activeWorkspace.id}/documents`)}
              className="border-0"
            />
          ) : (
            <div className="space-y-3">
              {documents.slice(0, 5).map((d) => (
                <div
                  key={d.id}
                  onClick={() => activeWorkspace && navigate(`/workspace/${activeWorkspace.id}/documents`)}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 transition-colors hover:border-forge-400"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-forge-500" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{d.filename}</p>
                      <p className="text-xs text-[var(--text-2)]">{d.chunk_count || 0} chunks</p>
                    </div>
                  </div>
                  <Badge variant={d.status === 'ready' ? 'success' : d.status === 'processing' ? 'processing' : 'danger'}>
                    {d.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump into key workflows</CardDescription>
          </CardHeader>
          <div className="space-y-2">
            <QuickAction icon={Search} label="Search knowledge" onClick={() => activeWorkspace && navigate(`/workspace/${activeWorkspace.id}/search`)} />
            <QuickAction icon={MessageSquare} label="Ask AI" onClick={() => activeWorkspace && navigate(`/workspace/${activeWorkspace.id}/chat`)} />
            <QuickAction icon={Folder} label="View workspaces" onClick={() => navigate('/workspaces')} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent workspaces</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.slice(0, 6).map((ws) => (
            <motion.div
              key={ws.id}
              whileHover={{ y: -2 }}
              onClick={() => { setCurrentWorkspace(ws); navigate(`/workspace/${ws.id}`); }}
              className="cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 transition-all hover:border-forge-400"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg text-sm font-bold text-white">
                  {ws.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text)]">{ws.name}</p>
                  <p className="text-xs text-[var(--text-2)]">{ws.description || 'No description'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-3 top-3 rounded-lg bg-forge-50 p-2 dark:bg-forge-900/20">
        <Icon className="h-5 w-5 text-forge-500" />
      </div>
      <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
      <p className="text-sm text-[var(--text-2)]">{label}</p>
    </Card>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-left text-sm font-medium text-[var(--text)] transition-all hover:border-forge-400"
    >
      <Icon className="h-4 w-4 text-forge-500" />
      {label}
      <Clock className="ml-auto h-4 w-4 text-[var(--text-2)]" />
    </button>
  );
}

import { useParams, useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Layers, BarChart3, Upload, Sparkles } from 'lucide-react';
import { useWorkspace, useDocuments, useConversations } from '@/hooks/queries';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatBytes, formatDate } from '@/lib/utils';

export default function WorkspaceOverview() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: workspace, isLoading: wsLoading } = useWorkspace(workspaceId);
  const { data: documents, isLoading: docsLoading } = useDocuments(workspaceId);
  const { data: conversations, isLoading: convsLoading } = useConversations(workspaceId);

  if (wsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text="Loading workspace..." />
      </div>
    );
  }

  if (!workspace) {
    return (
      <EmptyState
        icon={FileText}
        title="Workspace not found"
        description="The workspace you are looking for does not exist."
      />
    );
  }

  const readyDocs = documents?.filter((d) => d.status === 'ready').length || 0;
  const totalChunks = documents?.reduce((acc, d) => acc + (d.chunk_count || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">{workspace.name}</h2>
            <p className="mt-1 text-sm text-[var(--text-2)]">{workspace.description || 'No description'}</p>
            <p className="mt-2 text-xs text-[var(--text-3)]">Created {formatDate(workspace.created_at)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate(`documents`)}>
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
            <Button variant="outline" onClick={() => navigate(`chat`)}>
              <MessageSquare className="mr-2 h-4 w-4" /> Chat
            </Button>
            <Button variant="outline" onClick={() => navigate(`analytics`)}>
              <BarChart3 className="mr-2 h-4 w-4" /> Analytics
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Documents" value={documents?.length || 0} />
        <StatCard icon={Layers} label="Chunks" value={totalChunks} />
        <StatCard icon={Sparkles} label="Ready" value={readyDocs} />
        <StatCard icon={MessageSquare} label="Conversations" value={conversations?.length || 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-[var(--text)]">Recent documents</h3>
          {docsLoading ? (
            <Loading className="py-8" />
          ) : !documents?.length ? (
            <p className="text-sm text-[var(--text-2)]">No documents yet. Upload one to get started.</p>
          ) : (
            <div className="space-y-3">
              {documents.slice(0, 5).map((d) => (
                <button
                  key={d.id}
                  onClick={() => navigate(`documents`)}
                  className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-left transition-colors hover:border-forge-400"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text)] line-clamp-1">{d.filename}</p>
                    <p className="text-xs text-[var(--text-2)]">{formatBytes(d.file_size)} · {formatDate(d.created_at)}</p>
                  </div>
                  <span className={`text-xs font-medium ${d.status === 'ready' ? 'text-mint-500' : d.status === 'processing' ? 'text-amber-500' : 'text-rose-500'}`}>
                    {d.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-[var(--text)]">Recent conversations</h3>
          {convsLoading ? (
            <Loading className="py-8" />
          ) : !conversations?.length ? (
            <p className="text-sm text-[var(--text-2)]">No conversations yet. Start one from the AI Chat tab.</p>
          ) : (
            <div className="space-y-3">
              {conversations.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`chat`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-left transition-colors hover:border-forge-400"
                >
                  <MessageSquare className="h-4 w-4 text-[var(--text-2)]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text)] line-clamp-1">{c.title}</p>
                    <p className="text-xs text-[var(--text-2)]">{formatDate(c.updated_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forge-50 dark:bg-forge-900/20">
        <Icon className="h-6 w-6 text-forge-500" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
        <p className="text-sm text-[var(--text-2)]">{label}</p>
      </div>
    </Card>
  );
}

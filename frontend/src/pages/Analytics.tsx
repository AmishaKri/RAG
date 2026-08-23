import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { FileText, Search, MessageSquare, Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAnalytics, useDocuments, useConversations } from '@/hooks/queries';
import { useWorkspaceStore } from '@/store/workspaceStore';

export default function Analytics() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const { currentWorkspace } = useWorkspaceStore();
  const { data: summary, isLoading: summaryLoading } = useAnalytics(workspaceId);
  const { data: documents } = useDocuments(workspaceId);
  const { data: conversations } = useConversations(workspaceId);

  const stats = useMemo(() => {
    return {
      documents: documents?.length || summary?.documents || 0,
      chunks: documents?.reduce((a, d) => a + d.chunk_count, 0) || summary?.chunks || 0,
      questions: summary?.questions || 0,
      conversations: conversations?.length || summary?.conversations || 0,
    };
  }, [documents, conversations, summary]);

  if (summaryLoading && !currentWorkspace) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text="Loading analytics..." />
      </div>
    );
  }

  if (!summary) {
    return (
      <EmptyState
        icon={Layers}
        title="Analytics will appear here"
        description="Upload documents and start conversations to generate insights."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text)]">Analytics</h2>
        <p className="text-sm text-[var(--text-2)]">Monitor knowledge activity across {currentWorkspace?.name || 'this workspace'}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={FileText} label="Documents" value={stats.documents} />
        <MetricCard icon={Layers} label="Chunks" value={stats.chunks} />
        <MetricCard icon={Search} label="Questions" value={stats.questions} />
        <MetricCard icon={MessageSquare} label="Conversations" value={stats.conversations} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-[var(--text)]">Documents over time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.documentsOverTime}>
                <defs>
                  <linearGradient id="docs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B5FEF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5B5FEF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-2)" fontSize={12} tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                <YAxis stroke="var(--text-2)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
                <Area type="monotone" dataKey="count" stroke="#5B5FEF" fill="url(#docs)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-[var(--text)]">Conversations over time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.searchesOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-2)" fontSize={12} tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                <YAxis stroke="var(--text-2)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
                <Bar dataKey="count" fill="#22D3EE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-[var(--text)]">Top documents</h3>
        <div className="space-y-3">
          {summary.topDocuments.map((d, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forge-100 text-forge-700 dark:bg-forge-900/20 dark:text-forge-300">
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-[var(--text)]">{d.filename}</p>
              </div>
              <p className="text-sm text-[var(--text-2)]">{d.views} chunks</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
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

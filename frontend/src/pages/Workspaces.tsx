import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Folder, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { useWorkspaces, useCreateWorkspace, useDeleteWorkspace } from '@/hooks/queries';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { formatDate } from '@/lib/utils';

export default function Workspaces() {
  const navigate = useNavigate();
  const { data: workspaces, isLoading } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const { setCurrentWorkspace } = useWorkspaceStore();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const ws = await createWorkspace.mutateAsync({ name, description: desc });
      toast.success('Workspace created');
      setOpen(false);
      setName('');
      setDesc('');
      setCurrentWorkspace(ws);
      navigate(`/workspace/${ws.id}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWorkspace.mutateAsync(deleteId);
      toast.success('Workspace deleted');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text="Loading workspaces..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Workspaces</h1>
          <p className="text-sm text-[var(--text-2)]">Organize your knowledge into focused collections.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Workspace
        </Button>
      </div>

      {!workspaces?.length ? (
        <EmptyState
          icon={Folder}
          title="No workspaces yet"
          description="Create your first workspace to start uploading documents and using AI."
          actionLabel="Create Workspace"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <motion.div
              key={ws.id}
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-bg text-sm font-bold text-white">
                  {ws.name[0]}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(ws.id); }}
                  className="rounded-lg p-2 text-[var(--text-2)] opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:hover:bg-rose-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[var(--text)]">{ws.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--text-2)]">{ws.description || 'No description'}</p>
              <p className="mt-4 text-xs text-[var(--text-2)]">Created {formatDate(ws.created_at)}</p>
              <button
                onClick={() => { setCurrentWorkspace(ws); navigate(`/workspace/${ws.id}`); }}
                className="mt-4 flex items-center text-sm font-medium text-forge-600 hover:text-forge-700"
              >
                Open workspace <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create workspace">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Workspace name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Product Knowledge" />
          <Input label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What is this workspace about?" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createWorkspace.isPending}>Create</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete workspace">
        <p className="text-sm text-[var(--text)]">Are you sure? This will remove the workspace, its documents, and all associated data. This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleteWorkspace.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  Trash2,
  File,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/queries';
import { formatBytes, formatDate } from '@/lib/utils';
import type { DocumentResponse } from '@/types';

const ALLOWED = ['.pdf', '.docx', '.txt', '.csv'];
const MAX_SIZE = 20 * 1024 * 1024;

export default function Documents() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const { data: documents, isLoading } = useDocuments(workspaceId);
  const upload = useUploadDocument();
  const deleteDoc = useDeleteDocument();
  const fileInput = useRef<HTMLInputElement>(null);

  const [progress, setProgress] = useState<number | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  const onDrop = (files: FileList | null) => {
    if (!workspaceId || !files?.length) return;
    const file = files[0];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED.includes(ext)) {
      toast.error(`Unsupported file type: ${ext}. Allowed: ${ALLOWED.join(', ')}`);
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('File too large. Maximum 20 MB.');
      return;
    }
    setProgress(0);
    upload.mutate(
      { workspaceId, file, onProgress: setProgress },
      {
        onSuccess: () => {
          toast.success('Document uploaded');
          setProgress(null);
        },
        onError: (err: any) => {
          toast.error(err.message || 'Upload failed');
          setProgress(null);
        },
      }
    );
  };

  const confirmDelete = async () => {
    if (!workspaceId || !deleteDocId) return;
    deleteDoc.mutate(
      { workspaceId, documentId: deleteDocId },
      {
        onSuccess: () => {
          toast.success('Document deleted');
          setDeleteDocId(null);
        },
        onError: (err: any) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => { e.preventDefault(); onDrop(e.dataTransfer.files); }}
        onClick={() => fileInput.current?.click()}
        className="cursor-pointer border-dashed text-center transition-colors hover:border-forge-400"
      >
        <div className="flex flex-col items-center justify-center py-10">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-forge-50 dark:bg-forge-900/20">
            <Upload className="h-6 w-6 text-forge-500" />
          </div>
          <p className="text-lg font-semibold text-[var(--text)]">Drag documents here or click to browse</p>
          <p className="mt-2 text-sm text-[var(--text-2)]">PDF, DOCX, TXT, CSV up to 20 MB</p>
          {progress !== null && <Progress value={progress} className="mt-4 w-full max-w-sm" />}
        </div>
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt,.csv"
          onChange={(e) => onDrop(e.target.files)}
        />
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !documents?.length ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload your first document to start building knowledge."
          actionLabel="Upload Document"
          onAction={() => fileInput.current?.click()}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-xs uppercase text-[var(--text-2)]">
              <tr>
                <th className="px-4 py-3 font-medium">Document</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Chunks</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {documents.map((d) => (
                <DocumentRow key={d.id} document={d} onDelete={() => setDeleteDocId(d.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!deleteDocId} onClose={() => setDeleteDocId(null)} title="Delete document">
        <p className="text-sm text-[var(--text)]">Are you sure you want to delete this document? This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteDocId(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} isLoading={deleteDoc.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function DocumentRow({ document: d, onDelete }: { document: DocumentResponse; onDelete: () => void }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hover:bg-[var(--bg)]"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <File className="h-5 w-5 text-forge-500" />
          <div>
            <p className="font-medium text-[var(--text)]">{d.filename}</p>
            <p className="text-xs text-[var(--text-2)]">{d.content_type || 'unknown'}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-[var(--text-2)]">{formatBytes(d.file_size)}</td>
      <td className="px-4 py-3">
        <Badge
          variant={
            d.status === 'ready' ? 'success' : d.status === 'processing' ? 'processing' : 'danger'
          }
          className="capitalize"
        >
          {d.status}
        </Badge>
        {d.error && <p className="mt-1 text-xs text-rose-500">{d.error}</p>}
      </td>
      <td className="px-4 py-3 text-[var(--text-2)]">{d.chunk_count}</td>
      <td className="px-4 py-3 text-[var(--text-2)]">{formatDate(d.created_at)}</td>
      <td className="px-4 py-3 text-right">
        {d.status === 'processing' ? (
          <Loader2 className="ml-auto h-4 w-4 animate-spin text-[var(--text-2)]" />
        ) : d.status === 'failed' ? (
          <div className="flex justify-end gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
        ) : (
          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-[var(--text-2)] hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </td>
    </motion.tr>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateWorkspace } from '@/hooks/queries';
import { useAuthStore } from '@/store/authStore';
import { Sparkles, FolderOpen, Upload, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const useCases = [
  'Company Knowledge',
  'Research',
  'Engineering',
  'Customer Support',
  'Education',
  'Personal Knowledge',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [selectedUse, setSelectedUse] = useState<string>('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDesc, setWorkspaceDesc] = useState('');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const createWorkspace = useCreateWorkspace();

  const handleNext = async () => {
    if (step === 2) {
      if (!workspaceName.trim()) return;
      try {
        const ws = await createWorkspace.mutateAsync({ name: workspaceName, description: workspaceDesc });
        setWorkspaceId(ws.id);
        toast.success('Workspace created');
      } catch (err: any) {
        toast.error(err.message);
        return;
      }
    }
    if (step < 3) setStep(step + 1);
    if (step === 3) navigate('/dashboard');
  };

  const steps = [
    {
      title: 'Welcome to KnowledgeForge',
      subtitle: `Let's set up your knowledge workspace, ${user?.name?.split(' ')[0] || 'there'}.`,
      content: (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl gradient-bg shadow-2xl">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <p className="text-[var(--text-2)]">You're joining a new way to work with documents, search, and AI.</p>
        </div>
      ),
    },
    {
      title: 'What will you use KnowledgeForge for?',
      subtitle: 'This helps us tailor your experience.',
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          {useCases.map((u) => (
            <button
              key={u}
              onClick={() => setSelectedUse(u)}
              className={[
                'rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all',
                selectedUse === u
                  ? 'border-forge-500 bg-forge-50 text-forge-700 dark:bg-forge-900/20'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-forge-400',
              ].join(' ')}
            >
              {u}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Create your first workspace',
      subtitle: 'A workspace keeps your documents and conversations organized.',
      content: (
        <div className="space-y-4">
          <Input label="Workspace name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="e.g. Engineering Knowledge" />
          <Input label="Description (optional)" value={workspaceDesc} onChange={(e) => setWorkspaceDesc(e.target.value)} placeholder="What is this workspace about?" />
        </div>
      ),
    },
    {
      title: 'Your knowledge workspace is ready',
      subtitle: 'You can now upload documents and start exploring.',
      content: (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-mint-500/10">
            <CheckCircle className="h-10 w-10 text-mint-500" />
          </div>
          <p className="text-[var(--text-2)]">Upload your first document from the workspace page or skip for now.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => navigate(`/workspace/${workspaceId}/documents`)}>
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl">
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <FolderOpen className="h-8 w-8 text-forge-500" />
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={[
                    'h-1.5 w-6 rounded-full transition-all',
                    i <= step ? 'gradient-bg' : 'bg-[var(--border)]',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)]">{current.title}</h2>
          <p className="mt-1 text-sm text-[var(--text-2)]">{current.subtitle}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[220px]"
          >
            {current.content}
          </motion.div>
        </AnimatePresence>

        {step < 3 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              className="flex items-center text-sm font-medium text-[var(--text-2)] hover:text-[var(--text)] disabled:opacity-40"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </button>
            <Button isLoading={createWorkspace.isPending} onClick={handleNext}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MessageSquare, Home, Settings, FileText, Folder, Sparkles } from 'lucide-react';
import { useThemeStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

interface Command {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
}

export const CommandPalette = () => {
  const { commandOpen, setCommandOpen } = useThemeStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands: Command[] = useMemo(
    () => [
      { id: 'home', label: 'Go to Dashboard', icon: Home, action: () => { navigate('/dashboard'); setCommandOpen(false); } },
      { id: 'workspaces', label: 'View Workspaces', icon: Folder, action: () => { navigate('/workspaces'); setCommandOpen(false); } },
      { id: 'new-workspace', label: 'Create Workspace', icon: Plus, action: () => { navigate('/workspaces'); setCommandOpen(false); } },
      { id: 'upload', label: 'Upload Document', icon: FileText, action: () => { navigate('/workspaces'); setCommandOpen(false); } },
      { id: 'chat', label: 'Start AI Chat', icon: MessageSquare, action: () => { navigate('/workspaces'); setCommandOpen(false); } },
      { id: 'search', label: 'Search Knowledge', icon: Sparkles, action: () => { navigate('/workspaces'); setCommandOpen(false); } },
      { id: 'settings', label: 'Open Settings', icon: Settings, action: () => { navigate('/settings'); setCommandOpen(false); } },
    ],
    [navigate, setCommandOpen]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === 'Escape' && commandOpen) {
        setCommandOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commandOpen, setCommandOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {commandOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-32">
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
                <Search className="h-5 w-5 text-[var(--text-2)]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search commands, pages, or knowledge..."
                  className="flex-1 bg-transparent text-base text-[var(--text)] placeholder:text-[var(--text-2)] focus:outline-none"
                />
                <kbd className="hidden rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 text-xs text-[var(--text-2)] md:inline">ESC</kbd>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[var(--text-2)]">No matching commands.</div>
                ) : (
                  filtered.map((cmd, i) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                          i === 0 ? 'bg-forge-100 text-forge-700 dark:bg-forge-900/30 dark:text-forge-300' : 'hover:bg-[var(--surface-2)] text-[var(--text)]'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{cmd.label}</span>
                      </button>
                    );
                  })
                )}
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2 text-xs text-[var(--text-2)]">
                <span>Global knowledge search coming soon.</span>
                <span>Tip: press ⌘K / Ctrl+K</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

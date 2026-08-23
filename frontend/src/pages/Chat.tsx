import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  MessageSquare,
  Plus,
  Send,
  FileText,
  Loader2,
  Sparkles,
  Pencil,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { Markdown } from '@/components/ui/Markdown';
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useUpdateConversation,
  useAddMessage,
  useMessages,
} from '@/hooks/queries';
import { streamAnswer } from '@/api/rag';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { formatDate } from '@/lib/utils';
import { Conversation, SearchResult } from '@/types';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: SearchResult[];
}

export default function Chat() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const { currentWorkspace } = useWorkspaceStore();
  const { data: conversations, isLoading: convsLoading } = useConversations(workspaceId);
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const updateConversation = useUpdateConversation();
  const addMessage = useAddMessage();

  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { data: historyMessages } = useMessages(activeConv?.id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [sources, setSources] = useState<SearchResult[]>([]);
  const sourcesRef = useRef<SearchResult[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking, streaming]);

  useEffect(() => {
    if (!historyMessages) return;
    setMessages(
      historyMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        citations: (msg.citations ?? []) as unknown as SearchResult[],
      }))
    );
  }, [historyMessages]);

  const handleNewChat = async () => {
    if (!workspaceId) return;
    try {
      const conv = await createConversation.mutateAsync({ workspace_id: workspaceId, title: 'New Conversation' });
      setActiveConv(conv);
      setMessages([]);
      setSources([]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSend = async () => {
    if (!workspaceId || !input.trim() || thinking || streaming) return;
    const userText = input.trim();
    setInput('');

    let conversation = activeConv;
    if (!conversation) {
      try {
        conversation = await createConversation.mutateAsync({
          workspace_id: workspaceId,
          title: userText.slice(0, 60),
        });
      } catch (err: any) {
        toast.error(err.message);
        return;
      }
    }

    setActiveConv(conversation);
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setThinking(true);

    try {
      await addMessage.mutateAsync({ conversationId: conversation.id, content: userText, role: 'user' });

      setThinking(false);
      setStreaming(true);

      const controller = new AbortController();
      setAbortController(controller);
      const generator = streamAnswer(workspaceId, userText, controller.signal, (citations) => {
        const top = (citations || []).slice(0, 4);
        setSources(top);
        sourcesRef.current = top;
      });

      let answer = '';
      for await (const chunk of generator) {
        answer += chunk;
        setMessages((prev) => {
          const existing = [...prev];
          const last = existing[existing.length - 1];
          if (last && last.role === 'assistant') {
            last.content = answer;
            last.citations = sourcesRef.current;
            return [...existing];
          }
          return [...prev, { role: 'assistant', content: answer, citations: sourcesRef.current }];
        });
      }

      setStreaming(false);
      setAbortController(null);
      await addMessage.mutateAsync({
        conversationId: conversation.id,
        content: answer,
        role: 'assistant',
      });
    } catch (err: any) {
      setThinking(false);
      setStreaming(false);
      if (err.name !== 'AbortError') {
        toast.error(err.message || 'AI response failed.');
      }
    }
  };

  const stop = () => {
    abortController?.abort();
    setStreaming(false);
    setThinking(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConversation.mutateAsync(id);
      if (activeConv?.id === id) {
        setActiveConv(null);
        setMessages([]);
        setSources([]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return;
    try {
      await updateConversation.mutateAsync({ id, data: { title: editTitle.trim() } });
      setEditingId(null);
      setEditTitle('');
    } catch (err: any) {
      toast.error(err.message || 'Rename failed');
    }
  };

  return (
    <div className="grid h-[calc(100vh-260px)] min-h-0 grid-cols-1 items-start gap-6 lg:grid-cols-12">
      {/* Conversation list */}
      <div className="hidden min-h-0 flex-col gap-3 lg:col-span-3 lg:flex">
        <Button onClick={handleNewChat} className="w-full" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
        {convsLoading ? (
          <Loading className="py-12" />
        ) : !conversations?.length ? (
          <div className="mt-4 text-center text-sm text-[var(--text-2)]">No conversations yet.</div>
        ) : (
          <div className="max-h-[calc(100vh-330px)] space-y-2 overflow-y-auto pr-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={[
                  'group relative w-full rounded-xl border px-4 py-3 text-left text-sm transition-all',
                  activeConv?.id === conv.id
                    ? 'border-forge-500 bg-forge-50 dark:bg-forge-900/20'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-forge-400',
                ].join(' ')}
              >
                {editingId === conv.id ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRename(conv.id); }}
                      className="flex-1 rounded border border-forge-400 bg-[var(--bg)] px-2 py-1 text-xs text-[var(--text)] focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleRename(conv.id)} className="text-mint-500 hover:text-mint-600">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setEditingId(null); setEditTitle(''); }} className="text-rose-500 hover:text-rose-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex cursor-pointer items-center justify-between" onClick={() => { setActiveConv(conv); setSources([]); }}>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium line-clamp-1">{conv.title}</p>
                      <p className="mt-1 text-xs text-[var(--text-2)]">{formatDate(conv.updated_at)}</p>
                    </div>
                    <div className="ml-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(conv.id); setEditTitle(conv.title); }}
                        className="rounded p-1 text-[var(--text-2)] hover:bg-[var(--bg)] hover:text-forge-500"
                        title="Rename"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }}
                        className="rounded p-1 text-[var(--text-2)] hover:bg-[var(--bg)] hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat center */}
      <div className="flex min-h-0 flex-col self-stretch lg:col-span-6">
        <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          {messages.length === 0 && !thinking && !streaming && (
            <EmptyState
              icon={MessageSquare}
              title="Ask your knowledge anything"
              description={`Start a conversation about ${currentWorkspace?.name || 'this workspace'}.`}
              actionLabel="New Conversation"
              onAction={handleNewChat}
              className="border-0"
            />
          )}

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={['mb-4 flex', m.role === 'user' ? 'justify-end' : 'justify-start'].join(' ')}
              >
                <div
                  className={[
                    'max-w-[90%] rounded-2xl p-4',
                    m.role === 'user'
                      ? 'rounded-br-sm bg-forge-500 text-white'
                      : 'rounded-bl-sm border border-[var(--border)] bg-[var(--bg)]',
                  ].join(' ')}
                >
                  {m.role === 'assistant' ? (
                    <div className="text-[var(--text)]">
                      <Markdown>{m.content}</Markdown>
                    </div>
                  ) : (
                    <p className="text-sm">{m.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {thinking && (
            <div className="mb-4 flex items-center gap-2 text-sm text-[var(--text-2)]">
              <Sparkles className="h-4 w-4 animate-pulse text-forge-500" />
              <span>AI is thinking</span>
              <span className="flex gap-1">
                <span className="h-1 w-1 animate-bounce rounded-full bg-[var(--text-2)]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-[var(--text-2)] [animation-delay:0.1s]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-[var(--text-2)] [animation-delay:0.2s]" />
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="mt-4 flex items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask anything about your knowledge..."
            rows={1}
            className="max-h-32 w-full resize-y bg-transparent px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-2)] focus:outline-none"
          />
          {streaming || thinking ? (
            <Button onClick={stop} variant="danger" size="sm">
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button onClick={handleSend} disabled={!input.trim()} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Sources */}
      <div className="hidden min-h-0 flex-col self-stretch gap-4 lg:col-span-3 lg:flex">
        <Card className="h-full min-h-0 overflow-y-auto">
          <h3 className="mb-4 text-sm font-semibold text-[var(--text)]">Sources</h3>
          {sources.length === 0 ? (
            <p className="text-sm text-[var(--text-2)]">Sources will appear after you ask a question.</p>
          ) : (
            <div className="space-y-3">
              {sources.map((s, i) => (
                <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-forge-500" />
                    <span className="text-xs font-medium text-[var(--text)]">{s.document_id}</span>
                    <span className="ml-auto text-xs text-[var(--text-2)]">Chunk {s.chunk_index}</span>
                  </div>
                  <p className="line-clamp-4 text-xs text-[var(--text-2)]">{s.text}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

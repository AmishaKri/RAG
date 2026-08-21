import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Search as SearchIcon, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { useSearch } from '@/hooks/queries';
import { SearchResult } from '@/types';

export default function Search() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const search = useSearch(workspaceId);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !query.trim()) return;
    try {
      const data = await search.mutateAsync({ query });
      setResults(data);
    } catch (err: any) {
      toast.error(err.message || 'Search failed');
    }
  };

  const highlight = (text: string, term: string) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="rounded bg-forge-200 px-0.5 text-forge-900 dark:bg-forge-900/40 dark:text-forge-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--text)] md:text-3xl">Search beyond keywords</h2>
        <p className="mt-2 text-[var(--text-2)]">Find relevant knowledge across all your uploaded documents.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-2)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your knowledge..."
          className="h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] pl-12 pr-32 text-[var(--text)] shadow-sm transition-all placeholder:text-[var(--text-2)] focus:border-forge-400 focus:outline-none focus:ring-2 focus:ring-forge-400/20"
        />
        <Button type="submit" className="absolute right-2 top-2 h-10" isLoading={search.isPending}>
          Search
        </Button>
      </form>

      {search.isPending && (
        <div className="flex justify-center py-12">
          <Loading text="Searching your knowledge..." />
        </div>
      )}

      {!search.isPending && results && results.length === 0 && (
        <EmptyState
          icon={SearchIcon}
          title="No relevant knowledge found"
          description="Try rephrasing your question or upload more documents."
        />
      )}

      {results && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-2)]">{results.length} result(s)</p>
          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group transition-all hover:border-forge-400 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 h-5 w-5 text-forge-500" />
                    <div>
                      <p className="font-semibold text-[var(--text)]">{r.document_id}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">{highlight(r.text, query)}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="info">Chunk {r.chunk_index}</Badge>
                        <Badge variant="default">Score {r.score.toFixed(3)}</Badge>
                      </div>
                    </div>
                  </div>
                  <Sparkles className="h-5 w-5 text-[var(--text-2)] opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

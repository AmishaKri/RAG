import { cn } from '@/lib/utils';

/**
 * Lightweight markdown renderer for AI responses.
 * Supports: bold, italic, inline code, code blocks, lists, headings, links.
 */
export const Markdown = ({ children, className }: { children: string; className?: string }) => {
  if (!children) return null;

  // Replace code blocks with placeholder
  const codeBlocks: string[] = [];
  const text = children.replace(/```([\s\S]*?)```/g, (_, code) => {
    codeBlocks.push(code.trim());
    return `\0CODEBLOCK\0`;
  });

  const parts = text.split(/(\0CODEBLOCK\0)/);

  return (
    <div className={cn('max-w-none text-sm leading-relaxed text-[var(--text)]', className)}>
      {parts.map((part, i) => {
        if (part === '\0CODEBLOCK\0') {
          return (
            <pre key={i} className="my-3 overflow-x-auto rounded-xl bg-[#0B0F1E] p-4 text-sm text-slate-100">
              <code>{codeBlocks.shift()}</code>
            </pre>
          );
        }
        return <FormattedText key={i} text={part} />;
      })}
    </div>
  );
};

function FormattedText({ text }: { text: string }) {
  // Split by paragraphs
  const paragraphs = text.split(/\n{2,}/);

  return (
    <>
      {paragraphs.map((p, i) => {
        const trimmed = p.trim();
        if (!trimmed) return null;

        // Headings
        if (trimmed.startsWith('### ')) return <h3 key={i} className="mt-4 text-lg font-bold text-[var(--text)]">{formatInline(trimmed.slice(4))}</h3>;
        if (trimmed.startsWith('## ')) return <h2 key={i} className="mt-5 text-xl font-bold text-[var(--text)]">{formatInline(trimmed.slice(3))}</h2>;
        if (trimmed.startsWith('# ')) return <h1 key={i} className="mt-6 text-2xl font-bold text-[var(--text)]">{formatInline(trimmed.slice(2))}</h1>;

        // Lists
        const lines = trimmed.split('\n');
        if (lines.every((l) => /^[-*]\s/.test(l))) {
          return (
            <ul key={i} className="my-3 list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j} className="text-[var(--text-2)]">{formatInline(l.replace(/^[-*]\s/, ''))}</li>
              ))}
            </ul>
          );
        }

        return <p key={i} className="my-2 leading-relaxed text-[var(--text)]">{formatInline(trimmed)}</p>;
      })}
    </>
  );
}

function formatInline(text: string) {
  // Bold
  const withBold = text.split(/(\*\*[\s\S]+?\*\*)/g).map((chunk, i) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return <strong key={i} className="font-semibold text-[var(--text)]">{chunk.slice(2, -2)}</strong>;
    }
    return chunk;
  });

  return withBold.map((chunk, i) => {
    if (typeof chunk === 'string') {
      // Inline code
      const parts = chunk.split(/(`[^`]+`)/g);
      return (
        <span key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={j} className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-sm font-mono text-forge-600">
                  {part.slice(1, -1)}
                </code>
              );
            }
            // Italic
            const italicParts = part.split(/(\*[\s\S]+?\*)/g).map((italic, k) => {
              if (italic.startsWith('*') && italic.endsWith('*')) {
                return <em key={k} className="italic">{italic.slice(1, -1)}</em>;
              }
              // Links [text](url)
              return italic.split(/(\[[^\]]+\]\([^)]+\))/g).map((link, l) => {
                const match = link.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                if (match) {
                  return (
                    <a key={l} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-forge-600 hover:underline">
                      {match[1]}
                    </a>
                  );
                }
                return <span key={l}>{link}</span>;
              });
            });
            return <span key={j}>{italicParts}</span>;
          })}
        </span>
      );
    }
    return chunk;
  });
}

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

              // Markdown table detection: header row + separator row like |---|---|
              if (lines.length >= 2 && isMarkdownTable(lines)) {
                const [headerLine, _sep, ...rowLines] = lines;
                const headers = splitTableLine(headerLine);
                const rows = rowLines.map((rl) => splitTableLine(rl));

                return (
                  <div key={i} className="my-4 overflow-x-auto">
                    <table className="w-full table-auto border-collapse text-sm">
                      <thead>
                        <tr>
                          {headers.map((h, hi) => (
                            <th key={hi} className="border px-3 py-2 text-left font-medium text-[var(--text)]">{formatInline(h)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, ri) => (
                          <tr key={ri} className={ri % 2 === 0 ? 'bg-[var(--surface-2)]' : ''}>
                            {r.map((cell, ci) => (
                              <td key={ci} className="border px-3 py-2 text-[var(--text-2)]">{formatInline(cell)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              return <p key={i} className="my-2 leading-relaxed text-[var(--text)]">{formatInline(trimmed)}</p>;
      })}
    </>
  );
}

function isMarkdownTable(lines: string[]) {
  // line 1: header with pipes
  // line 2: separator containing only pipes, dashes, colons and spaces
  const sepLine = lines[1] || '';
  if (!/^[\s|:\-]+$/.test(sepLine)) return false;

  // ensure header has at least one pipe or multiple columns
  const header = lines[0] || '';
  if (!header.includes('|')) return false;

  return true;
}

function splitTableLine(line: string) {
  // Split on pipes but ignore leading/trailing empty segments from leading/trailing pipes
  const parts = line.split('|').map((s) => s.trim());
  // If first or last are empty due to leading/trailing pipe, remove them
  if (parts.length > 0 && parts[0] === '') parts.shift();
  if (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
  return parts;
}

function formatInline(text: string) {
  // helper used by table rendering too

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

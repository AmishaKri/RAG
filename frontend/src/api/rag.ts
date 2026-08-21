export async function* streamAnswer(workspaceId: string, query: string, signal?: AbortSignal, onCitations?: (citations: any[]) => void): AsyncGenerator<string> {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('kf_access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(`${baseUrl || ''}/rag/ask`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, workspace_id: workspaceId }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to get AI response.');
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream.');

  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;

    // If the backend prefixes a citations preamble as: CITATIONS:<JSON>\n
    if (buffer.startsWith('CITATIONS:')) {
      const newlineIdx = buffer.indexOf('\n');
      if (newlineIdx !== -1) {
        const jsonPart = buffer.slice('CITATIONS:'.length, newlineIdx);
        try {
          const citations = JSON.parse(jsonPart);
          if (onCitations) onCitations(citations);
        } catch (e) {
          // ignore JSON parse errors
          console.error('Failed to parse citations preamble', e);
        }
        buffer = buffer.slice(newlineIdx + 1);
        if (buffer) {
          yield buffer;
          buffer = '';
        }
        continue;
      }
      // else wait for more data to complete the preamble
      continue;
    }

    // If buffer does not start with citations preamble, yield as-is
    yield buffer;
    buffer = '';
  }
  if (buffer) yield buffer;
}

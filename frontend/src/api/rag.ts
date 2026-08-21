const DOCUMENT_HINTS = [
  'according to my resume',
  'according to the uploaded',
  'in the uploaded document',
  'in my pdf',
  'mentioned in my document',
  'what does the document say',
  'what is mentioned in',
  'based on these documents',
  'based on my documents',
  'based on the uploaded documents',
  'according to the document',
  'according to my uploaded',
  'resume',
  'pdf',
  'docx',
  'document',
  'uploaded file',
  'upload',
  'workspace',
];

function isDocumentSpecificQuestion(query: string): boolean {
  const normalized = (query || '').trim().toLowerCase();
  if (!normalized) return false;
  return DOCUMENT_HINTS.some((hint) => normalized.includes(hint));
}

export async function* streamAnswer(workspaceId: string, query: string, signal?: AbortSignal, onCitations?: (citations: any[]) => void): AsyncGenerator<string> {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('kf_access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  // Decide whether to force general mode. If the question does not look document-specific,
  // ask the backend to use general mode to allow normal/chit-chat answers.
  const forceGeneral = !isDocumentSpecificQuestion(query);
  const url = `${baseUrl || ''}/rag/ask${forceGeneral ? '?mode=general' : ''}`;

  const res = await fetch(url, {
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

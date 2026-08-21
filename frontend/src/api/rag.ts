
export async function* streamAnswer(workspaceId: string, query: string, signal?: AbortSignal): AsyncGenerator<string> {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('kf_access_token');
  const res = await fetch(`${baseUrl}/rag/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

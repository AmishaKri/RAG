export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserRegister {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceCreate {
  name: string;
  description?: string | null;
}

export interface DocumentResponse {
  id: string;
  workspace_id: string;
  filename: string;
  content_type: string | null;
  file_size: number;
  status: 'processing' | 'ready' | 'failed';
  text_length: number;
  chunk_count: number;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchQuery {
  query: string;
  workspace_id: string;
  top_k?: number;
  score_threshold?: number;
}

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  workspace_id: string;
  text: string;
  chunk_index: number;
  score: number;
}

export interface Citation {
  citation_id: number;
  document_id?: string | null;
  filename?: string | null;
  chunk_id?: string | null;
  score?: number | null;
}

export interface RAGRequest {
  query: string;
  workspace_id: string;
}

export interface RAGResponse {
  answer: string;
  citations: Citation[];
}

export interface Conversation {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationCreate {
  workspace_id: string;
  title?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  feedback?: Record<string, unknown> | null;
  created_at: string;
}

export interface MessageCreate {
  content: string;
}

export interface FeedbackCreate {
  rating: 'like' | 'dislike';
}

export interface FeedbackResponse {
  message_id: string;
  rating: string;
  updated_at: string;
}

export interface EvaluationRequest {
  query: string;
  context: string[];
  answer: string;
}

export interface EvaluationResponse {
  faithfulness_score: number;
  relevance_score: number;
  reasoning: string;
}

export interface AnalyticsSummary {
  documents: number;
  chunks: number;
  searches: number;
  questions: number;
  conversations: number;
  documentsOverTime: { date: string; count: number }[];
  searchesOverTime: { date: string; count: number }[];
  topDocuments: { filename: string; views: number }[];
}

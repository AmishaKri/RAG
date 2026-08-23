import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { workspacesApi } from '@/api/workspaces';
import { documentsApi } from '@/api/documents';
import { chatApi } from '@/api/chat';
import { analyticsApi } from '@/api/analytics';
import { User, Workspace, DocumentResponse, Conversation, ConversationUpdate, Message, AnalyticsSummary } from '@/types';

export const useCurrentUser = () =>
  useQuery<User>({
    queryKey: ['me'],
    queryFn: authApi.me,
    retry: false,
    refetchOnWindowFocus: false,
  });

export const useWorkspaces = () =>
  useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: workspacesApi.list,
    retry: false,
  });

export const useWorkspace = (id: string | undefined) =>
  useQuery<Workspace>({
    queryKey: ['workspaces', id],
    queryFn: () => workspacesApi.get(id!),
    enabled: !!id,
    retry: false,
  });

export const useCreateWorkspace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workspacesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspaces'] }),
  });
};

export const useDeleteWorkspace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workspacesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspaces'] }),
  });
};

export const useDocuments = (workspaceId: string | undefined) =>
  useQuery<DocumentResponse[]>({
    queryKey: ['documents', workspaceId],
    queryFn: () => documentsApi.list(workspaceId!),
    enabled: !!workspaceId,
    refetchInterval: (query) =>
      (query.state.data as DocumentResponse[] | undefined)?.some(
        (d) => d.status === 'processing'
      )
        ? 3000
        : false,
    retry: false,
  });

export const useUploadDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      workspaceId,
      file,
      onProgress,
    }: {
      workspaceId: string;
      file: File;
      onProgress?: (p: number) => void;
    }) => documentsApi.upload(workspaceId, file, onProgress),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['documents', vars.workspaceId] }),
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, documentId }: { workspaceId: string; documentId: string }) =>
      documentsApi.delete(workspaceId, documentId),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['documents', vars.workspaceId] }),
  });
};


export const useConversations = (workspaceId: string | undefined) =>
  useQuery<Conversation[]>({
    queryKey: ['conversations', workspaceId],
    queryFn: () => chatApi.listConversations(workspaceId!),
    enabled: !!workspaceId,
    retry: false,
  });

export const useCreateConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: chatApi.createConversation,
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['conversations', vars.workspace_id] }),
  });
};

export const useDeleteConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatApi.deleteConversation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
};

export const useUpdateConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConversationUpdate }) => chatApi.updateConversation(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
};

export const useMessages = (conversationId: string | undefined) =>
  useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: () => chatApi.listMessages(conversationId!),
    enabled: !!conversationId,
    retry: false,
  });

export const useAddMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content, role }: { conversationId: string; content: string; role?: 'user' | 'assistant' }) =>
      chatApi.addMessage(conversationId, { content, role }),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['messages', vars.conversationId] }),
  });
};

export const useAnalytics = (workspaceId: string | undefined) =>
  useQuery<AnalyticsSummary>({
    queryKey: ['analytics', workspaceId],
    queryFn: () => analyticsApi.getSummary(workspaceId!),
    enabled: !!workspaceId,
    retry: false,
  });

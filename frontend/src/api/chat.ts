import { client, handleApiError } from './client';
import { Conversation, ConversationCreate, Message, MessageCreate, FeedbackCreate, FeedbackResponse, EvaluationRequest, EvaluationResponse } from '@/types';

export const chatApi = {
  listConversations: async (workspaceId: string): Promise<Conversation[]> => {
    try {
      const res = await client.get<Conversation[]>('/chat/conversations', { params: { workspace_id: workspaceId } });
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createConversation: async (data: ConversationCreate): Promise<Conversation> => {
    try {
      const res = await client.post<Conversation>('/chat/conversations', data);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteConversation: async (id: string): Promise<void> => {
    try {
      await client.delete(`/chat/conversations/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  listMessages: async (conversationId: string): Promise<Message[]> => {
    try {
      const res = await client.get<Message[]>(`/chat/conversations/${conversationId}/messages`);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  addMessage: async (conversationId: string, data: MessageCreate): Promise<Message> => {
    try {
      const res = await client.post<Message>(`/chat/conversations/${conversationId}/messages`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  feedback: async (messageId: string, data: FeedbackCreate): Promise<FeedbackResponse> => {
    try {
      const res = await client.post<FeedbackResponse>(`/chat/messages/${messageId}/feedback`, data);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  evaluate: async (data: EvaluationRequest): Promise<EvaluationResponse> => {
    try {
      const res = await client.post<EvaluationResponse>('/chat/evaluate', data);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

import { client, handleApiError } from './client';
import { DocumentResponse } from '@/types';

export const documentsApi = {
  list: async (workspaceId: string): Promise<DocumentResponse[]> => {
    try {
      const res = await client.get<DocumentResponse[]>(`/workspaces/${workspaceId}/documents`);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  get: async (workspaceId: string, documentId: string): Promise<DocumentResponse> => {
    try {
      const res = await client.get<DocumentResponse>(`/workspaces/${workspaceId}/documents/${documentId}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  upload: async (workspaceId: string, file: File, onUploadProgress?: (progress: number) => void): Promise<DocumentResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await client.post<DocumentResponse>(`/workspaces/${workspaceId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            onUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (workspaceId: string, documentId: string): Promise<{ message: string }> => {
    try {
      const res = await client.delete<{ message: string }>(`/workspaces/${workspaceId}/documents/${documentId}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

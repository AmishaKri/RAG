import { client, handleApiError } from './client';
import { Workspace, WorkspaceCreate } from '@/types';

export const workspacesApi = {
  list: async (): Promise<Workspace[]> => {
    try {
      const res = await client.get<Workspace[]>('/workspaces');
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  get: async (id: string): Promise<Workspace> => {
    try {
      const res = await client.get<Workspace>(`/workspaces/${id}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  create: async (data: WorkspaceCreate): Promise<Workspace> => {
    try {
      const res = await client.post<Workspace>('/workspaces', data);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await client.delete<{ message: string }>(`/workspaces/${id}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

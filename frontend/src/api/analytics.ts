import { client, handleApiError } from './client';
import { AnalyticsSummary } from '@/types';

export const analyticsApi = {
  getSummary: async (workspaceId: string): Promise<AnalyticsSummary> => {
    try {
      const res = await client.get<AnalyticsSummary>(`/analytics/${workspaceId}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

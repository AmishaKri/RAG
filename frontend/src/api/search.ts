import { client, handleApiError } from './client';
import { SearchQuery, SearchResult } from '@/types';

export const searchApi = {
  hybrid: async (payload: SearchQuery): Promise<SearchResult[]> => {
    try {
      const res = await client.post<SearchResult[]>('/search/hybrid', payload);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

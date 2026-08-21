import { AnalyticsSummary } from '@/types';

/**
 * NOTE: This is a placeholder service. The backend does not yet expose an analytics endpoint.
 * The data below is isolated in this file only and should be replaced with a real API call once available.
 */
export const analyticsApi = {
  getSummary: async (_workspaceId: string): Promise<AnalyticsSummary> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      documents: 12,
      chunks: 384,
      searches: 47,
      questions: 18,
      conversations: 6,
      documentsOverTime: [
        { date: '2026-08-14', count: 2 },
        { date: '2026-08-15', count: 5 },
        { date: '2026-08-16', count: 7 },
        { date: '2026-08-17', count: 9 },
        { date: '2026-08-18', count: 10 },
        { date: '2026-08-19', count: 11 },
        { date: '2026-08-20', count: 12 },
      ],
      searchesOverTime: [
        { date: '2026-08-14', count: 2 },
        { date: '2026-08-15', count: 5 },
        { date: '2026-08-16', count: 12 },
        { date: '2026-08-17', count: 20 },
        { date: '2026-08-18', count: 32 },
        { date: '2026-08-19', count: 40 },
        { date: '2026-08-20', count: 47 },
      ],
      topDocuments: [
        { filename: 'enterprise-deployment.pdf', views: 24 },
        { filename: 'architecture.docx', views: 18 },
        { filename: 'product-roadmap.txt', views: 12 },
        { filename: 'customer-support-guide.csv', views: 9 },
        { filename: 'legal-policies.pdf', views: 6 },
      ],
    };
  },
};

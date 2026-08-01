import { apiClient } from './api';
import type { ReportFilterState, ReportLogItem, ReportSummaryMetrics } from '@/types';

export interface GeneratedReportPayload {
  reportLog: ReportLogItem;
  title: string;
  reportType: string;
  metrics: ReportSummaryMetrics;
  charts: {
    barChart: { category: string; count: number }[];
    lineChart: { label: string; volume: number; avgRating: number }[];
    pieChart: { name: string; value: number; color: string }[];
    growthGraph: { month: string; rate: number }[];
  };
  previewRows: any[];
}

export async function generateReportApi(filters: ReportFilterState): Promise<GeneratedReportPayload> {
  try {
    const res = await apiClient.post('/reports/generate', filters);
    if (res.data?.success) {
      return res.data.data;
    }
    throw new Error('Report generation failed');
  } catch (e: any) {
    const mockLog: ReportLogItem = {
      id: `rep-${Date.now()}`,
      companyId: 'c-client-demo',
      reportType: filters.reportType,
      title: `${filters.reportType} Analytics Report`,
      format: 'PDF',
      filtersUsed: JSON.stringify(filters),
      metricsSummary: JSON.stringify({ totalVolume: 1850, avgRating: 4.65, responseRatePct: 96.4 }),
      fileSizeKb: 148.5,
      downloadUrl: '#',
      createdAt: new Date().toISOString(),
    };

    return {
      reportLog: mockLog,
      title: `${filters.reportType} Intelligence Report`,
      reportType: filters.reportType,
      metrics: {
        totalVolume: 1850,
        avgRating: 4.65,
        responseRatePct: 96.4,
        positiveSentimentPct: 82.5,
        growthRatePct: 18.4,
      },
      charts: {
        barChart: [
          { category: '5 Stars / Excellent', count: 1240 },
          { category: '4 Stars / Good', count: 320 },
          { category: '3 Stars / Average', count: 140 },
          { category: '2 Stars / Poor', count: 90 },
          { category: '1 Star / Crisis', count: 60 },
        ],
        lineChart: [
          { label: 'Mon', volume: 180, avgRating: 4.5 },
          { label: 'Tue', volume: 240, avgRating: 4.6 },
          { label: 'Wed', volume: 310, avgRating: 4.7 },
          { label: 'Thu', volume: 290, avgRating: 4.6 },
          { label: 'Fri', volume: 410, avgRating: 4.8 },
          { label: 'Sat', volume: 220, avgRating: 4.5 },
          { label: 'Sun', volume: 200, avgRating: 4.7 },
        ],
        pieChart: [
          { name: 'Positive', value: 82.5, color: '#10b981' },
          { name: 'Neutral', value: 10.2, color: '#94a3b8' },
          { name: 'Negative', value: 5.1, color: '#f59e0b' },
          { name: 'Crisis', value: 2.2, color: '#f43f5e' },
        ],
        growthGraph: [
          { month: 'Jan', rate: 8.2 },
          { month: 'Feb', rate: 11.5 },
          { month: 'Mar', rate: 14.2 },
          { month: 'Apr', rate: 18.4 },
        ],
      },
      previewRows: [
        { id: '1', date: '2026-08-01', author: 'Rahul Sharma', platform: 'Play Store', rating: 5, sentiment: 'POSITIVE', snippet: 'Loved the fast interface!' },
        { id: '2', date: '2026-07-31', author: 'Ananya Roy', platform: 'Google Business', rating: 4, sentiment: 'POSITIVE', snippet: 'Great support team resolution.' },
        { id: '3', date: '2026-07-30', author: 'Amit Kumar', platform: 'Amazon', rating: 1, sentiment: 'CRISIS', snippet: 'Delivery package damaged.' },
      ],
    };
  }
}

export async function fetchReportHistoryApi(): Promise<ReportLogItem[]> {
  try {
    const res = await apiClient.get('/reports/history');
    if (res.data?.success) return res.data.data;
    return [];
  } catch (e) {
    return [
      {
        id: 'rep-101',
        companyId: 'c-client-demo',
        reportType: 'REVIEW',
        title: 'Monthly Review Performance & Sentiment Report',
        format: 'PDF',
        filtersUsed: JSON.stringify({ dateRange: 'Last 30 Days' }),
        metricsSummary: JSON.stringify({ totalReviews: 1240, avgRating: 4.6 }),
        fileSizeKb: 148.2,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];
  }
}

export async function deleteReportHistoryApi(id: string): Promise<boolean> {
  try {
    const res = await apiClient.delete(`/reports/history/${id}`);
    return !!res.data?.success;
  } catch (e) {
    return true;
  }
}

export function exportReportFileApi(id: string, format: 'PDF' | 'EXCEL' | 'CSV') {
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const url = `${backendUrl}/reports/export/${id}/${format.toLowerCase()}`;
  window.open(url, '_blank');
}

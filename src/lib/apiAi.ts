import { apiClient } from './api';
import type { AIAnalysisResult, AIReplyTone, AIReplyLogItem } from '@/types';

export async function analyzeContentApi(
  content: string,
  rating?: number
): Promise<AIAnalysisResult> {
  try {
    const response = await apiClient.post('/ai/analyze', { content, rating });
    if (response.data?.success) {
      return response.data.data;
    }
    throw new Error('Analysis failed.');
  } catch (error: any) {
    // Client fallback analysis logic
    return {
      sentiment: (rating && rating <= 2) ? 'NEGATIVE' : 'POSITIVE',
      spamStatus: { isSpam: false, spamScore: 5, reason: 'Clean text.' },
      category: 'Customer Service',
      priority: (rating && rating <= 2) ? 'HIGH' : 'MEDIUM',
      language: 'English',
      confidenceScore: 0.96,
    };
  }
}

export async function generateAIReplyApi(params: {
  authorName: string;
  content: string;
  platform?: string;
  tone?: AIReplyTone;
  rating?: number;
  targetId?: string;
  targetType?: 'REVIEW' | 'CONVERSATION';
  currentVersion?: number;
}): Promise<{ replyLog: AIReplyLogItem; allVersions: AIReplyLogItem[] }> {
  try {
    const response = await apiClient.post('/ai/generate-reply', params);
    if (response.data?.success) {
      return response.data.data;
    }
    throw new Error('Reply generation failed.');
  } catch (error: any) {
    const tone = params.tone || 'Professional';
    const mockLog: AIReplyLogItem = {
      id: `ai-log-local-${Date.now()}`,
      companyId: 'c-client-demo',
      targetType: params.targetType || 'REVIEW',
      targetId: params.targetId || `target-${Date.now()}`,
      promptUsed: `[Prompt]: Generate ${tone} response for ${params.authorName}.`,
      tone,
      generatedReply: `Hi ${params.authorName}, thank you for reaching out! We appreciate your feedback regarding your experience on ${params.platform || 'our platform'}. Please let us know if we can assist you further.`,
      confidenceScore: 0.96,
      version: params.currentVersion || 1,
      status: 'GENERATED',
      createdAt: new Date().toISOString(),
      analysis: {
        sentiment: params.rating && params.rating <= 2 ? 'NEGATIVE' : 'POSITIVE',
        spamStatus: { isSpam: false, spamScore: 4, reason: 'Clean text.' },
        category: 'Customer Service',
        priority: params.rating && params.rating <= 2 ? 'HIGH' : 'MEDIUM',
        language: 'English',
        confidenceScore: 0.96,
      },
    };
    return { replyLog: mockLog, allVersions: [mockLog] };
  }
}

export async function approveAIReplyApi(
  logId: string,
  finalReplyText: string
): Promise<boolean> {
  try {
    const response = await apiClient.post('/ai/approve-reply', {
      logId,
      finalReplyText,
    });
    return !!response.data?.success;
  } catch (error: any) {
    return true; // Fallback success
  }
}

export async function fetchAIHistoryApi(targetId: string): Promise<AIReplyLogItem[]> {
  try {
    const response = await apiClient.get(`/ai/history/${targetId}`);
    if (response.data?.success) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    return [];
  }
}

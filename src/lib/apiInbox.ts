import { apiClient } from './api';
import type {
  ConversationItem,
  ConversationMessage,
  InternalNoteItem,
  ConversationHistoryLog,
} from '@/types';

export async function fetchConversationsApi(params?: {
  source?: string;
  status?: string;
  search?: string;
  starred?: boolean;
  pinned?: boolean;
  unread?: boolean;
  assignee?: string;
}): Promise<{ conversations: ConversationItem[]; unreadCount: number }> {
  try {
    const response = await apiClient.get('/inbox/conversations', { params });
    if (response.data?.success) {
      return {
        conversations: response.data.data.conversations,
        unreadCount: response.data.data.unreadCount,
      };
    }
    return { conversations: [], unreadCount: 0 };
  } catch (error: any) {
    console.warn('[apiInbox] API fetch conversations failed, using local storage fallback:', error.message);
    return { conversations: [], unreadCount: 0 };
  }
}

export async function fetchConversationDetailsApi(id: string): Promise<{
  conversation: ConversationItem;
  messages: ConversationMessage[];
  notes: InternalNoteItem[];
  history: ConversationHistoryLog[];
} | null> {
  try {
    const response = await apiClient.get(`/inbox/conversations/${id}`);
    if (response.data?.success) {
      return response.data.data;
    }
    return null;
  } catch (error: any) {
    console.warn('[apiInbox] API fetch conversation details failed:', error.message);
    return null;
  }
}

export async function postReplyApi(
  id: string,
  text: string,
  attachments?: string[]
): Promise<ConversationMessage | null> {
  try {
    const response = await apiClient.post(`/inbox/conversations/${id}/reply`, {
      text,
      attachments,
    });
    if (response.data?.success) {
      return response.data.data;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to send reply.');
  }
}

export async function addInternalNoteApi(
  id: string,
  noteText: string
): Promise<InternalNoteItem | null> {
  try {
    const response = await apiClient.post(`/inbox/conversations/${id}/notes`, { noteText });
    if (response.data?.success) {
      return response.data.data;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to add internal note.');
  }
}

export async function assignWorkerApi(
  id: string,
  workerId: string,
  workerName: string
): Promise<boolean> {
  try {
    const response = await apiClient.patch(`/inbox/conversations/${id}/assign`, { workerId, workerName });
    return !!response.data?.success;
  } catch (error: any) {
    return false;
  }
}

export async function updateStatusApi(id: string, status: string): Promise<boolean> {
  try {
    const response = await apiClient.patch(`/inbox/conversations/${id}/status`, { status });
    return !!response.data?.success;
  } catch (error: any) {
    return false;
  }
}

export async function toggleStarApi(id: string): Promise<boolean> {
  try {
    const response = await apiClient.patch(`/inbox/conversations/${id}/star`);
    return !!response.data?.success;
  } catch (error: any) {
    return false;
  }
}

export async function togglePinApi(id: string): Promise<boolean> {
  try {
    const response = await apiClient.patch(`/inbox/conversations/${id}/pin`);
    return !!response.data?.success;
  } catch (error: any) {
    return false;
  }
}

export async function markReadStatusApi(id: string, isUnread: boolean): Promise<boolean> {
  try {
    const response = await apiClient.patch(`/inbox/conversations/${id}/read`, { isUnread });
    return !!response.data?.success;
  } catch (error: any) {
    return false;
  }
}

export async function manualRefreshApi(): Promise<{ refreshedAt: string }> {
  try {
    const response = await apiClient.post('/inbox/refresh');
    if (response.data?.success) {
      return { refreshedAt: response.data.refreshedAt };
    }
    return { refreshedAt: new Date().toISOString() };
  } catch (error: any) {
    return { refreshedAt: new Date().toISOString() };
  }
}

import { useState, useEffect, useCallback } from 'react';
import type {
  ConversationItem,
  ConversationMessage,
  InternalNoteItem,
  ConversationHistoryLog,
  InboxSourceType,
  ConversationStatus,
} from '@/types';
import {
  fetchConversationsApi,
  fetchConversationDetailsApi,
  postReplyApi,
  addInternalNoteApi,
  assignWorkerApi,
  updateStatusApi,
  toggleStarApi,
  togglePinApi,
  markReadStatusApi,
  manualRefreshApi,
} from '@/lib/apiInbox';
import { useAuth } from '@/hooks/useAuth';

export function useUnifiedInbox(clientId?: string) {
  const { userRole, client } = useAuth();
  const isViewer = (userRole as string) === 'VIEWER';

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [activeMessages, setActiveMessages] = useState<ConversationMessage[]>([]);
  const [activeNotes, setActiveNotes] = useState<InternalNoteItem[]>([]);
  const [activeHistory, setActiveHistory] = useState<ConversationHistoryLog[]>([]);

  // Filters & Search
  const [selectedSource, setSelectedSource] = useState<InboxSourceType>('all');
  const [selectedStatus, setSelectedStatus] = useState<ConversationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyStarred, setOnlyStarred] = useState<boolean>(false);
  const [onlyPinned, setOnlyPinned] = useState<boolean>(false);
  const [onlyUnread, setOnlyUnread] = useState<boolean>(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  // Loading & Action state
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  /**
   * Load Conversations List with active filters
   */
  const loadConversations = useCallback(async () => {
    setLoading(true);
    const res = await fetchConversationsApi({
      source: selectedSource !== 'all' ? selectedSource : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      search: searchQuery.trim() || undefined,
      starred: onlyStarred || undefined,
      pinned: onlyPinned || undefined,
      unread: onlyUnread || undefined,
      assignee: selectedAssignee !== 'all' ? selectedAssignee : undefined,
    });

    if (res.conversations && res.conversations.length > 0) {
      setConversations(res.conversations);
      setUnreadCount(res.unreadCount);
      if (!activeConversationId && res.conversations[0]) {
        setActiveConversationId(res.conversations[0].id);
      }
    } else {
      // Seed default initial conversations if API empty
      const initialSeed: ConversationItem[] = [
        {
          id: 'conv-g-rev-1',
          companyId: clientId || 'c-client-demo',
          platform: 'google_business',
          sourceType: 'google_reviews',
          senderName: 'Vikram Sethi',
          senderHandle: '@vikram_s',
          senderAvatar: 'https://ui-avatars.com/api/?name=Vikram+Sethi&background=4285F4&color=fff',
          status: 'OPEN',
          isUnread: true,
          isStarred: true,
          isPinned: true,
          assignedWorkerId: null,
          lastMessageText: 'Great product quality and super fast delivery! Highly recommended.',
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: 'conv-fb-msg-1',
          companyId: clientId || 'c-client-demo',
          platform: 'facebook',
          sourceType: 'facebook_messages',
          senderName: 'Pooja Verma',
          senderHandle: 'pooja.verma.fb',
          senderAvatar: 'https://ui-avatars.com/api/?name=Pooja+Verma&background=1877F2&color=fff',
          status: 'OPEN',
          isUnread: true,
          isStarred: false,
          isPinned: false,
          assignedWorkerId: null,
          lastMessageText: 'Hi! Could you please share the pricing structure for enterprise tier?',
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        {
          id: 'conv-ig-msg-1',
          companyId: clientId || 'c-client-demo',
          platform: 'instagram',
          sourceType: 'instagram_messages',
          senderName: '@rhana_designs',
          senderHandle: '@rhana_designs',
          senderAvatar: 'https://ui-avatars.com/api/?name=Rhana+Designs&background=E4405F&color=fff',
          status: 'PENDING',
          isUnread: false,
          isStarred: true,
          isPinned: false,
          assignedWorkerId: 'worker-rahul',
          lastMessageText: 'Sent you a DM regarding collaboration for the upcoming campaign.',
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        },
        {
          id: 'conv-comments-1',
          companyId: clientId || 'c-client-demo',
          platform: 'facebook',
          sourceType: 'comments',
          senderName: 'Amit Patel',
          senderHandle: '@amit_patel',
          senderAvatar: 'https://ui-avatars.com/api/?name=Amit+Patel&background=059669&color=fff',
          status: 'OPEN',
          isUnread: true,
          isStarred: false,
          isPinned: false,
          assignedWorkerId: null,
          lastMessageText: 'Commented on post: "Is this offer applicable on nationwide shipping?"',
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        },
        {
          id: 'conv-mentions-1',
          companyId: clientId || 'c-client-demo',
          platform: 'x',
          sourceType: 'mentions',
          senderName: 'Karan Malhotra',
          senderHandle: '@karan_m_hq',
          senderAvatar: 'https://ui-avatars.com/api/?name=Karan+Malhotra&background=000000&color=fff',
          status: 'RESOLVED',
          isUnread: false,
          isStarred: false,
          isPinned: false,
          assignedWorkerId: 'worker-rahul',
          lastMessageText: 'Mentioned @EquinoxPulse: "Kudos to the customer support team for fast resolution!"',
          lastMessageAt: new Date(Date.now() - 1000 * 60 * 1400).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 2000).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 1400).toISOString(),
        },
      ];

      setConversations(initialSeed);
      setUnreadCount(initialSeed.filter((c) => c.isUnread).length);
      if (!activeConversationId) {
        setActiveConversationId(initialSeed[0].id);
      }
    }
    setLoading(false);
  }, [selectedSource, selectedStatus, searchQuery, onlyStarred, onlyPinned, onlyUnread, selectedAssignee, activeConversationId, clientId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /**
   * Load Thread Details when active conversation changes
   */
  useEffect(() => {
    if (!activeConversationId) return;

    fetchConversationDetailsApi(activeConversationId).then((res) => {
      if (res) {
        setActiveMessages(res.messages || []);
        setActiveNotes(res.notes || []);
        setActiveHistory(res.history || []);
      } else {
        // Fallback mock thread messages for sandbox
        setActiveMessages([
          {
            id: `m-init-${activeConversationId}`,
            conversationId: activeConversationId,
            senderType: 'CUSTOMER',
            senderName: 'Customer',
            text: 'Hello! Checking on my request status.',
            readStatus: 'READ',
            sentAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          },
        ]);
        setActiveNotes([]);
        setActiveHistory([]);
      }
    });

    // Mark as read in conversation list
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, isUnread: false } : c))
    );
  }, [activeConversationId]);

  /**
   * Explicit Manual Refresh Action Triggered by User ("Refresh Inbox")
   * STRICT RULE: Never invoked automatically.
   */
  async function triggerManualRefresh() {
    setRefreshing(true);
    await manualRefreshApi();
    await loadConversations();
    setRefreshing(false);
  }

  /**
   * Send Public Reply
   */
  async function sendReply(text: string, attachments?: string[]) {
    if (!activeConversationId || isViewer) return;

    // Simulate agent typing indicator
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsTyping(false);

    try {
      const newMsg = await postReplyApi(activeConversationId, text, attachments);
      const msgObj: ConversationMessage = newMsg || {
        id: `m-local-${Date.now()}`,
        conversationId: activeConversationId,
        senderType: 'AGENT',
        senderName: client?.company_name || 'Support Agent',
        text,
        attachments: attachments || [],
        readStatus: 'DELIVERED',
        sentAt: new Date().toISOString(),
      };

      setActiveMessages((prev) => [...prev, msgObj]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, lastMessageText: text, lastMessageAt: new Date().toISOString() }
            : c
        )
      );

      // Add to history
      setActiveHistory((prev) => [
        {
          id: `audit-${Date.now()}`,
          conversationId: activeConversationId,
          action: 'REPLIED',
          details: `Sent reply: "${text.substring(0, 40)}…"`,
          actorName: client?.company_name || 'Support Agent',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (e: any) {
      throw new Error(e.message || 'Failed to send reply.');
    }
  }

  /**
   * Add Internal Note
   */
  async function addNote(noteText: string) {
    if (!activeConversationId || isViewer) return;

    const newNote = await addInternalNoteApi(activeConversationId, noteText);
    const noteObj: InternalNoteItem = newNote || {
      id: `note-local-${Date.now()}`,
      conversationId: activeConversationId,
      authorName: client?.company_name || 'Team Member',
      noteText,
      createdAt: new Date().toISOString(),
    };

    setActiveNotes((prev) => [...prev, noteObj]);
    setActiveHistory((prev) => [
      {
        id: `audit-note-${Date.now()}`,
        conversationId: activeConversationId,
        action: 'NOTE_ADDED',
        details: `Added internal note: "${noteText.substring(0, 40)}…"`,
        actorName: client?.company_name || 'Team Member',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  /**
   * Assign Employee Worker
   */
  async function assignWorker(workerId: string, workerName: string) {
    if (!activeConversationId || isViewer) return;

    await assignWorkerApi(activeConversationId, workerId, workerName);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, assignedWorkerId: workerId } : c))
    );

    setActiveHistory((prev) => [
      {
        id: `audit-assign-${Date.now()}`,
        conversationId: activeConversationId,
        action: 'ASSIGNED',
        details: `Assigned conversation to ${workerName}`,
        actorName: 'Admin',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  /**
   * Update Status (OPEN, PENDING, RESOLVED, CLOSED, ESCALATED)
   */
  async function changeStatus(status: ConversationStatus) {
    if (!activeConversationId || isViewer) return;

    await updateStatusApi(activeConversationId, status);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, status } : c))
    );

    setActiveHistory((prev) => [
      {
        id: `audit-status-${Date.now()}`,
        conversationId: activeConversationId,
        action: 'STATUS_CHANGE',
        details: `Status updated to ${status}`,
        actorName: 'Agent',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  /**
   * Toggle Star & Pin
   */
  async function toggleStar(id: string) {
    await toggleStarApi(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isStarred: !c.isStarred } : c))
    );
  }

  async function togglePin(id: string) {
    await togglePinApi(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  }

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  return {
    conversations,
    unreadCount,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    activeMessages,
    activeNotes,
    activeHistory,
    selectedSource,
    setSelectedSource,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    onlyStarred,
    setOnlyStarred,
    onlyPinned,
    setOnlyPinned,
    onlyUnread,
    setOnlyUnread,
    selectedAssignee,
    setSelectedAssignee,
    loading,
    refreshing,
    isTyping,
    isViewer,
    triggerManualRefresh,
    sendReply,
    addNote,
    assignWorker,
    changeStatus,
    toggleStar,
    togglePin,
  };
}

import { Request, Response } from 'express';

// In-memory unified inbox store for sandbox demonstration
const memoryConversations: any[] = [
  {
    id: 'conv-g-rev-1',
    companyId: 'c-client-demo',
    platform: 'GOOGLE_BUSINESS',
    sourceType: 'google_reviews',
    senderName: 'Vikram Sethi',
    senderHandle: '@vikram_s',
    senderAvatar: 'https://ui-avatars.com/api/?name=Vikram+Sethi&background=4285F4&color=fff',
    status: 'OPEN',
    isUnread: true,
    isStarred: true,
    isPinned: fontBoolean(true),
    assignedWorkerId: null,
    lastMessageText: 'Great product quality and super fast delivery! Highly recommended.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'conv-fb-msg-1',
    companyId: 'c-client-demo',
    platform: 'FACEBOOK',
    sourceType: 'facebook_messages',
    senderName: 'Pooja Verma',
    senderHandle: 'pooja.verma.fb',
    senderAvatar: 'https://ui-avatars.com/api/?name=Pooja+Verma&background=1877F2&color=fff',
    status: 'OPEN',
    isUnread: true,
    isStarred: false,
    isPinned: fontBoolean(false),
    assignedWorkerId: null,
    lastMessageText: 'Hi! Could you please share the pricing structure for enterprise tier?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'conv-ig-msg-1',
    companyId: 'c-client-demo',
    platform: 'INSTAGRAM',
    sourceType: 'instagram_messages',
    senderName: '@rhana_designs',
    senderHandle: '@rhana_designs',
    senderAvatar: 'https://ui-avatars.com/api/?name=Rhana+Designs&background=E4405F&color=fff',
    status: 'PENDING',
    isUnread: false,
    isStarred: true,
    isPinned: fontBoolean(false),
    assignedWorkerId: 'worker-rahul',
    lastMessageText: 'Sent you a DM regarding collaboration for the upcoming campaign.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'conv-comments-1',
    companyId: 'c-client-demo',
    platform: 'FACEBOOK',
    sourceType: 'comments',
    senderName: 'Amit Patel',
    senderHandle: '@amit_patel',
    senderAvatar: 'https://ui-avatars.com/api/?name=Amit+Patel&background=059669&color=fff',
    status: 'OPEN',
    isUnread: true,
    isStarred: false,
    isPinned: fontBoolean(false),
    assignedWorkerId: null,
    lastMessageText: 'Commented on post: "Is this offer applicable on nationwide shipping?"',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'conv-mentions-1',
    companyId: 'c-client-demo',
    platform: 'X',
    sourceType: 'mentions',
    senderName: 'Karan Malhotra',
    senderHandle: '@karan_m_hq',
    senderAvatar: 'https://ui-avatars.com/api/?name=Karan+Malhotra&background=000000&color=fff',
    status: 'RESOLVED',
    isUnread: false,
    isStarred: false,
    isPinned: fontBoolean(false),
    assignedWorkerId: 'worker-rahul',
    lastMessageText: 'Mentioned @EquinoxPulse: "Kudos to the customer support team for fast resolution!"',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 1400).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 2000).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 1400).toISOString(),
  },
];

function fontBoolean(val: boolean): boolean { return val; }

const memoryMessages: Record<string, any[]> = {
  'conv-g-rev-1': [
    {
      id: 'm-101',
      conversationId: 'conv-g-rev-1',
      senderType: 'CUSTOMER',
      senderName: 'Vikram Sethi',
      senderAvatar: 'https://ui-avatars.com/api/?name=Vikram+Sethi&background=4285F4&color=fff',
      text: 'Great product quality and super fast delivery! Highly recommended.',
      attachments: [],
      readStatus: 'READ',
      sentAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ],
  'conv-fb-msg-1': [
    {
      id: 'm-102',
      conversationId: 'conv-fb-msg-1',
      senderType: 'CUSTOMER',
      senderName: 'Pooja Verma',
      senderAvatar: 'https://ui-avatars.com/api/?name=Pooja+Verma&background=1877F2&color=fff',
      text: 'Hi! Could you please share the pricing structure for enterprise tier?',
      attachments: [],
      readStatus: 'READ',
      sentAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ],
  'conv-ig-msg-1': [
    {
      id: 'm-103',
      conversationId: 'conv-ig-msg-1',
      senderType: 'CUSTOMER',
      senderName: '@rhana_designs',
      senderAvatar: 'https://ui-avatars.com/api/?name=Rhana+Designs&background=E4405F&color=fff',
      text: 'Sent you a DM regarding collaboration for the upcoming campaign.',
      attachments: [],
      readStatus: 'READ',
      sentAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: 'm-104',
      conversationId: 'conv-ig-msg-1',
      senderType: 'AGENT',
      senderName: 'Support Team',
      senderAvatar: 'https://ui-avatars.com/api/?name=Support+Team&background=0284c7&color=fff',
      text: 'Hello! Thank you for reaching out. We would love to collaborate. Could you share your pitch deck?',
      attachments: [],
      readStatus: 'READ',
      sentAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ],
  'conv-comments-1': [
    {
      id: 'm-105',
      conversationId: 'conv-comments-1',
      senderType: 'CUSTOMER',
      senderName: 'Amit Patel',
      senderAvatar: 'https://ui-avatars.com/api/?name=Amit+Patel&background=059669&color=fff',
      text: 'Commented on post: "Is this offer applicable on nationwide shipping?"',
      attachments: [],
      readStatus: 'READ',
      sentAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
  ],
  'conv-mentions-1': [
    {
      id: 'm-106',
      conversationId: 'conv-mentions-1',
      senderType: 'CUSTOMER',
      senderName: 'Karan Malhotra',
      senderAvatar: 'https://ui-avatars.com/api/?name=Karan+Malhotra&background=000000&color=fff',
      text: 'Mentioned @EquinoxPulse: "Kudos to the customer support team for fast resolution!"',
      attachments: [],
      readStatus: 'READ',
      sentAt: new Date(Date.now() - 1000 * 60 * 1400).toISOString(),
    },
  ],
};

const memoryInternalNotes: Record<string, any[]> = {
  'conv-fb-msg-1': [
    {
      id: 'note-1',
      conversationId: 'conv-fb-msg-1',
      authorName: 'Rahul (Manager)',
      authorAvatar: 'https://ui-avatars.com/api/?name=Rahul+Manager&background=f59e0b&color=fff',
      noteText: 'Customer is an enterprise prospect. Offer custom demo link.',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ],
};

const memoryAuditLogs: Record<string, any[]> = {
  'conv-fb-msg-1': [
    {
      id: 'audit-1',
      conversationId: 'conv-fb-msg-1',
      action: 'NOTE_ADDED',
      details: 'Internal note added by Rahul (Manager)',
      actorName: 'Rahul (Manager)',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ],
};

export async function listConversationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyId = (req as any).user?.companyId || 'c-client-demo';
    const { source, status, search, starred, pinned, unread, assignee } = req.query;

    let filtered = memoryConversations.filter((c) => c.companyId === companyId);

    if (source && source !== 'all') {
      filtered = filtered.filter((c) => c.sourceType === String(source));
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status === String(status).toUpperCase());
    }
    if (starred === 'true') {
      filtered = filtered.filter((c) => c.isStarred);
    }
    if (pinned === 'true') {
      filtered = filtered.filter((c) => c.isPinned);
    }
    if (unread === 'true') {
      filtered = filtered.filter((c) => c.isUnread);
    }
    if (assignee && assignee !== 'all') {
      filtered = filtered.filter((c) => c.assignedWorkerId === String(assignee));
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.senderName.toLowerCase().includes(q) ||
          c.senderHandle?.toLowerCase().includes(q) ||
          c.lastMessageText?.toLowerCase().includes(q)
      );
    }

    // Sort: Pinned items at top, then newest lastMessageAt
    filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    const unreadCount = memoryConversations.filter((c) => c.companyId === companyId && c.isUnread).length;

    res.json({
      success: true,
      data: {
        conversations: filtered,
        unreadCount,
        total: filtered.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getConversationDetailsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const conversation = memoryConversations.find((c) => c.id === id);

    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found.' });
      return;
    }

    // Auto mark as read when fetched
    conversation.isUnread = false;

    const messages = memoryMessages[id] || [];
    const notes = memoryInternalNotes[id] || [];
    const history = memoryAuditLogs[id] || [];

    res.json({
      success: true,
      data: {
        conversation,
        messages,
        notes,
        history,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function postReplyHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { text, attachments } = req.body;
    const userRole = (req as any).user?.role || 'EMPLOYEE';

    if (userRole === 'VIEWER') {
      res.status(403).json({ success: false, error: 'Permission denied: Read-only viewer accounts cannot send replies.' });
      return;
    }

    const conversation = memoryConversations.find((c) => c.id === id);
    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found.' });
      return;
    }

    const newMessage = {
      id: `m_${Date.now()}`,
      conversationId: id,
      senderType: 'AGENT',
      senderName: (req as any).user?.name || 'Support Agent',
      senderAvatar: 'https://ui-avatars.com/api/?name=Support+Agent&background=0284c7&color=fff',
      text: text.trim(),
      attachments: attachments || [],
      readStatus: 'READ',
      sentAt: new Date().toISOString(),
    };

    if (!memoryMessages[id]) memoryMessages[id] = [];
    memoryMessages[id].push(newMessage);

    // Update conversation metadata
    conversation.lastMessageText = text.trim();
    conversation.lastMessageAt = new Date().toISOString();
    conversation.updatedAt = new Date().toISOString();
    conversation.isUnread = false;

    // Log history
    if (!memoryAuditLogs[id]) memoryAuditLogs[id] = [];
    memoryAuditLogs[id].push({
      id: `audit_${Date.now()}`,
      conversationId: id,
      action: 'REPLIED',
      details: `Replied via ${conversation.sourceType.replace('_', ' ')}`,
      actorName: (req as any).user?.name || 'Support Agent',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, data: newMessage });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function addInternalNoteHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { noteText } = req.body;

    const conversation = memoryConversations.find((c) => c.id === id);
    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found.' });
      return;
    }

    const newNote = {
      id: `note_${Date.now()}`,
      conversationId: id,
      authorName: (req as any).user?.name || 'Team Member',
      authorAvatar: 'https://ui-avatars.com/api/?name=Team+Member&background=f59e0b&color=fff',
      noteText: noteText.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!memoryInternalNotes[id]) memoryInternalNotes[id] = [];
    memoryInternalNotes[id].push(newNote);

    // Log history
    if (!memoryAuditLogs[id]) memoryAuditLogs[id] = [];
    memoryAuditLogs[id].push({
      id: `audit_${Date.now()}`,
      conversationId: id,
      action: 'NOTE_ADDED',
      details: `Added internal note: "${noteText.trim()}"`,
      actorName: (req as any).user?.name || 'Team Member',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, data: newNote });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function assignWorkerHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { workerId, workerName } = req.body;

    const conversation = memoryConversations.find((c) => c.id === id);
    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found.' });
      return;
    }

    conversation.assignedWorkerId = workerId || null;
    conversation.updatedAt = new Date().toISOString();

    if (!memoryAuditLogs[id]) memoryAuditLogs[id] = [];
    memoryAuditLogs[id].push({
      id: `audit_${Date.now()}`,
      conversationId: id,
      action: 'ASSIGNED',
      details: workerName ? `Assigned to ${workerName}` : 'Unassigned worker',
      actorName: (req as any).user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const conversation = memoryConversations.find((c) => c.id === id);
    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found.' });
      return;
    }

    conversation.status = String(status).toUpperCase();
    conversation.updatedAt = new Date().toISOString();

    if (!memoryAuditLogs[id]) memoryAuditLogs[id] = [];
    memoryAuditLogs[id].push({
      id: `audit_${Date.now()}`,
      conversationId: id,
      action: 'STATUS_CHANGE',
      details: `Status changed to ${status}`,
      actorName: (req as any).user?.name || 'Agent',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function toggleStarHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const conversation = memoryConversations.find((c) => c.id === id);

    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found.' });
      return;
    }

    conversation.isStarred = !conversation.isStarred;
    conversation.updatedAt = new Date().toISOString();

    res.json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function togglePinHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const conversation = memoryConversations.find((c) => c.id === id);

    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found.' });
      return;
    }

    conversation.isPinned = !conversation.isPinned;
    conversation.updatedAt = new Date().toISOString();

    res.json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function markReadStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { isUnread } = req.body;

    const conversation = memoryConversations.find((c) => c.id === id);
    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found.' });
      return;
    }

    conversation.isUnread = Boolean(isUnread);
    conversation.updatedAt = new Date().toISOString();

    res.json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function manualRefreshHandler(req: Request, res: Response): Promise<void> {
  try {
    // Execution of manual refresh requested by user
    res.json({
      success: true,
      message: 'Inbox refreshed successfully via manual trigger.',
      refreshedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

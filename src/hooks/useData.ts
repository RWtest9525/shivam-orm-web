import { useState, useEffect } from 'react';
import { dbEngine } from '@/lib/dbEngine';
import type {
  ClientRow,
  PlatformConnectionRow,
  ReviewRow,
  ReplyTemplateRow,
  DroppedReviewRow,
  SocialMessageRow,
} from '@/lib/dbEngine';

export function useConnections(clientId?: string) {
  const [connections, setConnections] = useState<PlatformConnectionRow[]>([]);

  useEffect(() => {
    setConnections(dbEngine.getConnections(clientId));
    return dbEngine.subscribe(() => {
      setConnections(dbEngine.getConnections(clientId));
    });
  }, [clientId]);

  async function upsertConnection(conn: Partial<PlatformConnectionRow> & { platform: string; account_name: string }) {
    if (!clientId) return;
    return dbEngine.upsertConnection({
      client_id: clientId,
      platform: conn.platform,
      account_name: conn.account_name,
      api_key: conn.api_key || '',
      access_token: conn.access_token || '',
      refresh_token: conn.refresh_token || '',
      status: conn.status || 'connected',
      last_synced_at: conn.last_synced_at || new Date().toISOString(),
      api_mode: conn.api_mode || 'reviews_world_scraper',
      reply_enabled: conn.reply_enabled ?? true,
      dropped_review_tracking: conn.dropped_review_tracking ?? true,
      app_package_name: conn.app_package_name || '',
      id: conn.id,
    });
  }

  async function deleteConnection(id: string) {
    return dbEngine.deleteConnection(id);
  }

  return { connections, upsertConnection, deleteConnection };
}

export function useReviews(clientId?: string, platform?: string) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setReviews(dbEngine.getReviews(clientId, platform));
    return dbEngine.subscribe(() => {
      setReviews(dbEngine.getReviews(clientId, platform));
    });
  }, [clientId, platform]);

  async function replyToReview(reviewId: string, replyText: string) {
    return dbEngine.replyToReview(reviewId, replyText);
  }

  async function updateReviewStatus(reviewId: string, status: 'new' | 'replied' | 'escalated' | 'flagged') {
    return dbEngine.updateReviewStatus(reviewId, status);
  }

  return { reviews, loading, replyToReview, updateReviewStatus };
}

export function useDroppedReviews(clientId?: string) {
  const [droppedReviews, setDroppedReviews] = useState<DroppedReviewRow[]>([]);

  useEffect(() => {
    setDroppedReviews(dbEngine.getDroppedReviews(clientId));
    return dbEngine.subscribe(() => {
      setDroppedReviews(dbEngine.getDroppedReviews(clientId));
    });
  }, [clientId]);

  return { droppedReviews };
}

export function useSocialMessages(clientId?: string) {
  const [messages, setMessages] = useState<SocialMessageRow[]>([]);

  useEffect(() => {
    setMessages(dbEngine.getSocialMessages(clientId));
    return dbEngine.subscribe(() => {
      setMessages(dbEngine.getSocialMessages(clientId));
    });
  }, [clientId]);

  async function replyToSocialMessage(messageId: string, replyText: string) {
    return dbEngine.replyToSocialMessage(messageId, replyText);
  }

  return { messages, replyToSocialMessage };
}

export function useReplyTemplates(clientId?: string) {
  const [templates, setTemplates] = useState<ReplyTemplateRow[]>([]);

  useEffect(() => {
    setTemplates(dbEngine.getTemplates(clientId));
    return dbEngine.subscribe(() => {
      setTemplates(dbEngine.getTemplates(clientId));
    });
  }, [clientId]);

  async function addTemplate(title: string, body: string, sentiment?: 'positive' | 'neutral' | 'negative' | 'crisis' | null) {
    if (!clientId) return;
    return dbEngine.addTemplate(clientId, title, body, sentiment);
  }

  async function deleteTemplate(id: string) {
    return dbEngine.deleteTemplate(id);
  }

  return { templates, addTemplate, deleteTemplate };
}

export function useAllClients(isSuperAdmin: boolean) {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    setLoading(true);
    setClients(dbEngine.getClients());
    setLoading(false);
    return dbEngine.subscribe(() => {
      setClients(dbEngine.getClients());
    });
  }, [isSuperAdmin]);

  async function addClient(clientData: {
    email: string;
    company_name: string;
    contact_person: string;
    phone: string;
    plan: string;
    password?: string;
    app_package_name?: string;
    app_name?: string;
    app_icon_url?: string;
    app_play_link?: string;
  }) {
    return dbEngine.addClient({
      ...clientData,
      plan: clientData.plan as any,
      status: 'active',
      is_super_admin: false,
      auth_user_id: `user-${Date.now()}`,
    });
  }

  async function updateClientDetails(id: string, updates: Partial<ClientRow>) {
    return dbEngine.updateClientDetails(id, updates);
  }

  async function deleteClient(id: string) {
    return dbEngine.deleteClient(id);
  }

  return { clients, loading, addClient, updateClientDetails, deleteClient };
}

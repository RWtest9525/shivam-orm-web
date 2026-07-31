import { useState, useEffect } from 'react';
import { dbEngine } from '@/lib/dbEngine';
import type {
  ClientRow,
  PlatformConnectionRow,
  ReviewRow,
  ReplyTemplateRow,
  DroppedReviewRow,
  SocialMessageRow,
  WorkerRow,
} from '@/lib/dbEngine';

export function useConnections(clientId?: string) {
  const [connections, setConnections] = useState<PlatformConnectionRow[]>([]);

  useEffect(() => {
    setConnections(dbEngine.getConnections(clientId));
    return dbEngine.subscribe(() => {
      setConnections(dbEngine.getConnections(clientId));
    });
  }, [clientId]);

  async function upsertConnection(conn: Omit<PlatformConnectionRow, 'id' | 'created_at'> & { id?: string }) {
    if (!clientId) return;
    return dbEngine.upsertConnection({ ...conn, client_id: clientId });
  }

  async function deleteConnection(id: string) {
    return dbEngine.deleteConnection(id);
  }

  return { connections, upsertConnection, deleteConnection };
}

export function useReviews(clientId?: string, platform?: string) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);

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

  return { reviews, replyToReview, updateReviewStatus };
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

  async function addClient(email: string, company: string, contact: string, phone: string, plan: string) {
    return dbEngine.addClient({
      email,
      company_name: company,
      contact_person: contact,
      phone,
      plan: plan as any,
      status: 'active',
      is_super_admin: false,
      auth_user_id: `user-${Date.now()}`,
    });
  }

  async function updateClientStatus(id: string, status: 'active' | 'suspended' | 'pending') {
    return dbEngine.updateClientStatus(id, status);
  }

  async function updateClientPlan(id: string, plan: 'trial' | 'starter' | 'pro' | 'enterprise') {
    return dbEngine.updateClientPlan(id, plan);
  }

  return { clients, loading, addClient, updateClientStatus, updateClientPlan };
}

export function useWorkers() {
  const [workers, setWorkers] = useState<WorkerRow[]>([]);

  useEffect(() => {
    setWorkers(dbEngine.getWorkers());
    return dbEngine.subscribe(() => {
      setWorkers(dbEngine.getWorkers());
    });
  }, []);

  async function addWorker(name: string, email: string, assignedClientIds: string[]) {
    return dbEngine.addWorker(name, email, assignedClientIds);
  }

  return { workers, addWorker };
}

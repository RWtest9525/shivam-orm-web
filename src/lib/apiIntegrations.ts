import { apiClient } from './api';
import type { PlatformConnectionExtended, ConnectionHistoryItem } from '@/types';

export async function fetchOAuthUrl(platform: string): Promise<{ authUrl: string; state: string }> {
  try {
    const response = await apiClient.get('/integrations/oauth-url', {
      params: { platform },
    });
    if (response.data?.success) {
      return response.data.data;
    }
    throw new Error(response.data?.error || 'Failed to fetch OAuth authorization URL.');
  } catch (error: any) {
    console.warn('[apiIntegrations] API fetch OAuth URL failed, generating fallback auth URL:', error.message);
    const mockState = `state_mock_${Date.now()}`;
    return {
      authUrl: `http://localhost:5000/api/v1/integrations/oauth-callback?code=mock_code_${platform}_${Date.now()}&state=${mockState}`,
      state: mockState,
    };
  }
}

export async function fetchCompanyConnections(): Promise<PlatformConnectionExtended[]> {
  try {
    const response = await apiClient.get('/integrations/connections');
    if (response.data?.success) {
      return response.data.data.map((c: any) => ({
        id: c.id,
        client_id: c.companyId,
        platform: c.platform.toLowerCase(),
        account_name: c.accountName,
        business_name: c.businessName,
        page_name: c.pageName,
        external_account_id: c.externalAccountId,
        status: c.status.toLowerCase(),
        health_status: c.healthStatus.toLowerCase(),
        connected_at: c.connectedAt,
        last_synced_at: c.lastSyncedAt,
        token_expires_at: c.tokenExpiresAt,
        avatar_url: c.avatarUrl,
      }));
    }
    return [];
  } catch (error: any) {
    console.warn('[apiIntegrations] API fetch connections failed:', error.message);
    return [];
  }
}

export async function triggerManualSync(connectionId: string): Promise<{ lastSyncedAt: string; result: any }> {
  try {
    const response = await apiClient.post(`/integrations/connections/${connectionId}/sync`);
    if (response.data?.success) {
      return {
        lastSyncedAt: response.data.data.lastSyncedAt,
        result: response.data.data.result,
      };
    }
    throw new Error(response.data?.error || 'Manual sync failed.');
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Manual sync request failed.');
  }
}

export async function disconnectAccountApi(connectionId: string): Promise<boolean> {
  try {
    const response = await apiClient.post(`/integrations/connections/${connectionId}/disconnect`);
    return !!response.data?.success;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to disconnect account.');
  }
}

export async function reconnectAccountApi(connectionId: string): Promise<string> {
  try {
    const response = await apiClient.post(`/integrations/connections/${connectionId}/reconnect`);
    if (response.data?.success) {
      return response.data.data.authUrl;
    }
    throw new Error(response.data?.error || 'Failed to generate reconnect URL.');
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Reconnect request failed.');
  }
}

export async function fetchConnectionHistoryApi(connectionId: string): Promise<ConnectionHistoryItem[]> {
  try {
    const response = await apiClient.get(`/integrations/connections/${connectionId}/history`);
    if (response.data?.success) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.warn('[apiIntegrations] API history fetch failed:', error.message);
    return [];
  }
}

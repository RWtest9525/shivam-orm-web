import { Request, Response } from 'express';
import { OAuthService, SupportedPlatform } from '../services/oauth.service.js';
import { OAuthStateService } from '../services/oauthState.service.js';
import { encryptToken } from '../services/crypto.service.js';

// In-memory store fallback for social accounts & history logs when Prisma DB is operating in sandbox mode
const memorySocialAccounts: any[] = [];
const memoryConnectionHistory: any[] = [];

export async function getOAuthUrlHandler(req: Request, res: Response): Promise<void> {
  try {
    const platform = (req.query.platform as string)?.toUpperCase() as SupportedPlatform;
    const companyId = (req as any).user?.companyId || 'c-client-demo';

    if (!platform) {
      res.status(400).json({ success: false, error: 'Platform query parameter is required.' });
      return;
    }

    const state = OAuthStateService.generateState(companyId, platform);
    const authUrl = OAuthService.getAuthUrl(platform, state);

    res.json({
      success: true,
      data: {
        platform,
        authUrl,
        state,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function oauthCallbackHandler(req: Request, res: Response): Promise<void> {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      res.redirect(`http://localhost:5173/app/settings?error=${encodeURIComponent(String(oauthError))}`);
      return;
    }

    if (!code || !state) {
      res.redirect('http://localhost:5173/app/settings?error=Missing+code+or+state+in+OAuth+callback');
      return;
    }

    // Validate state token signature and timestamp to prevent CSRF
    const stateCheck = OAuthStateService.validateState(String(state));
    if (!stateCheck.isValid || !stateCheck.payload) {
      res.redirect(`http://localhost:5173/app/settings?error=${encodeURIComponent(stateCheck.error || 'Invalid state parameter')}`);
      return;
    }

    const { companyId, platform } = stateCheck.payload;
    const targetPlatform = platform as SupportedPlatform;

    // Exchange code for official tokens & account details
    const accountDetails = await OAuthService.handleCallback(targetPlatform, String(code));

    const encryptedAccess = encryptToken(accountDetails.accessToken);
    const encryptedRefresh = encryptToken(accountDetails.refreshToken || '');

    // Duplicate Prevention Check
    const existingIndex = memorySocialAccounts.findIndex(
      (acc) =>
        acc.companyId === companyId &&
        acc.platform === targetPlatform &&
        acc.externalAccountId === accountDetails.externalAccountId
    );

    let accountId: string;
    let isReconnect = false;

    if (existingIndex >= 0) {
      // Account exists — update tokens and status instead of creating duplicate
      isReconnect = true;
      accountId = memorySocialAccounts[existingIndex].id;

      memorySocialAccounts[existingIndex] = {
        ...memorySocialAccounts[existingIndex],
        accountName: accountDetails.accountName,
        businessName: accountDetails.businessName,
        pageName: accountDetails.pageName,
        encryptedAccessToken: encryptedAccess,
        encryptedRefreshToken: encryptedRefresh,
        tokenExpiresAt: accountDetails.tokenExpiresAt,
        status: 'CONNECTED',
        healthStatus: 'HEALTHY',
        errorMessage: null,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // New Connection
      accountId = `sa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newAccount = {
        id: accountId,
        companyId,
        platform: targetPlatform,
        accountName: accountDetails.accountName,
        businessName: accountDetails.businessName,
        pageName: accountDetails.pageName,
        externalAccountId: accountDetails.externalAccountId,
        encryptedAccessToken: encryptedAccess,
        encryptedRefreshToken: encryptedRefresh,
        tokenExpiresAt: accountDetails.tokenExpiresAt,
        status: 'CONNECTED',
        healthStatus: 'HEALTHY',
        scopes: accountDetails.scopes,
        avatarUrl: accountDetails.avatarUrl,
        lastSyncedAt: null, // Null until manual "Sync Now"
        connectedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memorySocialAccounts.push(newAccount);
    }

    // Add Audit Log Entry in ConnectionHistory
    memoryConnectionHistory.push({
      id: `ch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      socialAccountId: accountId,
      companyId,
      event: isReconnect ? 'RECONNECTED' : 'CONNECTED',
      status: 'SUCCESS',
      details: `${targetPlatform} account (${accountDetails.accountName}) ${
        isReconnect ? 're-authorized and reconnected' : 'connected successfully'
      }.`,
      triggeredBy: (req as any).user?.name || 'Authorized User',
      createdAt: new Date().toISOString(),
    });

    // Redirect user back to settings or platform page with success parameters
    const redirectUrl = `http://localhost:5173/app/settings?status=success&platform=${targetPlatform}&account=${encodeURIComponent(
      accountDetails.accountName
    )}`;
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('[OAuthController] Callback error:', error);
    res.redirect(`http://localhost:5173/app/settings?error=${encodeURIComponent(error.message)}`);
  }
}

export async function listConnectionsHandler(req: Request, res: Response): Promise<void> {
  try {
    const companyId = (req as any).user?.companyId || req.query.companyId || 'c-client-demo';

    const accounts = memorySocialAccounts
      .filter((acc) => acc.companyId === companyId)
      .map((acc) => {
        const computedHealth = OAuthService.computeHealthStatus({
          status: acc.status,
          tokenExpiresAt: acc.tokenExpiresAt,
          errorMessage: acc.errorMessage,
        });

        return {
          id: acc.id,
          companyId: acc.companyId,
          platform: acc.platform,
          accountName: acc.accountName,
          businessName: acc.businessName,
          pageName: acc.pageName,
          externalAccountId: acc.externalAccountId,
          status: acc.status,
          healthStatus: computedHealth,
          connectedAt: acc.connectedAt,
          lastSyncedAt: acc.lastSyncedAt,
          tokenExpiresAt: acc.tokenExpiresAt,
          avatarUrl: acc.avatarUrl,
        };
      });

    res.json({ success: true, data: accounts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function syncConnectionNowHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const account = memorySocialAccounts.find((acc) => acc.id === id);

    if (!account) {
      res.status(404).json({ success: false, error: 'Connected account not found.' });
      return;
    }

    if (account.status === 'DISCONNECTED') {
      res.status(400).json({ success: false, error: 'Cannot sync a disconnected account. Please reconnect first.' });
      return;
    }

    // Execute Manual Sync ("Sync Now")
    const syncResult = await OAuthService.syncAccountNow(
      account.platform,
      account.encryptedAccessToken,
      account.externalAccountId
    );

    // Update lastSyncedAt
    account.lastSyncedAt = syncResult.syncedAt.toISOString();
    account.updatedAt = new Date().toISOString();

    // Log History Event
    memoryConnectionHistory.push({
      id: `ch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      socialAccountId: account.id,
      companyId: account.companyId,
      event: 'MANUAL_SYNC',
      status: 'SUCCESS',
      details: syncResult.details,
      triggeredBy: (req as any).user?.name || 'User Click (Sync Now)',
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
        lastSyncedAt: account.lastSyncedAt,
        result: syncResult,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function disconnectConnectionHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const account = memorySocialAccounts.find((acc) => acc.id === id);

    if (!account) {
      res.status(404).json({ success: false, error: 'Connected account not found.' });
      return;
    }

    account.status = 'DISCONNECTED';
    account.healthStatus = 'DISCONNECTED';
    account.encryptedAccessToken = '';
    account.encryptedRefreshToken = '';
    account.updatedAt = new Date().toISOString();

    memoryConnectionHistory.push({
      id: `ch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      socialAccountId: account.id,
      companyId: account.companyId,
      event: 'DISCONNECTED',
      status: 'SUCCESS',
      details: `Account ${account.accountName} disconnected by user. Tokens revoked.`,
      triggeredBy: (req as any).user?.name || 'User Action',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Account disconnected successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function reconnectConnectionHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const account = memorySocialAccounts.find((acc) => acc.id === id);

    if (!account) {
      res.status(404).json({ success: false, error: 'Connected account not found.' });
      return;
    }

    const state = OAuthStateService.generateState(account.companyId, account.platform);
    const authUrl = OAuthService.getAuthUrl(account.platform, state);

    res.json({
      success: true,
      data: {
        id: account.id,
        platform: account.platform,
        authUrl,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getConnectionHistoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const history = memoryConnectionHistory
      .filter((h) => h.socialAccountId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

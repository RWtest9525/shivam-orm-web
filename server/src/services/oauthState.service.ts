import crypto from 'crypto';

const STATE_SECRET = process.env.JWT_SECRET || 'equinox_pulse_state_secret_key_2026';
const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export interface OAuthStatePayload {
  companyId: string;
  platform: string;
  nonce: string;
  timestamp: number;
}

export class OAuthStateService {
  /**
   * Generates a tamper-proof HMAC-signed state string for OAuth 2.0 flow.
   */
  public static generateState(companyId: string, platform: string): string {
    const payload: OAuthStatePayload = {
      companyId,
      platform,
      nonce: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
    };

    const serialized = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', STATE_SECRET)
      .update(serialized)
      .digest('base64url');

    return `${serialized}.${signature}`;
  }

  /**
   * Validates state signature, checks timestamp expiration, and extracts payload.
   */
  public static validateState(state: string): { isValid: boolean; payload?: OAuthStatePayload; error?: string } {
    if (!state || !state.includes('.')) {
      return { isValid: false, error: 'Invalid or missing OAuth state parameter format.' };
    }

    const [serialized, signature] = state.split('.');

    const expectedSignature = crypto
      .createHmac('sha256', STATE_SECRET)
      .update(serialized)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return { isValid: false, error: 'OAuth state signature verification failed (possible CSRF attack).' };
    }

    try {
      const decodedJson = Buffer.from(serialized, 'base64url').toString('utf8');
      const payload: OAuthStatePayload = JSON.parse(decodedJson);

      const elapsed = Date.now() - payload.timestamp;
      if (elapsed > STATE_EXPIRY_MS) {
        return { isValid: false, error: 'OAuth state session expired (timeout exceeded 10 minutes).' };
      }

      return { isValid: true, payload };
    } catch (e) {
      return { isValid: false, error: 'Failed to parse OAuth state payload.' };
    }
  }
}

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const SECRET_KEY = process.env.ENCRYPTION_SECRET 
  ? crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'equinox_salt_2026', 32)
  : crypto.scryptSync('equinox_pulse_master_oauth_secret_key_2026', 'equinox_salt_2026', 32);

/**
 * Encrypts OAuth access token or refresh token using AES-256-GCM.
 * Output format: <hex_iv>:<hex_tag>:<hex_encrypted>
 */
export function encryptToken(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted OAuth token string.
 */
export function decryptToken(encryptedText: string): string {
  if (!encryptedText) return '';
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      // Fallback if token was stored plain in legacy
      return encryptedText;
    }
    
    const [ivHex, tagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[CryptoService] Decryption failed:', error);
    return '';
  }
}

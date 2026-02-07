import { sha256 } from 'js-sha256';

/**
 * Generate a secure API key with gr_live_ prefix
 */
export function generateApiKey(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  return `gr_live_${hex}`;
}

/**
 * Hash an API key for secure storage (never store plain keys)
 */
export function hashApiKey(apiKey: string): string {
  return sha256(apiKey);
}

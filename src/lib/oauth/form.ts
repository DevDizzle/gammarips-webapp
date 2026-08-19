/** Body parsing for the token / revoke endpoints: form-encoded per RFC 6749, JSON tolerated. */
import type { NextRequest } from 'next/server';
import { OAuthError } from './errors';

const MAX_BODY = 16 * 1024;

export async function parseForm(req: NextRequest): Promise<URLSearchParams> {
  const text = await req.text();
  if (text.length > MAX_BODY) throw new OAuthError('invalid_request', 'Request body is too large.');
  const ctype = (req.headers.get('content-type') || '').toLowerCase();
  if (ctype.includes('application/json')) {
    let obj: unknown;
    try {
      obj = JSON.parse(text || '{}');
    } catch {
      throw new OAuthError('invalid_request', 'Body is not valid JSON.');
    }
    const form = new URLSearchParams();
    if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (typeof v === 'string') form.set(k, v);
      }
    }
    return form;
  }
  return new URLSearchParams(text);
}

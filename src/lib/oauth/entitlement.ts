/**
 * Tier for a token: the SAME paid-entitlement check that gates API-key
 * issuance (`isUserMcpEntitledAdmin`). A token for a non-subscriber is still
 * issued — it works on the free tools and the MCP's denial envelope tells the
 * agent how to upgrade — but it carries `tier: "free"`, which the MCP treats
 * exactly like an anonymous caller (fail-closed on privilege).
 */
import { getUserAdmin, isUserMcpEntitledAdmin } from '../firebase-admin';

export type Tier = 'pro' | 'free';

export async function tierForUid(uid: string): Promise<Tier> {
  const user = await getUserAdmin(uid);
  if (!user) return 'free';
  return isUserMcpEntitledAdmin(user) ? 'pro' : 'free';
}

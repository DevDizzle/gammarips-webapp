import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import {
  getAdminApp,
  getOrCreateUserAdmin,
  isUserMcpEntitledAdmin,
  provisionMcpKeyAdmin,
  getMcpKeyMetaAdmin,
  revokeMcpKeysForUserAdmin,
} from '@/lib/firebase-admin';

async function verifyBearerUid(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.split('Bearer ')[1];
  const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
  return decoded.uid;
}

export async function GET(req: NextRequest) {
  try {
    const uid = await verifyBearerUid(req);
    const status = await getMcpKeyMetaAdmin(uid);
    return NextResponse.json(status);
  } catch (err: any) {
    const status = err?.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: err?.message || 'Failed to read key status' }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyBearerUid(req);
    const user = await getOrCreateUserAdmin(uid);
    if (!isUserMcpEntitledAdmin(user)) {
      return NextResponse.json(
        { error: 'An active GammaRips subscription is required to generate an API key.' },
        { status: 403 }
      );
    }
    const { rawKey, keyPrefix, createdAtISO } = await provisionMcpKeyAdmin(uid);
    return NextResponse.json({ key: rawKey, keyPrefix, createdAtISO });
  } catch (err: any) {
    const status = err?.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: err?.message || 'Could not generate key' }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const uid = await verifyBearerUid(req);
    const revoked = await revokeMcpKeysForUserAdmin(uid, 'user_revoked');
    return NextResponse.json({ revoked });
  } catch (err: any) {
    const status = err?.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: err?.message || 'Could not revoke key' }, { status });
  }
}

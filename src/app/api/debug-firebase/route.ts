import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const result = await db.collection('daily_reports').limit(1).get();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Firestore via Admin SDK.',
      reportsFound: result.size,
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'undefined',
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to Firestore.',
      error: error.message,
      stack: error.stack,
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'undefined',
      nodeEnv: process.env.NODE_ENV,
    }, { status: 500 });
  }
}

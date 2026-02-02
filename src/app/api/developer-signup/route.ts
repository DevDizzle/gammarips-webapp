import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already done
if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, agentName, useCase } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    
    // Check if email already exists
    const existingSignup = await db
      .collection('developer_signups')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (!existingSignup.empty) {
      return NextResponse.json(
        { 
          message: "You're already signed up! Check your email or start using the MCP endpoint.",
          alreadyExists: true 
        },
        { status: 200 }
      );
    }

    // Generate a simple API key (for tracking, not auth yet)
    const apiKey = `gr_${generateApiKey()}`;
    
    // Calculate trial end date (14 days from now)
    const trialStartDate = new Date();
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    // Save to Firestore
    const signupData = {
      email: email.toLowerCase(),
      agentName: agentName || null,
      useCase: useCase || null,
      apiKey,
      trialStartDate: trialStartDate.toISOString(),
      trialEndDate: trialEndDate.toISOString(),
      status: 'trial',
      createdAt: new Date().toISOString(),
      source: 'developers_page',
      callCount: 0,
      lastCallAt: null,
    };

    await db.collection('developer_signups').add(signupData);

    // TODO: Send welcome email with API key
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: `Welcome aboard! Your 14-day trial starts now. Trial ends ${trialEndDate.toLocaleDateString()}.`,
      apiKey,
      trialEndDate: trialEndDate.toISOString(),
      mcpEndpoint: 'https://profitscout-mcp-469352939749.us-central1.run.app/sse',
    });

  } catch (error) {
    console.error('Developer signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process signup. Please try again.' },
      { status: 500 }
    );
  }
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore, Timestamp } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
config();

let adminApp: AdminApp;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.warn('Firebase server environment variables are not set. Skipping migration.');
  process.exit(0);
}

const serviceAccount: ServiceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

if (!getAdminApps().length) {
  adminApp = initializeAdminApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  adminApp = getAdminApps()[0]!;
}

const adminDb = getAdminFirestore(adminApp);

async function migrateBlogPosts() {
  console.log('Starting blog post migration from Firestore to MDX...');

  const blogPostsRef = adminDb.collection('blogPosts');
  const snapshot = await blogPostsRef.get();

  if (snapshot.empty) {
    console.log('No blog posts found in Firestore.');
    return;
  }

  const outputDir = path.join(process.cwd(), 'src/content/blog');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const slug = doc.id;
    
    // Handle timestamp conversion
    let publishDate = new Date().toISOString().split('T')[0]; // Default to today YYYY-MM-DD
    if (data.publishedAt) {
        if (data.publishedAt instanceof Timestamp) {
            publishDate = data.publishedAt.toDate().toISOString().split('T')[0];
        } else if (typeof data.publishedAt === 'string') {
            publishDate = new Date(data.publishedAt).toISOString().split('T')[0];
        }
    }

    const title = data.title || 'Untitled';
    const description = data.excerpt || '';
    const author = data.author || 'GammaMolt';
    const tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : '[]';
    const image = data.ogImage || '';
    const content = data.content || '';

    const mdxContent = `---
title: "${title.replace(/"/g, '"')}"
description: "${description.replace(/"/g, '"')}"
publishDate: "${publishDate}"
author: "${author.replace(/"/g, '"')}"
image: "${image}"
tags: ${tags}
---

${content}
`;

    const filePath = path.join(outputDir, `${slug}.mdx`);
    fs.writeFileSync(filePath, mdxContent);
    console.log(`Migrated: ${slug}.mdx`);
    count++;
  }

  console.log(`Successfully migrated ${count} blog posts.`);
}

migrateBlogPosts().catch(console.error);

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey })
    });
}

const db = admin.firestore();

async function run() {
    const reportsQuery = await db.collection('daily_reports').where('seoMetadata', '!=', null).limit(2).get();
    
    const samples = [];
    
    reportsQuery.forEach(doc => {
        const report = doc.data();
        const articleSchema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": report.seoMetadata?.seoTitle || `GammaRips Overnight Report`,
            "datePublished": report.scan_date,
            "dateModified": report.scan_date,
            "author": {
              "@type": "Organization",
              "name": "GammaRips",
              "url": "https://gammarips.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "GammaRips",
              "logo": { "@type": "ImageObject", "url": "https://gammarips.com/og-image.png?v=2" }
            },
            "description": report.seoMetadata?.seoDescription,
            ...(report.seoMetadata?.keywords ? { "keywords": report.seoMetadata.keywords.join(', ') } : {}),
            "mainEntityOfPage": `https://gammarips.com/reports/${report.scan_date}`
        };
        samples.push({ reportDate: doc.id, GeneratedJSON_LD: articleSchema });
    });
    
    console.log(JSON.stringify(samples, null, 2));
}

run().catch(console.error);

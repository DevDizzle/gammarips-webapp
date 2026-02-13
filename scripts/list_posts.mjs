import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault(), projectId: 'profitscout-fida8' });
const db = getFirestore();

const snapshot = await db.collection('blogPosts').get();
console.log(`\n📝 ${snapshot.size} blog posts in Firestore:\n`);
snapshot.forEach(doc => {
  const d = doc.data();
  console.log(`- ${d.title}`);
  console.log(`  slug: ${d.slug}`);
  console.log(`  tags: ${d.tags.join(', ')}\n`);
});

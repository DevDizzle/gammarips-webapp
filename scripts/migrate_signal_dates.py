import os
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin
if not firebase_admin._apps:
    # Use application default credentials or GOOGLE_APPLICATION_CREDENTIALS
    # Note: running this locally might require setting GOOGLE_APPLICATION_CREDENTIALS
    # Or we can just use the same env vars we use in JS
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
        "private_key": os.environ.get("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
        "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
        "token_uri": "https://oauth2.googleapis.com/token",
    })
    firebase_admin.initialize_app(cred)

db = firestore.client()

def migrate_signals():
    print("Starting migration...")
    collection_ref = db.collection('overnight_signals')
    
    # We want docs with scan_date == '2026-03-06'
    query = collection_ref.where('scan_date', '==', '2026-03-06')
    docs = query.stream()
    
    batch = db.batch()
    batch_count = 0
    total_migrated = 0
    
    # cutoff date for enriched_at
    cutoff = datetime(2026, 3, 9, tzinfo=timezone.utc)
    
    for doc in docs:
        data = doc.to_dict()
        enriched_at = data.get('enriched_at')
        
        # Check if enriched_at exists and is on or after 2026-03-09
        if enriched_at and enriched_at >= cutoff:
            ticker = data.get('ticker')
            if not ticker:
                continue
                
            new_id = f"2026-03-09_{ticker}"
            new_doc_ref = collection_ref.document(new_id)
            
            # Update data
            new_data = data.copy()
            new_data['scan_date'] = '2026-03-09'
            new_data['underlying_scan_date'] = '2026-03-06'
            
            # Set new doc and delete old doc
            batch.set(new_doc_ref, new_data)
            batch.delete(doc.reference)
            
            batch_count += 2  # one set, one delete
            total_migrated += 1
            
            if batch_count >= 400:
                print(f"Committing batch of {batch_count} operations...")
                batch.commit()
                batch = db.batch()
                batch_count = 0
                
    if batch_count > 0:
        print(f"Committing final batch of {batch_count} operations...")
        batch.commit()
        
    print(f"Migration complete. Total signals migrated: {total_migrated}")

if __name__ == '__main__':
    migrate_signals()
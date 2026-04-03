import os
import firebase_admin
from firebase_admin import credentials, firestore

# Firestore instances
firestore_db = None
db = None

def init_firebase(app):
    global firestore_db, db
    try:
        # Check if already initialized
        if not firebase_admin._apps:
            service_account_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT') or 'firebase-key.json'
            
            if os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
            else:
                # Try default credentials (ADC)
                try:
                    firebase_admin.initialize_app()
                except Exception as e:
                    print(f"ERROR: Could not initialize Firebase Admin SDK: {e}")
                    print("="*60)
                    print("CRITICAL: 'firebase-key.json' NOT FOUND.")
                    print("Please place your Service Account key in the root folder.")
                    print("Firestore database is MANDATORY for this application.")
                    print("="*60)
                    return

        firestore_db = firestore.client()
        db = firestore_db # Alias for easy importing
        print("✓ Firebase Firestore connected successfully!")
        
    except Exception as e:
        print(f"Error initializing Firebase: {e}")

# Export functions for easier access
def get_firestore():
    global db
    if db is None:
        # This will be called but won't have current_app in migrations/scripts
        # So we use a basic fallback or it will fail
        try:
            from flask import current_app
            init_firebase(current_app)
        except Exception:
            # Migration script case
            init_firebase(None)
    return db

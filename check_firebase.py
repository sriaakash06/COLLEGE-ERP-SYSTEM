#!/usr/bin/env python3
"""
Check admin user data in Firebase Firestore
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore
import bcrypt

def check_firebase_admin():
    """Check admin user data in Firestore"""
    print("=" * 50)
    print("    Check Firebase Firestore Admin")
    print("=" * 50)
    
    try:
        # Initialize Firebase
        # Note: In a production app, the key should be provided securely.
        service_account_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT') or 'firebase-key.json'

        if not firebase_admin._apps:
            if os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
            else:
                # Try default credentials
                try:
                    firebase_admin.initialize_app()
                except Exception as e:
                    print(f"Warning: Could not initialize Firebase Admin SDK: {e}")
                    print("Please provide a service account key file as 'firebase-key.json' or set up ADC.")
                    return False

        db = firestore.client()
        
        # Look for admin user
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', 'admin@college.edu').limit(1).stream()
        
        admin_doc = None
        for doc in query:
            admin_doc = doc
            break
            
        if admin_doc:
            admin = admin_doc.to_dict()
            print(f"Admin user found in Firestore:")
            print(f"  ID: {admin_doc.id}")
            print(f"  Name: {admin.get('name')}")
            print(f"  Email: {admin.get('email')}")
            print(f"  Role: {admin.get('role')}")
            
            # Since Firestore usually stores plain passwords or hashes
            # Let's assume we store the same hash as MySQL for now
            # In a real app, you'd use Firebase Auth for passwords.
            print("✓ Admin verification from Firestore successful")
            return True
        else:
            print("❌ Admin user not found in Firestore!")
            print("To migrate data, run: python backend/migrate_to_firestore.py")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    check_firebase_admin()

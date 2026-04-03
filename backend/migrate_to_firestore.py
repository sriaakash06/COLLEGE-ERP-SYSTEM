import os
import firebase_admin
from firebase_admin import credentials, firestore
import mysql.connector
from config import Config
import datetime

# Initialize Firebase
service_account_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT') or 'firebase-key.json'

if not firebase_admin._apps:
    if os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
    else:
        try:
            firebase_admin.initialize_app()
        except Exception as e:
            print(f"Warning: Could not initialize Firebase Admin SDK: {e}")
            sys.exit(1)

db = firestore.client()

def get_mysql_connection():
    return mysql.connector.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB
    )

def migrate_collection(table_name, collection_name, date_fields=[]):
    print(f" migrating {table_name} -> {collection_name}...")
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        
        batch = db.batch()
        count = 0
        
        for row in rows:
            doc_id = str(row.get('id'))
            data = {}
            for k, v in row.items():
                if k == 'id': continue
                
                # Handle dates
                if k in date_fields and v:
                    if isinstance(v, (datetime.date, datetime.datetime)):
                        data[k] = datetime.datetime.combine(v, datetime.time.min) if isinstance(v, datetime.date) else v
                    else:
                        data[k] = v
                else:
                    data[k] = str(v) if isinstance(v, (bytes, bytearray)) else v
            
            doc_ref = db.collection(collection_name).document(doc_id)
            batch.set(doc_ref, data)
            count += 1
            
            if count % 400 == 0:
                batch.commit()
                batch = db.batch()
        
        batch.commit()
        cursor.close()
        conn.close()
        print(f"✓ Migrated {count} records from {table_name}")
    except Exception as e:
        print(f"✘ Error migrating {table_name}: {e}")

if __name__ == "__main__":
    print("--- Starting Full ERP Migration to Firestore ---")
    
    # 1. Users (Auth)
    migrate_collection('users', 'users')
    
    # 2. Students
    migrate_collection('students', 'students', date_fields=['admission_date', 'dob'])
    
    # 3. Faculty/Staff
    migrate_collection('staff', 'staff', date_fields=['joining_date'])
    
    # 4. Academic Structure
    migrate_collection('departments', 'departments')
    migrate_collection('courses', 'courses')
    migrate_collection('subjects', 'subjects')
    migrate_collection('timetable', 'timetable')
    
    # 5. Operations
    migrate_collection('notices', 'notices', date_fields=['posted_date', 'expiry_date'])
    migrate_collection('attendance', 'attendance', date_fields=['date'])
    migrate_collection('examinations', 'examinations', date_fields=['exam_date'])
    migrate_collection('exam_results', 'exam_results')
    
    # 6. Facilities & Finance
    migrate_collection('hostels', 'hostels')
    migrate_collection('hostel_allocations', 'hostel_allocations', date_fields=['allocation_date'])
    migrate_collection('fees', 'fees', date_fields=['due_date', 'paid_date'])
    migrate_collection('library_books', 'library_books')
    migrate_collection('library_issues', 'library_issues', date_fields=['issue_date', 'return_date', 'due_date'])
    
    print("\n--- All migrations attempted ---")
    print("Note: Check Firestore Console to verify data distribution.")

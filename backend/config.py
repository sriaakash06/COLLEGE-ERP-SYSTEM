import os

class Config:
    # Firebase configuration
    FIREBASE_SERVICE_ACCOUNT = os.environ.get('FIREBASE_SERVICE_ACCOUNT', 'firebase-key.json')
    
    # App configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'erp_secret_key_change_in_production')
    
    # Session and security
    SESSION_TYPE = 'filesystem'
    PERMANENT_SESSION_LIFETIME = 3600 # 1 hour

# Firebase Integration Walkthrough

I've set up the foundations for migrating your **College ERP System** to Firebase. Below are the steps to finalize the setup and verify the data.

## 1. Setup Firebase Credentials

Before running the system, you need to provide your Firebase Service Account key:

1. Go to the [Firebase Console](https://console.firebase.google.com/).

2. Select your project: `college-erp-ak-1234567890` (or your existing one).
3. Go to **Project Settings** > **Service Accounts**.
4. Click **Generate new private key** and download the JSON file.
5. Rename the file to `firebase-key.json` and place it in the root directory of your project.

## 2. Install Dependencies

Ensure you have the updated dependencies installed:

```powershell
pip install -r backend/requirements.txt
```

## 3. Migrate Data

I've created a migration script to copy your user data from MySQL to Firestore. This is a great way to "check" the system's transition:

```powershell
python backend/migrate_to_firestore.py
```

## 4. Verify the Integration

Use the newly created verification script to "check" the admin status directly in Firebase:

```powershell
python check_firebase.py
```

## 5. Run the System

Start the ERP system as usual. It now initializes Firebase alongside MySQL:

```powershell
python run.py
```

---

### Key Files Created/Updated

- [backend/db.py](file:///d:/Project-Files/Incomplete/college_management_erp/backend/db.py): Now exports both `mysql` and `firestore_db`.
- [backend/migrate_to_firestore.py](file:///d:/Project-Files/Incomplete/college_management_erp/backend/migrate_to_firestore.py): Script to move data from SQL to Firebase.
- [check_firebase.py](file:///d:/Project-Files/Incomplete/college_management_erp/check_firebase.py): Script to verify Firestore data.
- [backend/app.py](file:///d:/Project-Files/Incomplete/college_management_erp/backend/app.py): Updated to initialize Firebase on startup.

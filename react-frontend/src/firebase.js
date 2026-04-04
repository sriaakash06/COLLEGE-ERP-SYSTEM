import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

// IMPORTANT: Replace the following config with your actual Firebase project configuration
// from the Firebase Console: Project Settings -> General -> Your apps -> Web app.
const firebaseConfig = {
  apiKey: "AIzaSyC7kJ3vZSMc6DVqjunDqjI3-ttkS1e568o",
  authDomain: "college-erp-project-2026-67890.firebaseapp.com",
  projectId: "college-erp-project-2026-67890",
  storageBucket: "college-erp-project-2026-67890.firebasestorage.app",
  messagingSenderId: "436696372190",
  appId: "1:436696372190:web:c982aed59a473e9c32834f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Profile storage helper
export const storeUserProfile = async (user, additionalData = {}) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || 'EduCloud User',
      email: user.email,
      photoURL: user.photoURL || '',
      role: 'Student', // Default role
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      ...additionalData
    });
  } else {
    // Update last login
    await updateDoc(userRef, { lastLogin: serverTimestamp() });
  }
  return userRef;
};

// Google Sign-In helper
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await storeUserProfile(result.user);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

// Email/Password Sign-In helper
export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await storeUserProfile(result.user);
  return result.user;
};

// Sign out helper
export const logout = () => signOut(auth);

export { signInWithEmailAndPassword, createUserWithEmailAndPassword };
export default app;

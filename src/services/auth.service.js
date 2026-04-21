import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from '../utils/constants';

// ============================================================
// GOOGLE AUTHENTICATION FUNCTIONS
// ============================================================

/**
 * Initiates the Google Login flow.
 * Returns { isNewUser: boolean, firebaseUser: Object, userData: Object|null }
 */
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  // Forces the Google account chooser to show every time
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    // Check if a Firestore profile already exists for this Google UID
    const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      // New User: Auth layer is done, but Firestore profile is missing
      return {
        isNewUser: true,
        firebaseUser,
        userData: null,
      };
    }

    // Returning User: Profile is complete
    return {
      isNewUser: false,
      firebaseUser,
      userData: userSnap.data(),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Creates the Firestore document for a user who signed up via Google.
 * Called from CompleteProfile.jsx.
 */
export const createGoogleUserProfile = async ({
  firebaseUser,
  name,
  role,
  city,
  phone,
}) => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);

    await setDoc(userDocRef, {
      uid: firebaseUser.uid,
      name: name.trim(),
      email: firebaseUser.email.toLowerCase().trim(),
      role,
      city,
      phone: phone.trim(),
      photoURL: firebaseUser.photoURL || null,
      createdAt: serverTimestamp(),
    });

    // Sync the display name in Firebase Auth
    await updateProfile(firebaseUser, { displayName: name });

    return userDocRef;
  } catch (error) {
    throw error;
  }
};

// ============================================================
// EMAIL/PASSWORD AUTHENTICATION FUNCTIONS
// ============================================================

export const signupUser = async ({
  email,
  password,
  name,
  role,
  city,
  phone,
}) => {
  let firebaseUser = null;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName: name });

    const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
    await setDoc(userDocRef, {
      uid: firebaseUser.uid,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      city,
      phone: phone.trim(),
      photoURL: null,
      createdAt: serverTimestamp(),
    });

    return firebaseUser;
  } catch (error) {
    // Cleanup if Auth succeeds but Firestore fails
    if (firebaseUser && error.code !== 'auth/email-already-in-use') {
      try {
        await firebaseUser.delete();
      } catch (deleteError) {
        console.error('Failed to clean up orphaned auth account:', deleteError);
      }
    }
    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export const getUserProfile = async (uid) => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return null;
    return userSnap.data();
  } catch (error) {
    throw error;
  }
};

export const getFriendlyAuthError = (error) => {
  const errorMessages = {
    'auth/popup-closed-by-user': 'The login window was closed before finishing.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': "That email address doesn't look right.",
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };

  return errorMessages[error.code] || 'Something went wrong. Please try again.';
};
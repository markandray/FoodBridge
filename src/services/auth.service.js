
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from '../utils/constants';

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
    'auth/email-already-in-use':
      'An account with this email already exists. Try logging in.',
    'auth/invalid-email':
      'That email address doesn\'t look right.',
    'auth/weak-password':
      'Password must be at least 6 characters.',
    'auth/user-not-found':
      'No account found with this email. Sign up instead?',
    'auth/wrong-password':
      'Incorrect password. Please try again.',
    'auth/invalid-credential':
      'Invalid email or password. Please check and try again.',
    'auth/too-many-requests':
      'Too many failed attempts. Please wait a few minutes and try again.',
    'auth/network-request-failed':
      'Network error. Please check your internet connection.',
    'auth/user-disabled':
      'This account has been disabled. Please contact support.',
  };

  return (
    errorMessages[error.code] ||
    'Something went wrong. Please try again.'
  );
};
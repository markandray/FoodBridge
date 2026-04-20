
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS, LISTING_STATUS } from '../utils/constants';


export const subscribeToListings = (filters, callback, onError) => {
  const listingsRef = collection(db, COLLECTIONS.LISTINGS);

  const constraints = [orderBy('createdAt', 'desc')];

  if (filters?.city) {
    constraints.push(where('city', '==', filters.city));
  }

  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }

  if (filters?.restaurantId) {
    constraints.push(where('restaurantId', '==', filters.restaurantId));
  }

  const q = query(listingsRef, ...constraints);

  // onSnapshot returns the unsubscribe function directly
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const listings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(listings);
    },
    (error) => {
      console.error('Listings listener error:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
};

export const subscribeToRestaurantListings = (restaurantId, callback, onError) => {
  const listingsRef = collection(db, COLLECTIONS.LISTINGS);
  const q = query(
    listingsRef,
    where('restaurantId', '==', restaurantId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const listings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(listings);
    },
    (error) => {
      console.error('Restaurant listings listener error:', error);
      if (onError) onError(error);
    }
  );
};

export const createListing = async (listingData) => {
  try {
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);

    // addDoc auto-generates a document ID
    const docRef = await addDoc(listingsRef, {
      ...listingData,
      status: LISTING_STATUS.AVAILABLE,
      claimedBy: null,
      claimedByName: null,
      createdAt: serverTimestamp(),
      expiryTime: Timestamp.fromDate(new Date(listingData.expiryTime)),
      pickupWindowStart: Timestamp.fromDate(new Date(listingData.pickupWindowStart)),
      pickupWindowEnd: Timestamp.fromDate(new Date(listingData.pickupWindowEnd)),
    });

    await updateDoc(docRef, { listingId: docRef.id });

    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateListing = async (listingId, updates) => {
  try {
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    await updateDoc(listingRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteListing = async (listingId) => {
  try {
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    await deleteDoc(listingRef);
  } catch (error) {
    throw error;
  }
};

export const claimListing = async (listingId, ngoUser) => {
  try {
    // Fetch the current listing to verify it's still available
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    const listingSnap = await getDoc(listingRef);

    if (!listingSnap.exists()) {
      throw new Error('Listing no longer exists.');
    }

    const listing = listingSnap.data();

    if (listing.status !== LISTING_STATUS.AVAILABLE) {
      throw new Error(
        `This listing is no longer available — it has been ${listing.status}.`
      );
    }

    // Update listing status to claimed
    await updateDoc(listingRef, {
      status: LISTING_STATUS.CLAIMED,
      claimedBy: ngoUser.uid,
      claimedByName: ngoUser.name,
      claimedAt: serverTimestamp(),
    });

    return listingId;
  } catch (error) {
    throw error;
  }
};

export const completeListing = async (listingId) => {
  try {
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    await updateDoc(listingRef, {
      status: LISTING_STATUS.COMPLETED,
      completedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const expireListing = async (listingId) => {
  try {
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    await updateDoc(listingRef, {
      status: LISTING_STATUS.EXPIRED,
    });
  } catch (error) {
    throw error;
  }
};

export const getListingById = async (listingId) => {
  try {
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    const listingSnap = await getDoc(listingRef);
    if (!listingSnap.exists()) return null;
    return { id: listingSnap.id, ...listingSnap.data() };
  } catch (error) {
    throw error;
  }
};
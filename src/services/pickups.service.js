import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS, PICKUP_STATUS, LISTING_STATUS } from '../utils/constants';

export const createPickup = async (listing, ngoUser) => {
  try {
    const pickupsRef = collection(db, COLLECTIONS.PICKUPS);
    const docRef = await addDoc(pickupsRef, {
      listingId: listing.id,
      restaurantId: listing.restaurantId,
      restaurantName: listing.restaurantName,
      ngoId: ngoUser.uid,
      ngoName: ngoUser.name,
      foodName: listing.foodName,
      quantity: listing.quantity,
      unit: listing.unit,
      city: listing.city,
      claimedAt: serverTimestamp(),
      completedAt: null,
      status: PICKUP_STATUS.CLAIMED,
    });

    // Write the ID back into the document (same pattern as listings)
    await updateDoc(docRef, { pickupId: docRef.id });

    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const subscribeToNgoPickups = (ngoId, callback, onError) => {
  const pickupsRef = collection(db, COLLECTIONS.PICKUPS);
  const q = query(
    pickupsRef,
    where('ngoId', '==', ngoId),
    orderBy('claimedAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const pickups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(pickups);
    },
    (error) => {
      console.error('NGO pickups listener error:', error);
      if (onError) onError(error);
    }
  );
};

export const subscribeToRestaurantPickups = (restaurantId, callback, onError) => {
  const pickupsRef = collection(db, COLLECTIONS.PICKUPS);
  const q = query(
    pickupsRef,
    where('restaurantId', '==', restaurantId),
    orderBy('claimedAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const pickups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(pickups);
    },
    (error) => {
      console.error('Restaurant pickups listener error:', error);
      if (onError) onError(error);
    }
  );
};


export const cancelPickup = async (pickupId, listingId) => {
  try {
    // Update pickup status
    const pickupRef = doc(db, COLLECTIONS.PICKUPS, pickupId);
    await updateDoc(pickupRef, {
      status: PICKUP_STATUS.CANCELLED,
      cancelledAt: serverTimestamp(),
    });

    // Put the listing back to available
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    await updateDoc(listingRef, {
      status: LISTING_STATUS.AVAILABLE,
      claimedBy: null,
      claimedByName: null,
      claimedAt: null,
    });
  } catch (error) {
    throw error;
  }
};

export const completePickup = async (pickupId, listingId) => {
  try {
    const pickupRef = doc(db, COLLECTIONS.PICKUPS, pickupId);
    await updateDoc(pickupRef, {
      status: PICKUP_STATUS.COMPLETED,
      completedAt: serverTimestamp(),
    });

    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    await updateDoc(listingRef, {
      status: LISTING_STATUS.COMPLETED,
      completedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const getPickupByListingId = async (listingId) => {
  try {
    const pickupsRef = collection(db, COLLECTIONS.PICKUPS);
    const q = query(
      pickupsRef,
      where('listingId', '==', listingId),
      where('status', '==', PICKUP_STATUS.CLAIMED)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    throw error;
  }
};


export const completePickupByNgo = async (pickupId, listingId) => {
  try {
    // Mark the pickup as completed
    const pickupRef = doc(db, COLLECTIONS.PICKUPS, pickupId);
    await updateDoc(pickupRef, {
      status: PICKUP_STATUS.COMPLETED,
      completedAt: serverTimestamp(),
      completedBy: 'ngo', // Track who completed it for audit purposes
    });

    // Mark the listing as completed
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    await updateDoc(listingRef, {
      status: LISTING_STATUS.COMPLETED,
      completedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};
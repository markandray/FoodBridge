import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS, KG_TO_MEALS_RATIO } from '../utils/constants';

export const getImpactStats = async (userId) => {
  try {
    const impactRef = doc(db, COLLECTIONS.IMPACT, userId);
    const impactSnap = await getDoc(impactRef);

    if (!impactSnap.exists()) {
      // Return safe defaults — don't create the document yet
      return {
        totalListings: 0,
        totalDonationsKg: 0,
        totalPickups: 0,
        mealsServed: 0,
        completedCount: 0,
      };
    }

    return impactSnap.data();
  } catch (error) {
    throw error;
  }
};

export const initImpactDoc = async (userId) => {
  try {
    const impactRef = doc(db, COLLECTIONS.IMPACT, userId);
    await setDoc(
      impactRef,
      {
        totalListings: 0,
        totalDonationsKg: 0,
        totalPickups: 0,
        mealsServed: 0,
        completedCount: 0,
      },
      { merge: true } // merge:true = don't overwrite if it already exists
    );
  } catch (error) {
    throw error;
  }
};

export const incrementListingCount = async (restaurantId) => {
  try {
    const impactRef = doc(db, COLLECTIONS.IMPACT, restaurantId);
    await updateDoc(impactRef, {
      totalListings: increment(1),
    });
  } catch (error) {
    // Non-critical — don't block the listing creation
    console.error('Failed to update impact stats:', error);
  }
};

export const recordCompletedDonation = async ({
  restaurantId,
  ngoId,
  quantity,
  unit,
}) => {

  const kgDonated = unit === 'kg' ? Number(quantity) : 0;
  const mealsFromThisPickup = Math.floor(kgDonated * KG_TO_MEALS_RATIO);

  try {
    // Update restaurant impact
    const restaurantImpactRef = doc(db, COLLECTIONS.IMPACT, restaurantId);
    await updateDoc(restaurantImpactRef, {
      totalDonationsKg: unit === 'kg' ? increment(Number(quantity)) : increment(0),
      completedCount: increment(1),
      mealsServed: increment(mealsFromThisPickup),
    });
  } catch (error) {
    console.error('Failed to update restaurant impact:', error);
  }

  try {
    // Update NGO impact
    const ngoImpactRef = doc(db, COLLECTIONS.IMPACT, ngoId);
    await updateDoc(ngoImpactRef, {
      totalPickups: increment(1),
      completedCount: increment(1),
      mealsServed: increment(mealsFromThisPickup),
    });
  } catch (error) {
    console.error('Failed to update NGO impact:', error);
  }
};
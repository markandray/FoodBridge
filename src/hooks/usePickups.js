import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToNgoPickups,
  subscribeToRestaurantPickups,
  cancelPickup as cancelPickupService,
  completePickup as completePickupService,
  completePickupByNgo as completePickupByNgoService,
} from '../services/pickups.service';
import { recordCompletedDonation } from '../services/impact.service';
import { ROLES, PICKUP_STATUS } from '../utils/constants';

const usePickups = (userId, role) => {
  const [pickups, setPickups]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!userId || !role) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const subscribeFn =
      role === ROLES.NGO
        ? subscribeToNgoPickups
        : subscribeToRestaurantPickups;

    const unsubscribe = subscribeFn(
      userId,
      (data) => {
        setPickups(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, role]);
  const activePickups = pickups.filter(
    (p) => p.status === PICKUP_STATUS.CLAIMED
  );
  const completedPickups = pickups.filter(
    (p) => p.status === PICKUP_STATUS.COMPLETED
  );
  const cancelledPickups = pickups.filter(
    (p) => p.status === PICKUP_STATUS.CANCELLED
  );

  
  const cancelPickup = useCallback(async (pickupId, listingId) => {
    try {
      await cancelPickupService(pickupId, listingId);
    } catch (error) {
      throw error;
    }
  }, []);

  
  const completePickup = useCallback(async (pickupId, listingId) => {
    try {
      await completePickupService(pickupId, listingId);
    } catch (error) {
      throw error;
    }
  }, []);

  const completePickupByNgo = useCallback(async (pickup) => {
    try {
      await completePickupByNgoService(pickup.id, pickup.listingId);
      await recordCompletedDonation({
        restaurantId: pickup.restaurantId,
        ngoId:        pickup.ngoId,
        quantity:     pickup.quantity,
        unit:         pickup.unit,
      });
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    pickups,
    activePickups,
    completedPickups,
    cancelledPickups,
    loading,
    error,
    cancelPickup,
    completePickup,
    completePickupByNgo,
  };
};

export default usePickups;
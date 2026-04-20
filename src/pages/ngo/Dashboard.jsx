import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Package, CheckCircle,
  Leaf, Users, Clock, Archive
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useListings from '../../hooks/useListings';
import usePickups from '../../hooks/usePickups';
import StatsCard from '../../components/dashboard/StatsCard';
import ImpactCounter from '../../components/dashboard/ImpactCounter';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import Sidebar from '../../components/layout/Sidebar';
import { ROUTES, ROLES } from '../../utils/constants';

const NgoDashboard = () => {
  const { userProfile } = useAuth();

  // Fetch available listings in the NGO's city
  const { listings: availableListings, loading: listingsLoading } = useListings(
    { city: userProfile?.city },
    'browse'
  );

  const {
    pickups,
    activePickups,
    completedPickups,
    loading: pickupsLoading,
  } = usePickups(userProfile?.uid, ROLES.NGO);

  /**
   * FIX: Derived Impact Stats
   * We calculate impact directly from completedPickups to ensure real-time accuracy.
   */
  const derivedImpact = useMemo(() => {
    const totalKg = completedPickups.reduce(
      (sum, p) => (p.unit?.toLowerCase() === 'kg' ? sum + Number(p.quantity || 0) : sum),
      0
    );
    const totalPackets = completedPickups.reduce(
      (sum, p) => (p.unit?.toLowerCase() === 'packets' ? sum + Number(p.quantity || 0) : sum),
      0
    );
    const totalBoxes = completedPickups.reduce(
      (sum, p) => (p.unit?.toLowerCase() === 'boxes' ? sum + Number(p.quantity || 0) : sum),
      0
    );

    return {
      completedCount: completedPickups.length,
      totalKg: totalKg.toFixed(1),
      totalPackets,
      totalBoxes,
      totalClaims: pickups.length
    };
  }, [completedPickups, pickups]);

  const activityItems = useMemo(() => {
    return pickups
      .slice(0, 10)
      .map((p) => ({ ...p, type: 'pickup' }))
      .sort((a, b) => {
        const aTime = a.claimedAt?.toDate?.() || 0;
        const bTime = b.claimedAt?.toDate?.() || 0;
        return bTime - aTime;
      })
      .slice(0, 8);
  }, [pickups]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {userProfile?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {availableListings.length > 0
              ? `${availableListings.length} food listing${availableListings.length > 1 ? 's' : ''} available in ${userProfile?.city} right now.`
              : `No food available in ${userProfile?.city} right now. Check back soon.`}
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            to={ROUTES.NGO_BROWSE_LISTINGS}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            Browse Listings
            {availableListings.length > 0 && (
              <span className="bg-white text-emerald-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {availableListings.length}
              </span>
            )}
          </Link>
          <Link
            to={ROUTES.NGO_CLAIMED_PICKUPS}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Package className="h-4 w-4" />
            My Pickups
            {activePickups.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {activePickups.length}
              </span>
            )}
          </Link>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Available Now"
            value={availableListings.length}
            icon={Search}
            color="emerald"
            loading={listingsLoading}
            subtitle={`In ${userProfile?.city}`}
          />
          <StatsCard
            title="Active Pickups"
            value={activePickups.length}
            icon={Clock}
            color="amber"
            loading={pickupsLoading}
            subtitle="Claimed by you"
          />
          <StatsCard
            title="Completed Pickups"
            value={derivedImpact.completedCount}
            icon={CheckCircle}
            color="blue"
            loading={pickupsLoading}
            subtitle="All time"
          />
          
        </div>

        {/* Impact counters — Updated to show Packets and Boxes */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Your Impact 💚
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <StatsCard
            //title="Total kg"
            value={`${derivedImpact.totalKg} kg`}
            icon={Package}
            color="purple"
            loading={pickupsLoading}
            subtitle="Weight collected"
          />
            <ImpactCounter
              value={derivedImpact.totalPackets}
              label="Packets Collected"
              color="orange"
              icon={Package}
              loading={pickupsLoading}
            />
             <ImpactCounter
              value={derivedImpact.totalBoxes}
              label="Boxes Collected"
              color="purple"
              icon={Archive}
              loading={pickupsLoading}
            />
            <ImpactCounter
              value={derivedImpact.totalClaims}
              label="Total Claims"
              color="emerald"
              icon={Leaf}
              loading={pickupsLoading}
            />
          </div>
        </div>

        {/* Active pickup alert */}
        {activePickups.length > 0 && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800">
                  You have {activePickups.length} active pickup{activePickups.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Don't forget to collect! Check the pickup window times.
                </p>
                <Link
                  to={ROUTES.NGO_CLAIMED_PICKUPS}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-900 mt-2"
                >
                  View my pickups →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Activity feed + city snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityFeed
              items={activityItems}
              loading={pickupsLoading}
              role={ROLES.NGO}
              title="Your Pickup Activity"
            />
          </div>

          {/* City snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-1">
              📍 {userProfile?.city}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Food available right now</p>

            {listingsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : availableListings.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                No food available right now in {userProfile?.city}.
              </p>
            ) : (
              <div className="space-y-2">
                {availableListings.slice(0, 4).map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {listing.foodName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {listing.restaurantName}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 ml-2 flex-shrink-0">
                      {listing.quantity} {listing.unit}
                    </span>
                  </div>
                ))}

                {availableListings.length > 4 && (
                  <Link
                    to={ROUTES.NGO_BROWSE_LISTINGS}
                    className="block text-center text-sm text-emerald-600 font-medium hover:text-emerald-700 pt-2"
                  >
                    +{availableListings.length - 4} more available →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NgoDashboard;
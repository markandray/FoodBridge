import { useState, useMemo } from 'react';
import { History, CheckCircle, X, Package, Archive, Users } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import usePickups from '../../hooks/usePickups';
import Sidebar from '../../components/layout/Sidebar';
import StatsCard from '../../components/dashboard/StatsCard';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { ROLES } from '../../utils/constants';
import { formatDateTime } from '../../utils/dateHelpers';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const PickupHistory = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('completed');

  const {
    completedPickups,
    cancelledPickups,
    loading,
    error,
  } = usePickups(userProfile?.uid, ROLES.NGO);

  // REACT CONCEPT: useMemo — aggregate stats computed from pickup list
  const stats = useMemo(() => {
    // Total Kilograms
    const totalKgCollected = completedPickups.reduce(
      (sum, p) => (p.unit?.toLowerCase() === 'kg' ? sum + Number(p.quantity) : sum),
      0
    );

    // Total Packets
    const totalPackets = completedPickups.reduce(
      (sum, p) => (p.unit?.toLowerCase() === 'packets' ? sum + Number(p.quantity) : sum),
      0
    );

    // Total Boxes
    const totalBoxes = completedPickups.reduce(
      (sum, p) => (p.unit?.toLowerCase() === 'boxes' ? sum + Number(p.quantity) : sum),
      0
    );

    const uniqueRestaurants = new Set(completedPickups.map((p) => p.restaurantId)).size;

    return {
      totalCompleted: completedPickups.length,
      totalCancelled: cancelledPickups.length,
      totalKgCollected: totalKgCollected.toFixed(1),
      totalPackets,
      totalBoxes,
      uniqueRestaurants,
    };
  }, [completedPickups, cancelledPickups]);

  const displayedPickups =
    activeTab === 'completed' ? completedPickups : cancelledPickups;

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <History className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pickup History</h1>
            <p className="text-slate-500 text-sm">Your complete pickup record</p>
          </div>
        </div>

        {/* Summary stats — Updated with Packets and Boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard
            title="Completed"
            value={stats.totalCompleted}
            icon={CheckCircle}
            color="blue"
            loading={loading}
          />
          <StatsCard
            title="kg Collected"
            value={`${stats.totalKgCollected} kg`}
            icon={Package}
            color="emerald"
            loading={loading}
          />
          <StatsCard
            title="Packets"
            value={stats.totalPackets}
            icon={Package}
            color="orange"
            loading={loading}
          />
          <StatsCard
            title="Boxes"
            value={stats.totalBoxes}
            icon={Archive}
            color="purple"
            loading={loading}
          />
          <StatsCard
            title="Restaurants"
            value={stats.uniqueRestaurants}
            icon={Users}
            color="emerald"
            loading={loading}
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200">
            {[
              { key: 'completed', label: 'Completed', count: stats.totalCompleted, icon: CheckCircle },
              { key: 'cancelled', label: 'Cancelled', count: stats.totalCancelled, icon: X },
            ].map(({ key, label, count, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === key
                    ? 'text-emerald-700 border-emerald-600 bg-emerald-50/50'
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                <span className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-full',
                  activeTab === key
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                )}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Table content */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600 font-medium">Failed to load history</p>
            </div>
          ) : displayedPickups.length === 0 ? (
            <EmptyState
              icon={activeTab === 'completed' ? CheckCircle : X}
              title={
                activeTab === 'completed'
                  ? 'No completed pickups yet'
                  : 'No cancelled pickups'
              }
              description={
                activeTab === 'completed'
                  ? 'Completed pickups will appear here once restaurants confirm your collections.'
                  : 'Pickups you cancel will appear here.'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Food', 'Quantity', 'Restaurant', 'City',
                      activeTab === 'completed' ? 'Completed On' : 'Cancelled On',
                      'Status'
                    ].map((col) => (
                      <th
                        key={col}
                        className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedPickups.map((pickup) => (
                    <tr key={pickup.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {pickup.foodName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {pickup.quantity} {pickup.unit}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {pickup.restaurantName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {pickup.city}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {activeTab === 'completed'
                          ? formatDateTime(pickup.completedAt)
                          : formatDateTime(pickup.cancelledAt || pickup.claimedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          color={activeTab === 'completed' ? 'blue' : 'red'}
                          dot
                        >
                          {pickup.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default PickupHistory;
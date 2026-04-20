import { useMemo } from 'react';
import { History, CheckCircle, Package, Archive, Users } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import usePickups from '../../hooks/usePickups';
import Sidebar from '../../components/layout/Sidebar';
import StatsCard from '../../components/dashboard/StatsCard';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { ROLES } from '../../utils/constants';
import { formatDateTime } from '../../utils/dateHelpers';

const DonationHistory = () => {
  const { userProfile } = useAuth();
  const { completedPickups, loading, error } = usePickups(
    userProfile?.uid,
    ROLES.RESTAURANT
  );

  /**
   * REACT CONCEPT: useMemo 
   * Aggregating summary stats based on specific units (kg, packets, boxes).
   * This logic ensures that all types of donations are visible.
   */
  const summaryStats = useMemo(() => {
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

    const uniqueNgos = new Set(completedPickups.map((p) => p.ngoId)).size;

    return {
      totalCompleted: completedPickups.length,
      totalKg: totalKg.toFixed(1),
      totalPackets,
      totalBoxes,
      uniqueNgos,
    };
  }, [completedPickups]);

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <History className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Donation History</h1>
            <p className="text-slate-500 text-sm">Your complete record of completed food donations</p>
          </div>
        </div>

        {/* Summary stats — Updated Grid for 5 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard
            title="Completed"
            value={summaryStats.totalCompleted}
            icon={CheckCircle}
            color="blue"
            loading={loading}
          />
          <StatsCard
            title="Total kg"
            value={`${summaryStats.totalKg} kg`}
            icon={Package}
            color="emerald"
            loading={loading}
          />
          <StatsCard
            title="Packets"
            value={summaryStats.totalPackets}
            icon={Package}
            color="orange"
            loading={loading}
          />
          <StatsCard
            title="Boxes"
            value={summaryStats.totalBoxes}
            icon={Archive}
            color="purple"
            loading={loading}
          />
          <StatsCard
            title="NGOs Served"
            value={summaryStats.uniqueNgos}
            icon={Users}
            color="emerald"
            loading={loading}
            subtitle="Unique partners"
          />
        </div>

        {/* History table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">All Completed Donations</h3>
            <span className="text-sm text-slate-500">
              {completedPickups.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-600">
              <p className="font-medium">Failed to load history</p>
              <p className="text-sm text-slate-500 mt-1">{error}</p>
            </div>
          ) : completedPickups.length === 0 ? (
            <EmptyState
              icon={History}
              title="No completed donations yet"
              description="Once an NGO collects food and you mark it complete, it'll appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Food', 'Quantity', 'NGO', 'City', 'Completed On', 'Status'].map((col) => (
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
                  {completedPickups.map((pickup) => (
                    <tr
                      key={pickup.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {pickup.foodName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {pickup.quantity} {pickup.unit}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {pickup.ngoName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {pickup.city}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {formatDateTime(pickup.completedAt || pickup.claimedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge color="blue" dot>
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

export default DonationHistory;
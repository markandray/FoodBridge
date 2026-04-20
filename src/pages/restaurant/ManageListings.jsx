import { useState, useCallback, useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useListings from '../../hooks/useListings';
import useToast from '../../hooks/useToast';
import ListingGrid from '../../components/listings/ListingGrid';
import ListingFilters from '../../components/listings/ListingFilters';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Sidebar from '../../components/layout/Sidebar';
import { LISTING_STATUS, ROLES } from '../../utils/constants';

const STATUS_OPTIONS = [
  { value: LISTING_STATUS.AVAILABLE, label: 'Available' },
  { value: LISTING_STATUS.CLAIMED,   label: 'Claimed'   },
  { value: LISTING_STATUS.COMPLETED, label: 'Completed' },
  { value: LISTING_STATUS.EXPIRED,   label: 'Expired'   },
];

const ManageListings = () => {
  const { userProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: '',
  });
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteModal, setDeleteModal]   = useState({ open: false, listingId: null });
  const [completeModal, setCompleteModal] = useState({ open: false, listingId: null });

  const {
    listings,
    loading,
    error,
    deleteListing,
    completeListing,
  } = useListings({ restaurantId: userProfile?.uid }, 'manage');

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (filters.status && l.status !== filters.status) return false;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        return (
          l.foodName?.toLowerCase().includes(term) ||
          l.description?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [listings, filters.status, filters.searchTerm]);


  const stats = useMemo(() => ({
    total:     listings.length,
    available: listings.filter((l) => l.status === LISTING_STATUS.AVAILABLE).length,
    claimed:   listings.filter((l) => l.status === LISTING_STATUS.CLAIMED).length,
    completed: listings.filter((l) => l.status === LISTING_STATUS.COMPLETED).length,
  }), [listings]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDelete = useCallback((listingId) => {
    setDeleteModal({ open: true, listingId });
  }, []);

  const handleComplete = useCallback((listingId) => {
    setCompleteModal({ open: true, listingId });
  }, []);

  const confirmDelete = async () => {
    const { listingId } = deleteModal;
    setDeleteModal({ open: false, listingId: null });
    setActionLoading(listingId);
    try {
      await deleteListing(listingId);
      showSuccess('Listing deleted successfully.');
    } catch (err) {
      showError(err.message || 'Failed to delete listing.');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmComplete = async () => {
    const { listingId } = completeModal;
    setCompleteModal({ open: false, listingId: null });
    setActionLoading(listingId);
    try {
      await completeListing(listingId);
      showSuccess('Pickup marked as complete! Your impact stats have been updated.');
    } catch (err) {
      showError(err.message || 'Failed to mark as complete.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Listings</h1>
            <p className="text-slate-500 text-sm">Track and manage all your food donations</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total',     value: stats.total,     color: 'text-slate-700'  },
            { label: 'Available', value: stats.available, color: 'text-emerald-600'},
            { label: 'Claimed',   value: stats.claimed,   color: 'text-amber-600'  },
            { label: 'Completed', value: stats.completed, color: 'text-blue-600'   },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <ListingFilters
            filters={filters}
            onChange={handleFilterChange}
            showCity={false}
            showUnit={false}
            showStatus
            statusOptions={STATUS_OPTIONS}
          />
        </div>

        <ListingGrid
          listings={filteredListings}
          loading={loading}
          error={error}
          role={ROLES.RESTAURANT}
          onComplete={handleComplete}
          onDelete={handleDelete}
          actionLoading={actionLoading}
          emptyTitle="No listings yet"
          emptyDescription="Post your first food donation to get started."
        />

        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, listingId: null })}
          title="Delete Listing"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteModal({ open: false, listingId: null })}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Yes, delete</Button>
            </>
          }
        >
          <p className="text-slate-600">
            Are you sure you want to delete this listing? This action cannot be undone.
          </p>
        </Modal>

        <Modal
          isOpen={completeModal.open}
          onClose={() => setCompleteModal({ open: false, listingId: null })}
          title="Mark as Completed"
          footer={
            <>
              <Button variant="secondary" onClick={() => setCompleteModal({ open: false, listingId: null })}>Cancel</Button>
              <Button variant="primary" onClick={confirmComplete}>Confirm pickup completed</Button>
            </>
          }
        >
          <p className="text-slate-600">
            Confirm that the NGO has collected this food. This will update both parties' impact stats.
          </p>
        </Modal>

      </main>
    </div>
  );
};

export default ManageListings;
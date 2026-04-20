import useToast from '../../hooks/useToast'
import { useState, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useListings from '../../hooks/useListings';
import useDebounce from '../../hooks/useDebounce';
import ListingGrid from '../../components/listings/ListingGrid';
import ListingFilters from '../../components/listings/ListingFilters';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { ROLES, DEBOUNCE_DELAY } from '../../utils/constants';


const BrowseListings = () => {
  const { showSuccess, showError } = useToast();
  const { userProfile } = useAuth();

  const [rawSearch, setRawSearch] = useState('');
  const [filters, setFilters] = useState({
    city: userProfile?.city || '', 
    unit: '',
  });
  
  const debouncedSearch = useDebounce(rawSearch, DEBOUNCE_DELAY);

  const [actionLoading, setActionLoading] = useState(null);
  const [claimModal, setClaimModal] = useState({ open: false, listing: null });
  const { listings, loading, error, claimListing } = useListings(
    {
      city: filters.city,
      unit: filters.unit,
      searchTerm: debouncedSearch,
    },
    'browse'
  );

  const handleFilterChange = useCallback((name, value) => {
    if (name === 'searchTerm') {
      setRawSearch(value); 
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const resultLabel = useMemo(() => {
    if (loading) return '';
    if (listings.length === 0) return 'No listings found';
    return `${listings.length} listing${listings.length === 1 ? '' : 's'} found`;
  }, [listings.length, loading]);

  
  const handleClaimClick = useCallback((listing) => {
    setClaimModal({ open: true, listing });
  }, []);

  const confirmClaim = async () => {
  const { listing } = claimModal;
  setClaimModal({ open: false, listing: null });
  setActionLoading(listing.id);

  try {
    await claimListing(listing, userProfile);
    showSuccess(`You've claimed ${listing.foodName}! Head to My Pickups to track it.`);
  } catch (err) {
    showError(err.message || 'Failed to claim listing. Please try again.');
  } finally {
    setActionLoading(null);
  }
};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Search className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse Listings</h1>
          <p className="text-slate-500 text-sm">
            Find surplus food from restaurants near you
          </p>
        </div>
      </div>

      {/* Filters — REACT CONCEPT: Lifting state up */}
      <div className="mb-6">
        <ListingFilters
          filters={{ ...filters, searchTerm: rawSearch }}
          onChange={handleFilterChange}
          showSearch
          showCity
          showUnit
        />
      </div>

      {/* Result count */}
      {!loading && (
        <p className="text-sm text-slate-500 mb-4">{resultLabel}</p>
      )}

      {/* Listings grid */}
      <ListingGrid
        listings={listings}
        loading={loading}
        error={error}
        role={ROLES.NGO}
        onClaim={handleClaimClick}
        actionLoading={actionLoading}
        emptyTitle="No available listings"
        emptyDescription={
          filters.city
            ? `No food available in ${filters.city} right now. Check back soon!`
            : 'No food listings available. Try changing your filters.'
        }
      />

      {/* Claim Confirmation Modal */}
      <Modal
        isOpen={claimModal.open}
        onClose={() => setClaimModal({ open: false, listing: null })}
        title="Confirm Claim"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setClaimModal({ open: false, listing: null })}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmClaim}>
              Yes, claim this pickup
            </Button>
          </>
        }
      >
        {claimModal.listing && (
          <div className="space-y-3">
            <p className="text-slate-600">
              You are about to claim:
            </p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-slate-800">
                {claimModal.listing.foodName}
              </p>
              <p className="text-sm text-slate-600">
                {claimModal.listing.quantity} {claimModal.listing.unit} from{' '}
                <span className="font-medium">{claimModal.listing.restaurantName}</span>
              </p>
              <p className="text-sm text-slate-500">
                📍 {claimModal.listing.city}
              </p>
            </div>
            <p className="text-sm text-slate-500">
              Once claimed, you commit to collecting this food during the
              pickup window. You can cancel if needed.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BrowseListings;
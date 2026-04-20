import { memo } from 'react';
import {
  MapPin, Clock, Package, Calendar,
  CheckCircle, Trash2, Tag, User
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { LISTING_STATUS, STATUS_COLORS, ROLES } from '../../utils/constants';
import {
  formatDateTime,
  formatPickupWindow,
  getExpiryLabel,
} from '../../utils/dateHelpers';

const ListingCard = memo(({
  listing,
  role,          
  onClaim,       
  onComplete,    
  onDelete,      
  loading,       
}) => {

  const isThisLoading = loading === listing.id;
  const statusColor = STATUS_COLORS[listing.status] || 'slate';

  const isAvailable = listing.status === LISTING_STATUS.AVAILABLE;
  const isClaimed = listing.status === LISTING_STATUS.CLAIMED;
  const isCompleted = listing.status === LISTING_STATUS.COMPLETED;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">

      {/* Photo or placeholder */}
      <div className="h-40 bg-gradient-to-br from-emerald-50 to-orange-50 relative flex-shrink-0">
        {listing.photoURL ? (
          <img
            src={listing.photoURL}
            alt={listing.foodName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">🍱</span>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-3 right-3">
          <Badge color={statusColor} dot>
            {listing.status}
          </Badge>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">

        {/* Food name + quantity */}
        <div className="mb-3">
          <h3 className="font-semibold text-slate-900 text-base leading-tight mb-1">
            {listing.foodName}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Package className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-emerald-700">
              {listing.quantity} {listing.unit}
            </span>
          </div>
        </div>

        {/* Meta info */}
        <div className="space-y-2 mb-4 flex-1">
          {/* Restaurant name — shown to NGOs */}
          {role === ROLES.NGO && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{listing.restaurantName}</span>
            </div>
          )}

          {/* Claimed by — shown to restaurants when claimed */}
          {role === ROLES.RESTAURANT && isClaimed && listing.claimedByName && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate text-xs font-medium">
                Claimed by {listing.claimedByName}
              </span>
            </div>
          )}

          {/* City */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <span>{listing.city}</span>
          </div>

          {/* Expiry */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <span className={`text-xs font-medium ${
              isAvailable ? 'text-orange-600' : 'text-slate-500'
            }`}>
              {getExpiryLabel(listing.expiryTime)}
            </span>
          </div>

          {/* Pickup window */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <span className="text-xs">
              Pickup: {formatPickupWindow(listing.pickupWindowStart, listing.pickupWindowEnd)}
            </span>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1">
              {listing.description}
            </p>
          )}
        </div>

        {/* Posted date */}
        <p className="text-xs text-slate-400 mb-4">
          Posted {formatDateTime(listing.createdAt)}
        </p>

        {/* Actions — REACT CONCEPT: Conditional rendering based on role + status */}
        <div className="flex gap-2 mt-auto">
          {/* NGO: Claim button — only on available listings */}
          {role === ROLES.NGO && isAvailable && onClaim && (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              loading={isThisLoading}
              onClick={() => onClaim(listing)}
              icon={Tag}
            >
              Claim Pickup
            </Button>
          )}

          {/* NGO: Claimed indicator */}
          {role === ROLES.NGO && isClaimed && (
            <div className="flex items-center gap-2 w-full justify-center py-1.5 text-sm font-medium text-amber-700">
              <CheckCircle className="h-4 w-4" />
              Claimed by you
            </div>
          )}

          {/* Restaurant: Mark complete — only on claimed listings */}
          {role === ROLES.RESTAURANT && isClaimed && onComplete && (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              loading={isThisLoading}
              onClick={() => onComplete(listing.id)}
              icon={CheckCircle}
            >
              Mark Complete
            </Button>
          )}

          {/* Restaurant: Delete — only on available listings */}
          {role === ROLES.RESTAURANT && isAvailable && onDelete && (
            <Button
              variant="danger"
              size="sm"
              loading={isThisLoading}
              onClick={() => onDelete(listing.id)}
              icon={Trash2}
            >
              Delete
            </Button>
          )}

          {/* Completed state — both roles */}
          {isCompleted && (
            <div className="flex items-center gap-2 w-full justify-center py-1.5 text-sm font-medium text-blue-600">
              <CheckCircle className="h-4 w-4" />
              Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
});


ListingCard.displayName = 'ListingCard';

export default ListingCard;
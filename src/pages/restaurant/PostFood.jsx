
import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowRight, CheckCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useListings from '../../hooks/useListings';
import ListingForm from '../../components/listings/ListingForm';
import { ROUTES } from '../../utils/constants';
import { updateListing } from '../../services/listings.service';

const PostFood = () => {
  const { userProfile } = useAuth();
  const { createListing } = useListings({}, 'browse');
  const navigate = useNavigate();

  const [successId, setSuccessId] = useState(null);

  const topRef = useRef(null);

  const handleSubmit = useCallback(async (formData, photoFile, uploadPhoto) => {
    const listingId = await createListing(
      { ...formData, photoURL: null },
      userProfile
    );

    if (photoFile && uploadPhoto) {
      try {
        const photoURL = await uploadPhoto(photoFile, listingId);
        // Update the listing with the photo URL
        await updateListing(listingId, { photoURL });
      } catch (photoError) {
        console.error('Photo upload failed:', photoError);
      }
    }

    setSuccessId(listingId);
    // Scroll to top to show success message
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [createListing, userProfile]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8" ref={topRef}>

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <PlusCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Post Surplus Food</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Let NGOs in your city know about food available for pickup.
        </p>
      </div>

      {/* Success state — shown after successful submission */}
      {successId && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-800">Listing posted successfully!</p>
              <p className="text-sm text-emerald-600 mt-1">
                NGOs in your city can now see and claim this food.
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setSuccessId(null)}
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Post another listing
                </button>
                <button
                  onClick={() => navigate(ROUTES.RESTAURANT_MANAGE_LISTINGS)}
                  className="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                >
                  View my listings <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form — hidden after success until "Post another" is clicked */}
      {!successId && (
        <ListingForm
          onSubmit={handleSubmit}
          defaultCity={userProfile?.city || ''}
          submitLabel="Post Listing"
        />
      )}
    </div>
  );
};

export default PostFood;
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Utensils, Phone, MapPin, AlertCircle, Sparkles
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { createGoogleUserProfile } from '../services/auth.service';
import { validatePhone, validateCity, validateRole, validateName, isFormValid } from '../utils/validators';
import { ROLES, ROUTES, CITIES } from '../utils/constants';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import RoleCard from '../components/auth/RoleCard';

const CompleteProfile = () => {
  const { currentUser, refreshProfile } = useAuth();
  const { showSuccess, showError }      = useToast();
  const navigate                        = useNavigate();
  const nameRef                         = useRef(null);

  const [formData, setFormData] = useState({
    name:  '',
    phone: '',
    city:  '',
    role:  '',
  });

  const [errors, setErrors]           = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    if (currentUser?.displayName) {
      setFormData((prev) => ({ ...prev, name: currentUser.displayName }));
    }
    nameRef.current?.focus();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name])  setErrors((prev) => ({ ...prev, [name]: '' }));
    if (submitError)   setSubmitError('');
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
    if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    const nameError  = validateName(formData.name);
    const phoneError = validatePhone(formData.phone);
    const cityError  = validateCity(formData.city);
    const roleError  = validateRole(formData.role);

    if (nameError)  validationErrors.name  = nameError;
    if (phoneError) validationErrors.phone = phoneError;
    if (cityError)  validationErrors.city  = cityError;
    if (roleError)  validationErrors.role  = roleError;

    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      await createGoogleUserProfile({
        firebaseUser: currentUser,
        name:         formData.name,
        role:         formData.role,
        city:         formData.city,
        phone:        formData.phone,
      });

      await refreshProfile();

      showSuccess('Profile complete! Welcome to FoodBridge 🎉');

      const dashboard =
        formData.role === ROLES.RESTAURANT
          ? ROUTES.RESTAURANT_DASHBOARD
          : ROUTES.NGO_DASHBOARD;

      navigate(dashboard, { replace: true });

    } catch (error) {
      console.error('Profile completion failed:', error);
      setSubmitError(
        'Failed to save your profile. Please try again. ' +
        'If this keeps happening, try signing in with email instead.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 mb-4">
              <Sparkles className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Almost there!
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Tell us a bit more to finish setting up your account.
            </p>
          </div>

          {/* Google account confirmation pill */}
          {currentUser?.email && (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6">
              {/* Google avatar or initial */}
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Google profile"
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 text-sm font-bold">
                    {currentUser.email[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Signed in with Google as</p>
                <p className="text-sm font-medium text-slate-800 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* Step 1: Role Selection */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">
                I am a <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <RoleCard
                  role={ROLES.RESTAURANT}
                  selected={formData.role === ROLES.RESTAURANT}
                  onSelect={handleRoleSelect}
                />
                <RoleCard
                  role={ROLES.NGO}
                  selected={formData.role === ROLES.NGO}
                  onSelect={handleRoleSelect}
                />
              </div>
              {errors.role && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <span>⚠</span> {errors.role}
                </p>
              )}
            </div>

            {/* Step 2: Profile Details */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Your Details
              </p>

              {/* Name — pre-filled from Google, editable */}
              <Input
                ref={nameRef}
                label={
                  formData.role === ROLES.RESTAURANT
                    ? 'Restaurant Name'
                    : formData.role === ROLES.NGO
                    ? 'Organisation Name'
                    : 'Your Name / Organisation'
                }
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Spice Garden Restaurant"
                error={errors.name}
                icon={Utensils}
                required
                hint="This is how you'll appear to other users on the platform."
              />

              {/* Phone */}
              <Input
                label="Phone number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                error={errors.phone}
                icon={Phone}
                required
              />

              {/* City */}
              <div className="flex flex-col gap-1">
                <label htmlFor="city" className="text-sm font-medium text-slate-700">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border bg-white text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer
                      ${errors.city
                        ? 'border-red-400 focus:ring-red-500'
                        : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500'
                      }`}
                  >
                    <option value="">Select your city</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                {errors.city && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span>⚠</span> {errors.city}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {loading ? 'Saving profile...' : 'Complete setup →'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          You can update your profile details later from your dashboard.
        </p>
      </div>
    </div>
  );
};

export default CompleteProfile;
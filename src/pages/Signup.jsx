import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import {
  Utensils, Users, Mail, Lock, Phone,
  MapPin, User, AlertCircle, CheckCircle
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { signupUser, getFriendlyAuthError } from '../services/auth.service';
import { validateSignupForm, isFormValid } from '../utils/validators';
import { ROLES, ROUTES, CITIES } from '../utils/constants';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const RoleCard = ({ role, selected, onSelect }) => {
  const config = {
    [ROLES.RESTAURANT]: {
      icon: Utensils,
      title: 'Restaurant',
      description: 'I have surplus food to donate',
      color: selected
        ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-300'
        : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    [ROLES.NGO]: {
      icon: Users,
      title: 'NGO',
      description: 'I collect and distribute food',
      color: selected
        ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-300'
        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  };

  const { icon: Icon, title, description, color, iconBg, iconColor } = config[role];

  return (
    <button
      type="button" 
      onClick={() => onSelect(role)}
      className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer text-center w-full ${color}`}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
        </div>
      )}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </button>
  );
};

const Signup = () => {
  const [searchParams] = useSearchParams(); // Initialize search params
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    role: '',
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser, role } = useAuth();
  const navigate = useNavigate();
  const nameRef = useRef(null);

  /**
   * LOGIC IMPLEMENTATION: Role Detection
   * This effect reads the ?role=... parameter from the URL 
   * and automatically updates the form state.
   */
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'restaurant' || roleParam === 'ngo') {
      // Use ROLES constant to ensure data integrity
      const selectedRole = roleParam === 'restaurant' ? ROLES.RESTAURANT : ROLES.NGO;
      setFormData(prev => ({ ...prev, role: selectedRole }));
    }
  }, [searchParams]);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (currentUser && role) {
      const destination =
        role === ROLES.RESTAURANT
          ? ROUTES.RESTAURANT_DASHBOARD
          : ROUTES.NGO_DASHBOARD;
      navigate(destination, { replace: true });
    }
  }, [currentUser, role, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
  };
  
  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
    if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateSignupForm(formData);
    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      await signupUser(formData);
      const destination = formData.role === ROLES.RESTAURANT 
        ? ROUTES.RESTAURANT_DASHBOARD 
        : ROUTES.NGO_DASHBOARD;
        
      navigate(destination, { replace: true });
      
    } catch (error) {
      setSubmitError(getFriendlyAuthError(error));
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
              <Utensils className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Join as a {formData.role === ROLES.NGO ? 'NGO' : 'Restaurant'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Join FoodBridge — free for restaurants and NGOs
            </p>
          </div>

          {submitError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
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

            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Your Details
              </p>

              <div className="space-y-4">
                <Input
                  ref={nameRef}
                  label={formData.role === ROLES.RESTAURANT ? 'Restaurant Name' : 'Organisation Name'}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={
                    formData.role === ROLES.RESTAURANT
                      ? 'e.g. Spice Garden Restaurant'
                      : 'e.g. Helping Hands NGO'
                  }
                  error={errors.name}
                  icon={User}
                  required
                />

                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@yourorg.com"
                  error={errors.email}
                  icon={Mail}
                  required
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  error={errors.password}
                  icon={Lock}
                  required
                  autoComplete="new-password"
                  hint="At least 6 characters"
                />

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
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="text-emerald-600 font-semibold hover:text-emerald-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
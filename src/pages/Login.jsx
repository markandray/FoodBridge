
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Utensils, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import useAuth from '../hooks/useAuth';
import { loginUser, getFriendlyAuthError } from '../services/auth.service';
import { validateLoginForm, isFormValid } from '../utils/validators';
import { ROLES, ROUTES, COLLECTIONS } from '../utils/constants';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors]         = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading]         = useState(false);

  const { currentUser, role } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const emailRef  = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
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
    if (errors[name])   setErrors((prev) => ({ ...prev, [name]: '' }));
    if (submitError)    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(formData);
    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const firebaseUser = await loginUser(formData);     
      const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
      const userSnap   = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        
        setSubmitError(
          'Account setup is incomplete. Please sign up again or contact support.'
        );
        setLoading(false);
        return;
      }

      const profile = userSnap.data();     
      const from = location.state?.from?.pathname;

      const dashboard =
        profile.role === ROLES.RESTAURANT
          ? ROUTES.RESTAURANT_DASHBOARD
          : ROUTES.NGO_DASHBOARD;     
      navigate(from || dashboard, { replace: true });

    } catch (error) {
      setSubmitError(getFriendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 mb-4">
              <Utensils className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">
              Sign in to your FoodBridge account
            </p>
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              ref={emailRef}
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@restaurant.com"
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
              placeholder="Your password"
              error={errors.password}
              icon={Lock}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link
              to={ROUTES.SIGNUP}
              className="text-emerald-600 font-semibold hover:text-emerald-700"
            >
              Sign up free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          New here? Sign up as a Restaurant or NGO — it's completely free.
        </p>
      </div>
    </div>
  );
};

export default Login;
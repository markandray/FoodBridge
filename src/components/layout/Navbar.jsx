import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Utensils, Menu, X, LogOut, User, LayoutDashboard,
  PlusCircle, ClipboardList, History, Search
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { ROLES, ROUTES } from '../../utils/constants';
import { logoutUser } from '../../services/auth.service';
import Button from '../common/Button';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { currentUser, userProfile, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active link helper — highlights the current page's nav link
  const isActive = (path) => location.pathname === path;

  const restaurantLinks = [
    { to: ROUTES.RESTAURANT_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { to: ROUTES.RESTAURANT_POST_FOOD, label: 'Post Food', icon: PlusCircle },
    { to: ROUTES.RESTAURANT_MANAGE_LISTINGS, label: 'Manage', icon: ClipboardList },
    { to: ROUTES.RESTAURANT_DONATION_HISTORY, label: 'History', icon: History },
  ];

  const ngoLinks = [
    { to: ROUTES.NGO_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { to: ROUTES.NGO_BROWSE_LISTINGS, label: 'Browse', icon: Search },
    { to: ROUTES.NGO_CLAIMED_PICKUPS, label: 'My Pickups', icon: ClipboardList },
    { to: ROUTES.NGO_PICKUP_HISTORY, label: 'History', icon: History },
  ];

  const navLinks = role === ROLES.RESTAURANT ? restaurantLinks
    : role === ROLES.NGO ? ngoLinks
    : [];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-emerald-600 font-bold text-xl"
          >
            <Utensils className="h-6 w-6" />
            <span>FoodBridge</span>
          </Link>

          {/* Desktop nav links — only shown when logged in */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(to)
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side: user info + logout OR login/signup */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                {/* Role badge */}
                <span className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full',
                  role === ROLES.RESTAURANT
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                )}>
                  {role === ROLES.RESTAURANT ? '🍽 Restaurant' : '🤝 NGO'}
                </span>

                {/* User name */}
                <span className="text-sm text-slate-600 font-medium">
                  {userProfile?.name || currentUser.email}
                </span>

                {/* Logout button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  loading={loggingOut}
                  icon={LogOut}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to={ROUTES.SIGNUP}>
                  <Button variant="primary" size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu — REACT CONCEPT: Conditional rendering */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-4 pt-2">
          {currentUser ? (
            <>
              <div className="mb-3 pb-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">
                  {userProfile?.name}
                </p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium mb-1',
                    isActive(to)
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mt-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" fullWidth>Log in</Button>
              </Link>
              <Link to={ROUTES.SIGNUP} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" fullWidth>Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ClipboardList,
  History, Search, Package
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { ROLES, ROUTES } from '../../utils/constants';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Sidebar = () => {
  const { role, userProfile } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const restaurantLinks = [
    { to: ROUTES.RESTAURANT_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { to: ROUTES.RESTAURANT_POST_FOOD, label: 'Post Food', icon: PlusCircle },
    { to: ROUTES.RESTAURANT_MANAGE_LISTINGS, label: 'Manage Listings', icon: ClipboardList },
    { to: ROUTES.RESTAURANT_DONATION_HISTORY, label: 'Donation History', icon: History },
  ];

  const ngoLinks = [
    { to: ROUTES.NGO_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { to: ROUTES.NGO_BROWSE_LISTINGS, label: 'Browse Listings', icon: Search },
    { to: ROUTES.NGO_CLAIMED_PICKUPS, label: 'Claimed Pickups', icon: Package },
    { to: ROUTES.NGO_PICKUP_HISTORY, label: 'Pickup History', icon: History },
  ];

  const links = role === ROLES.RESTAURANT ? restaurantLinks : ngoLinks;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen pt-6 pb-8 px-4">
      {/* User info */}
      <div className="mb-6 px-2">
        <p className="font-semibold text-slate-800 truncate">
          {userProfile?.name || 'User'}
        </p>
        <p className="text-xs text-slate-500 capitalize mt-0.5">
          {role === ROLES.RESTAURANT ? '🍽 Restaurant' : '🤝 NGO'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {/* REACT CONCEPT: Lists and keys */}
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              isActive(to)
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Icon className={cn(
              'h-4 w-4',
              isActive(to) ? 'text-emerald-600' : 'text-slate-400'
            )} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
import { Utensils, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
            <Utensils className="h-5 w-5" />
            <span>FoodBridge</span>
          </div>

          {/* Tagline */}
          <p className="text-slate-500 text-sm flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 text-red-400 fill-red-400" /> to reduce food waste
          </p>

          {/* Links */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link to={ROUTES.HOME} className="hover:text-slate-800 transition-colors">Home</Link>
            <Link to={ROUTES.SIGNUP} className="hover:text-slate-800 transition-colors">Sign up</Link>
            <Link to={ROUTES.LOGIN} className="hover:text-slate-800 transition-colors">Log in</Link>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} FoodBridge. Connecting surplus food with those who need it.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
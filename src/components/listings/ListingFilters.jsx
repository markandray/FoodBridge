import { Search, MapPin, Package, X } from 'lucide-react';
import { CITIES, FOOD_UNITS } from '../../utils/constants';
import Input from '../common/Input';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const ListingFilters = ({
  filters,         
  onChange,        
  showSearch = true,
  showCity = true,
  showUnit = true,
  showStatus = false, 
  statusOptions = [],
}) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.city ||
    filters.unit ||
    filters.status;

  const clearAll = () => {
    
    if (filters.searchTerm) onChange('searchTerm', '');
    if (filters.city) onChange('city', '');
    if (filters.unit) onChange('unit', '');
    if (filters.status) onChange('status', '');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 text-sm">Filters</h3>
        {/* REACT CONCEPT: conditional rendering — only show clear button if filters are active */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        {showSearch && (
          <div className="flex-1 min-w-0">
            <Input
              name="searchTerm"
              value={filters.searchTerm || ''}
              onChange={handleChange}
              placeholder="Search food or restaurant..."
              icon={Search}
              inputClassName="text-sm"
            />
          </div>
        )}

        {/* City filter */}
        {showCity && (
          <div className="relative min-w-[160px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <MapPin className="h-4 w-4 text-slate-400" />
            </div>
            <select
              name="city"
              value={filters.city || ''}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="">All cities</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        )}

        {/* Unit filter */}
        {showUnit && (
          <div className="relative min-w-[140px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Package className="h-4 w-4 text-slate-400" />
            </div>
            <select
              name="unit"
              value={filters.unit || ''}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="">All units</option>
              {FOOD_UNITS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Status filter — restaurant only */}
        {showStatus && statusOptions.length > 0 && (
          <div className="relative min-w-[150px]">
            <select
              name="status"
              value={filters.status || ''}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="">All statuses</option>
              {statusOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingFilters;
import { memo } from 'react';
import Spinner from '../common/Spinner';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const StatsCard = memo(({
  title,          
  value,          
  icon: Icon,     
  color = 'emerald', 
  loading = false,
  trend,          
  subtitle,       
  className = '',
}) => {

  const colorMap = {
    emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600' },
    orange:  { bg: 'bg-orange-100',  icon: 'text-orange-600'  },
    blue:    { bg: 'bg-blue-100',    icon: 'text-blue-600'    },
    purple:  { bg: 'bg-purple-100',  icon: 'text-purple-600'  },
    red:     { bg: 'bg-red-100',     icon: 'text-red-600'     },
    amber:   { bg: 'bg-amber-100',   icon: 'text-amber-600'   },
  };

  const { bg, icon: iconColor } = colorMap[color] || colorMap.emerald;

  return (
    <div className={cn(
      'bg-white rounded-2xl border border-slate-200 p-6 shadow-sm',
      'hover:shadow-md transition-shadow',
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', bg)}>
          {Icon && <Icon className={cn('h-5 w-5', iconColor)} />}
        </div>

        {/* Trend badge — REACT CONCEPT: conditional rendering */}
        {trend && (
          <span className={cn(
            'text-xs font-semibold px-2 py-1 rounded-full',
            trend.direction === 'up'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          )}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="space-y-1">
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
        )}
        <p className="text-sm font-medium text-slate-600">{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;
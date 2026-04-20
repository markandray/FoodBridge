const cn = (...classes) => classes.filter(Boolean).join(' ');

// --- ListingCard skeleton ---
// Mirrors the exact shape of a ListingCard
export const ListingCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
    {/* Photo area */}
    <div className="h-40 bg-slate-200" />
    {/* Body */}
    <div className="p-5 space-y-3">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-200 rounded w-2/3" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-3/5" />
      </div>
      <div className="pt-3">
        <div className="h-9 bg-slate-200 rounded-lg" />
      </div>
    </div>
  </div>
);

// --- StatsCard skeleton ---
// Mirrors the exact shape of a StatsCard
export const StatsCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 bg-slate-200 rounded-xl" />
    </div>
    <div className="space-y-2">
      <div className="h-7 bg-slate-200 rounded w-1/2" />
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  </div>
);

// --- Generic skeleton line ---
// For table rows, text content, etc.
export const SkeletonLine = ({ className = '', width = 'w-full' }) => (
  <div className={cn('h-4 bg-slate-200 rounded animate-pulse', width, className)} />
);

// --- Table row skeleton ---
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className={cn(
          'h-4 bg-slate-200 rounded',
          i === 0 ? 'w-3/4' : i === cols - 1 ? 'w-16' : 'w-1/2'
        )} />
      </td>
    ))}
  </tr>
);

// --- Grid of listing skeletons ---
// Drop-in replacement for ListingGrid while loading
export const ListingGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ListingCardSkeleton key={i} />
    ))}
  </div>
);

// --- Stats row skeleton ---
// Drop-in replacement for the stats grid row on dashboards
export const StatsRowSkeleton = ({ count = 4 }) => (
  <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <StatsCardSkeleton key={i} />
    ))}
  </div>
);
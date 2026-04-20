const cn = (...classes) => classes.filter(Boolean).join(' ');

const colorMap = {
  emerald: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  amber:   'bg-amber-100 text-amber-800 border border-amber-200',
  blue:    'bg-blue-100 text-blue-800 border border-blue-200',
  red:     'bg-red-100 text-red-800 border border-red-200',
  slate:   'bg-slate-100 text-slate-700 border border-slate-200',
  orange:  'bg-orange-100 text-orange-800 border border-orange-200',
};

const Badge = ({
  children,         // Text content of the badge
  color = 'slate',  // Key into colorMap above
  size = 'sm',      // 'xs' | 'sm' | 'md'
  className = '',
  dot = false,      // Shows a colored dot before the text
}) => {

  const sizes = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  const dotColors = {
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-500',
    blue:    'bg-blue-500',
    red:     'bg-red-500',
    slate:   'bg-slate-500',
    orange:  'bg-orange-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        colorMap[color] || colorMap.slate,
        sizes[size] || sizes.sm,
        className
      )}
    >
      {/* REACT CONCEPT: Conditional rendering with && */}
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColors[color] || dotColors.slate
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
const cn = (...classes) => classes.filter(Boolean).join(' ');

const Spinner = ({
  size = 'md',      
  color = 'emerald', 
  className = '',
  label = 'Loading...', 
}) => {

  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-[3px]',
    xl: 'h-12 w-12 border-4',
  };

  const colors = {
    emerald: 'border-emerald-200 border-t-emerald-600',
    white:   'border-white/30 border-t-white',
    slate:   'border-slate-200 border-t-slate-600',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-block', className)}
    >
      <div
        className={cn(
          'rounded-full animate-spin',
          sizes[size] || sizes.md,
          colors[color] || colors.emerald
        )}
      />
      {/* Visually hidden text for screen readers */}
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Spinner;
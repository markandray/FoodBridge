const cn = (...classes) => classes.filter(Boolean).join(' ');

const Button = ({
  children,           // Button label or icon + label
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  type = 'button',    // 'button' | 'submit' | 'reset'
  loading = false,    // Shows spinner, disables click
  disabled = false,   // Disables without spinner
  onClick,
  className = '',     // Escape hatch for one-off overrides
  fullWidth = false,
  icon: Icon,         // Optional Lucide icon component
  iconPosition = 'left', // 'left' | 'right'
}) => {

  const variants = {
    primary: [
      'bg-emerald-600 text-white',
      'hover:bg-emerald-700',
      'active:bg-emerald-800',
      'disabled:bg-emerald-300 disabled:cursor-not-allowed',
      'focus:ring-emerald-500',
    ].join(' '),

    secondary: [
      'bg-white text-emerald-700 border border-emerald-300',
      'hover:bg-emerald-50',
      'active:bg-emerald-100',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'focus:ring-emerald-500',
    ].join(' '),

    danger: [
      'bg-red-600 text-white',
      'hover:bg-red-700',
      'active:bg-red-800',
      'disabled:bg-red-300 disabled:cursor-not-allowed',
      'focus:ring-red-500',
    ].join(' '),

    ghost: [
      'bg-transparent text-slate-600',
      'hover:bg-slate-100',
      'active:bg-slate-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'focus:ring-slate-400',
    ].join(' '),

    orange: [
      'bg-orange-500 text-white',
      'hover:bg-orange-600',
      'active:bg-orange-700',
      'disabled:bg-orange-300 disabled:cursor-not-allowed',
      'focus:ring-orange-500',
    ].join(' '),
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const Spinner = () => (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        // Base styles applied to ALL buttons
        'inline-flex items-center justify-center gap-2',
        'rounded-lg font-medium',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        // Variant and size
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        // Full width option
        fullWidth && 'w-full',
        // Loading state: show not-allowed cursor
        loading && 'cursor-wait',
        // Consumer override classes (applied last so they win)
        className
      )}
    >
      {/* Left icon or loading spinner */}
      {loading ? (
        <Spinner />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="h-4 w-4" />
      )}

      {/* Button label */}
      {children}

      {/* Right icon (only when not loading) */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="h-4 w-4" />
      )}
    </button>
  );
};

export default Button;
const cn = (...classes) => classes.filter(Boolean).join(' ');

const EmptyState = ({
  icon: Icon,       // Lucide icon component
  title,            // e.g. "No listings yet"
  description,      // e.g. "Post your first food donation to get started."
  action,           // Optional: { label: string, onClick: fn }
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-16 px-6',
        className
      )}
    >
      {/* Icon container */}
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-emerald-400" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-slate-500 text-sm max-w-sm mb-6">{description}</p>
      )}

      {/* Action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
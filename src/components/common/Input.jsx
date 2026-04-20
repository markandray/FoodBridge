import { forwardRef } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');
const Input = forwardRef(({
  label,          // Label text above the input
  name,           // HTML name attribute + links label to input
  type = 'text',  // 'text' | 'email' | 'password' | 'number' | etc.
  value,          // Controlled: current value from parent's state
  onChange,       // Controlled: called on every keystroke
  placeholder,
  error,          // Error string from validators.js — shows below input
  hint,           // Optional helper text below input
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  icon: Icon,     // Optional icon inside the input (left side)
  ...rest         // Any other valid input props (min, max, step, etc.)
}, ref) => {

  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-slate-700"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}

      {/* Input wrapper — needed to position the icon absolutely */}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
        )}

        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          {...rest}
          className={cn(
            // Base styles
            'w-full rounded-lg border bg-white text-slate-900',
            'text-sm transition-colors duration-150',
            'placeholder:text-slate-400',
            // Padding — extra left padding if icon present
            Icon ? 'pl-10 pr-3 py-2.5' : 'px-3 py-2.5',
            // Border color: error state vs normal vs focus
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500',
            // Focus ring
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            // Disabled state
            disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed',
            inputClassName
          )}
        />
      </div>

      {/* Error message — shown when error prop is truthy */}
      {hasError && (
        <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Hint — shown when no error */}
      {!hasError && hint && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
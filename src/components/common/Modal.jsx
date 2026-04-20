import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Modal = ({
  isOpen,           // Controls visibility
  onClose,          // Called when user clicks backdrop or X
  title,            // Modal heading
  children,         // Modal body content
  footer,           // Optional footer (action buttons)
  size = 'md',      // 'sm' | 'md' | 'lg'
  closeOnBackdrop = true, // Whether clicking outside closes modal
}) => {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    // Backdrop — fixed overlay covering the entire viewport
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Semi-transparent background */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Modal panel — sits above the backdrop */}
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-xl w-full animate-slide-up',
          'max-h-[90vh] overflow-y-auto',
          sizes[size] || sizes.md
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-slate-900"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer — conditionally rendered */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2 border-t border-slate-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
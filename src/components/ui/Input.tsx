import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-slate mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-medium-gray">
              {leftIcon}
            </div>
          )}
          <input
            className={cn(
              'w-full rounded-lg border bg-white px-4 py-2 text-dark-slate placeholder:text-medium-gray',
              'focus:border-pastel-blue focus:outline-none focus:ring-2 focus:ring-pastel-blue focus:ring-opacity-20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-coral-accent focus:border-coral-accent focus:ring-coral-accent',
              !error && 'border-light-gray',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-medium-gray">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-coral-accent">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-medium-gray">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
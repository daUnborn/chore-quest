import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'bordered';
  noPadding?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', noPadding = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-2xl',
          !noPadding && 'p-4',
          variant === 'default' && 'shadow-card',
          variant === 'interactive' && 'shadow-card hover:shadow-modal transition-shadow duration-200 cursor-pointer',
          variant === 'bordered' && 'border-2 border-light-gray',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
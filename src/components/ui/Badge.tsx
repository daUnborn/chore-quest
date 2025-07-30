import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  default: 'bg-light-gray text-dark-slate',
  primary: 'bg-pastel-blue bg-opacity-20 text-pastel-blue',
  success: 'bg-mint-green bg-opacity-20 text-mint-green',
  warning: 'bg-sunshine-yellow bg-opacity-20 text-yellow-800',
  danger: 'bg-coral-accent bg-opacity-20 text-coral-accent',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
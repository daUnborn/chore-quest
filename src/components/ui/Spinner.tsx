import { cn } from '@/lib/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const colorClasses = {
  primary: 'text-pastel-blue',
  secondary: 'text-lavender-accent',
  white: 'text-white',
};

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  return (
    <div className={cn('inline-block', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
    </div>
  );
}
import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  animation = 'pulse',
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-light-gray',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        animation === 'pulse' && 'animate-pulse',
        animation === 'wave' && 'bg-gradient-to-r from-light-gray via-gray-200 to-light-gray bg-[length:200%_100%] animate-wave',
        className
      )}
    />
  );
}
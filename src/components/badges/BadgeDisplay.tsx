import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { Badge } from '@/types';
import { cn } from '@/lib/utils/cn';

interface BadgeDisplayProps {
  badge: Badge;
  earned: boolean;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onClick?: () => void;
}

export function BadgeDisplay({
  badge,
  earned,
  progress = 0,
  size = 'md',
  showProgress = true,
  onClick,
}: BadgeDisplayProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const tierColors = {
    bronze: 'from-orange-400 to-orange-600',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600',
  };

  return (
    <motion.div
      whileHover={earned ? { scale: 1.1 } : { scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'relative cursor-pointer',
        !earned && 'opacity-60'
      )}
    >
      {/* Badge Circle */}
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center',
          sizeClasses[size],
          earned
            ? `bg-gradient-to-br ${tierColors[badge.tier]} shadow-lg`
            : 'bg-gray-200'
        )}
      >
        {earned ? (
          <span>{badge.iconUrl}</span>
        ) : (
          <Lock className="h-6 w-6 text-gray-400" />
        )}

        {/* Progress Ring */}
        {!earned && showProgress && progress > 0 && (
          <svg
            className="absolute inset-0 transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-gray-300"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="text-pastel-blue transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Badge Name */}
      <p className={cn(
        'text-center mt-2 font-medium',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base'
      )}>
        {badge.name}
      </p>

      {/* Progress Text */}
      {!earned && showProgress && size !== 'sm' && (
        <p className="text-xs text-medium-gray text-center">
          {progress}%
        </p>
      )}
    </motion.div>
  );
}
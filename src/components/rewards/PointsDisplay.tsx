import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PointsDisplayProps {
  availablePoints: number;
  totalPoints: number;
  lifetimePoints: number;
  size?: 'sm' | 'md' | 'lg';
  showLifetime?: boolean;
  className?: string;
}

export function PointsDisplay({
  availablePoints,
  totalPoints,
  lifetimePoints,
  size = 'md',
  showLifetime = true,
  className,
}: PointsDisplayProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const getAchievementLevel = () => {
    if (lifetimePoints >= 1000) return { level: 'Gold', icon: '🏆', color: 'text-yellow-500' };
    if (lifetimePoints >= 500) return { level: 'Silver', icon: '🥈', color: 'text-gray-400' };
    if (lifetimePoints >= 100) return { level: 'Bronze', icon: '🥉', color: 'text-orange-600' };
    return { level: 'Rookie', icon: '🌟', color: 'text-pastel-blue' };
  };

  const achievement = getAchievementLevel();

  return (
    <div className={cn('bg-white rounded-2xl p-6 shadow-card', className)}>
      {/* Main Points Display */}
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-sunshine-yellow/20 rounded-full mb-4"
        >
          <Trophy className="h-12 w-12 text-sunshine-yellow" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('font-bold text-dark-slate mb-1', sizeClasses[size])}
        >
          {availablePoints}
        </motion.h2>
        <p className="text-medium-gray">Available Points</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-light-gray">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-coral-accent" />
            <span className="font-semibold text-dark-slate">{totalPoints}</span>
          </div>
          <p className="text-xs text-medium-gray">Total Earned</p>
        </div>
        
        {showLifetime && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className={achievement.color}>{achievement.icon}</span>
              <span className="font-semibold text-dark-slate">{lifetimePoints}</span>
            </div>
            <p className="text-xs text-medium-gray">{achievement.level} Status</p>
          </div>
        )}
      </div>
    </div>
  );
}
import { motion } from 'framer-motion';
import { Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  size?: 'sm' | 'md' | 'lg';
  showLongest?: boolean;
  className?: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  size = 'md',
  showLongest = true,
  className,
}: StreakDisplayProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const getStreakColor = () => {
    if (currentStreak >= 30) return 'text-purple-500';
    if (currentStreak >= 14) return 'text-orange-500';
    if (currentStreak >= 7) return 'text-yellow-500';
    if (currentStreak >= 3) return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <div className={cn('bg-white rounded-2xl p-6 shadow-card text-center', className)}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4"
      >
        <Flame className={cn('h-10 w-10', getStreakColor())} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('font-bold text-dark-slate mb-1', sizeClasses[size])}
      >
        {currentStreak}
      </motion.h2>
      <p className="text-medium-gray mb-4">Day Streak</p>

      {showLongest && longestStreak > 0 && (
        <div className="pt-4 border-t border-light-gray">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4 text-pastel-blue" />
            <span className="text-sm font-medium text-dark-slate">
              Longest: {longestStreak} days
            </span>
          </div>
        </div>
      )}

      {/* Motivational message */}
      {currentStreak > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-medium-gray mt-2"
        >
          {currentStreak >= 30 && "🎉 Incredible! You're unstoppable!"}
          {currentStreak >= 14 && currentStreak < 30 && "🌟 Amazing streak! Keep it up!"}
          {currentStreak >= 7 && currentStreak < 14 && "💪 One week strong!"}
          {currentStreak >= 3 && currentStreak < 7 && "🔥 You're on fire!"}
          {currentStreak < 3 && "👏 Great start!"}
        </motion.p>
      )}
    </div>
  );
}
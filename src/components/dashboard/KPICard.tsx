import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'purple';
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-pastel-blue',
  green: 'bg-mint-green',
  yellow: 'bg-sunshine-yellow',
  purple: 'bg-lavender-accent',
};

export function KPICard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  onClick,
}: KPICardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl p-4 text-white shadow-sm cursor-pointer',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm">
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className="text-white/60">{icon}</div>
      </div>
      <div className="absolute -bottom-2 -right-2 h-20 w-20 rounded-full bg-white/10" />
    </motion.div>
  );
}
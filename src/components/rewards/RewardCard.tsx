import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShoppingCart, Check, Package, Loader2 } from 'lucide-react';
import { Reward } from '@/types';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onClaim: (rewardId: string) => Promise<void>;
  isClaimed?: boolean;
  isRedeemed?: boolean;
}

export function RewardCard({ 
  reward, 
  userPoints, 
  onClaim, 
  isClaimed = false,
  isRedeemed = false 
}: RewardCardProps) {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const canAfford = userPoints >= reward.cost;
  const isParent = userProfile?.role === 'parent' || userProfile?.activeProfile === 'parent';
  
  // Calculate remaining stock
  const getRemainingStock = () => {
    if (reward.stock === undefined) return null;
    const claimed = reward.claimedBy.filter(c => !c.redeemedAt).length;
    return reward.stock - claimed;
  };
  
  const remainingStock = getRemainingStock();
  const isOutOfStock = remainingStock !== null && remainingStock <= 0;

  const handleClaim = async () => {
    if (!canAfford || isOutOfStock || isClaimed || isLoading) return;
    
    setIsLoading(true);
    try {
      await onClaim(reward.id);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to claim reward:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = () => {
    switch (reward.category) {
      case 'virtual': return 'bg-pastel-blue';
      case 'real-world': return 'bg-mint-green';
      case 'privilege': return 'bg-sunshine-yellow';
      default: return 'bg-medium-gray';
    }
  };

  const getCategoryIcon = () => {
    switch (reward.category) {
      case 'virtual': return '🎮';
      case 'real-world': return '🎁';
      case 'privilege': return '⭐';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        'bg-white rounded-2xl shadow-card overflow-hidden transition-all',
        isOutOfStock && 'opacity-60'
      )}
    >
      {/* Image/Icon Section */}
      <div className={cn(
        'h-32 flex items-center justify-center text-5xl',
        getCategoryColor()
      )}>
        {reward.imageUrl?.startsWith('http') ? (
          <img 
            src={reward.imageUrl} 
            alt={reward.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{reward.imageUrl || getCategoryIcon()}</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-dark-slate line-clamp-2">
            {reward.title}
          </h3>
          <Badge 
            variant={reward.category === 'virtual' ? 'primary' : 'success'} 
            size="sm"
          >
            {reward.category}
          </Badge>
        </div>

        {/* Description */}
        {reward.description && (
          <p className="text-sm text-medium-gray mb-3 line-clamp-2">
            {reward.description}
          </p>
        )}

        {/* Stock indicator */}
        {remainingStock !== null && (
          <div className="flex items-center gap-1 mb-3">
            <Package className="h-3 w-3 text-medium-gray" />
            <span className="text-xs text-medium-gray">
              {remainingStock > 0 ? `${remainingStock} left` : 'Out of stock'}
            </span>
          </div>
        )}

        {/* Cost and Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-dark-slate">
              {reward.cost}
            </span>
            <span className="text-sm text-medium-gray">points</span>
          </div>

          {!isParent && (
            <div className="relative">
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-mint-green rounded-lg"
                >
                  <Check className="h-5 w-5 text-white" />
                </motion.div>
              )}
              
              {isClaimed ? (
                <Badge 
                  variant={isRedeemed ? 'default' : 'warning'}
                  className="px-4 py-2"
                >
                  {isRedeemed ? 'Redeemed' : 'Claimed'}
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant={canAfford ? 'primary' : 'outline'}
                  onClick={handleClaim}
                  disabled={!canAfford || isOutOfStock || isLoading}
                  isLoading={isLoading}
                  leftIcon={
                    isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                    !canAfford ? <Lock className="h-4 w-4" /> : 
                    <ShoppingCart className="h-4 w-4" />
                  }
                >
                  {isLoading ? 'Claiming...' :
                   !canAfford ? 'Locked' : 
                   isOutOfStock ? 'Out of Stock' : 'Claim'}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Show claimed date if claimed */}
        {isClaimed && (
          <div className="mt-2 text-center">
            <p className="text-xs text-medium-gray">
              Claimed {new Date().toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
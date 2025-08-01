import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShoppingCart, Check, Package, Loader2, MoreVertical, Pause, Play, Trash2, Clock } from 'lucide-react';
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
  showActions?: boolean;
  activeTab?: 'shop' | 'inventory' | 'claimed';
  claimerName?: string;
  claimerAvatar?: string;
  claimTimestamp?: any; // For displaying claimed date
  claimUserId?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  onPause?: (rewardId: string) => Promise<void>;
  onDelete?: (rewardId: string) => Promise<void>;
  onApprove?: (rewardId: string, claimUserId: string) => Promise<void>;
  onReject?: (rewardId: string, claimUserId: string) => Promise<void>;
}

export function RewardCard({
  reward,
  userPoints,
  onClaim,
  isClaimed = false,
  isRedeemed = false,
  showActions = false,
  activeTab = 'shop',
  claimerName,
  claimerAvatar,
  claimTimestamp,
  claimUserId,
  approvalStatus = 'pending',
  onPause,
  onDelete,
  onApprove,
  onReject
}: RewardCardProps) {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

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
        'bg-white rounded-2xl shadow-card overflow-hidden transition-all relative',
        isOutOfStock && 'opacity-60',
        !reward.isActive && activeTab === 'shop' && 'opacity-75' // Only dim in shop tab
      )}
    >
      {/* Image/Icon Section */}
      <div className={cn(
        'h-32 flex items-center justify-center text-5xl relative',
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

        {/* Paused Overlay - Only show in shop tab */}
        {!reward.isActive && activeTab === 'shop' && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white/90 rounded-full px-3 py-1 flex items-center gap-2 shadow-sm">
              <Pause className="h-4 w-4 text-medium-gray" />
              <span className="text-sm font-medium text-dark-slate">Paused</span>
            </div>
          </div>
        )}

        {/* Parent Menu - Only show in shop tab */}
        {isParent && showActions && activeTab === 'shop' && (
          <div className="absolute top-2 right-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-light-gray rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                <button
                  onClick={() => {
                    onPause?.(reward.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  {reward.isActive ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause Reward
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Resume Reward
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    onDelete?.(reward.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-coral-accent"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Reward
                </button>
              </div>
            )}
          </div>
        )}

        {/* Claimer Info - Only show in claimed tab, positioned at top-left */}
        {activeTab === 'claimed' && claimerName && (
          <div className="absolute top-2 left-2 bg-white/90 rounded-full px-3 py-1 flex items-center gap-2 shadow-sm">
            {claimerAvatar && (
              <img
                src={claimerAvatar}
                alt={claimerName}
                className="w-5 h-5 rounded-full"
              />
            )}
            <span className="text-xs font-medium text-dark-slate">
              {claimerName}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-dark-slate line-clamp-2">
            {reward.title}
          </h3>
          <div className="flex items-center gap-2">
            <Badge
              variant={reward.category === 'virtual' ? 'primary' : 'success'}
              size="sm"
            >
              {reward.category}
            </Badge>
            {!reward.isActive && (
              <Badge variant="danger" size="sm">
                Paused
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {reward.description && (
          <p className="text-sm text-medium-gray mb-3 line-clamp-2">
            {reward.description}
          </p>
        )}

        {/* Claim timestamp for My Rewards tab */}
        {activeTab === 'inventory' && claimTimestamp && (
          <div className="flex items-center gap-1 mb-3">
            <Clock className="h-3 w-3 text-medium-gray" />
            <span className="text-xs text-medium-gray">
              Claimed {typeof claimTimestamp.toDate === 'function'
                ? claimTimestamp.toDate().toLocaleDateString()
                : new Date(claimTimestamp).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Claim timestamp for Family Claims tab */}
        {activeTab === 'claimed' && claimTimestamp && (
          <div className="flex items-center gap-1 mb-3">
            <Clock className="h-3 w-3 text-medium-gray" />
            <span className="text-xs text-medium-gray">
              Requested {typeof claimTimestamp.toDate === 'function'
                ? claimTimestamp.toDate().toLocaleDateString()
                : new Date(claimTimestamp).toLocaleDateString()}
            </span>
          </div>
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

          {/* Child claim actions */}
          {!isParent && activeTab !== 'claimed' && (
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
                  variant={canAfford && reward.isActive ? 'primary' : 'outline'}
                  onClick={handleClaim}
                  disabled={!canAfford || isOutOfStock || isLoading || !reward.isActive}
                  isLoading={isLoading}
                  leftIcon={
                    isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                      !reward.isActive ? <Pause className="h-4 w-4" /> :
                        !canAfford ? <Lock className="h-4 w-4" /> :
                          <ShoppingCart className="h-4 w-4" />
                  }
                >
                  {isLoading ? 'Claiming...' :
                    !reward.isActive ? 'Paused' :
                      !canAfford ? 'Locked' :
                        isOutOfStock ? 'Out of Stock' : 'Claim'}
                </Button>
              )}
            </div>
          )}

          {/* Parent approval actions for Family Claims tab */}
          {isParent && activeTab === 'claimed' && approvalStatus === 'pending' && claimUserId && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="success"
                onClick={async () => {
                  setIsApproving(true);
                  try {
                    console.log('Approve button clicked for reward:', reward.id, 'user:', claimUserId);
                    await onApprove?.(reward.id, claimUserId);
                  } catch (error) {
                    console.error('Error in approve button handler:', error);
                  } finally {
                    setIsApproving(false);
                  }
                }}
                disabled={isApproving || isRejecting}
                isLoading={isApproving}
              >
                {isApproving ? 'Approving...' : 'Approve'}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  setIsRejecting(true);
                  try {
                    console.log('Reject button clicked for reward:', reward.id, 'user:', claimUserId);
                    await onReject?.(reward.id, claimUserId);
                  } catch (error) {
                    console.error('Error in reject button handler:', error);
                  } finally {
                    setIsRejecting(false);
                  }
                }}
                disabled={isApproving || isRejecting}
                isLoading={isRejecting}
              >
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          )}

          {/* Status badge for inventory tab */}
          {activeTab === 'inventory' && approvalStatus && (
            <div className="mb-3">
              <Badge
                variant={
                  approvalStatus === 'approved' ? 'success' :
                    approvalStatus === 'rejected' ? 'danger' : 'warning'
                }
                size="sm"
              >
                {approvalStatus === 'approved' ? '✅ Approved' :
                  approvalStatus === 'rejected' ? '❌ Rejected' : '⏳ Pending Approval'}
              </Badge>
            </div>
          )}
        </div>

        {/* Show claimed date if claimed */}
        {isClaimed && activeTab === 'claimed' && (
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
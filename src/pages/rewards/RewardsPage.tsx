import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag, Gift } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RewardCard } from '@/components/rewards/RewardCard';
import { PointsDisplay } from '@/components/rewards/PointsDisplay';
import { CreateRewardModal } from '@/components/rewards/CreateRewardModal';
import { FAB } from '@/components/layout/FAB';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/layout/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useRewards } from '@/hooks/useRewards';
import { usePoints } from '@/hooks/usePoints';
import confetti from 'canvas-confetti';

export function RewardsPage() {
  const { userProfile } = useAuth();
  const { rewards, loading: rewardsLoading, claimReward, createReward } = useRewards();
  const { points, loading: pointsLoading, spendPoints } = usePoints();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  
  const isParent = userProfile?.role === 'parent';
  const isChild = userProfile?.role === 'child';

  // Get user's claimed rewards
  const myRewards = rewards.filter(reward =>
    reward.claimedBy.some(claim => claim.userId === userProfile?.id)
  );

  const handleClaimReward = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    try {
      // Spend points first
      const spendResult = await spendPoints(
        reward.cost,
        `Claimed: ${reward.title}`,
        rewardId
      );

      if (spendResult.error) {
        throw new Error(spendResult.error);
      }

      // Then claim the reward
      await claimReward(rewardId, points.availablePoints);

      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5DADE2', '#48C9B0', '#F4D03F'],
      });
    } catch (error) {
      console.error('Failed to claim reward:', error);
    }
  };

  if (rewardsLoading || pointsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <PageHeader
        title="Rewards Shop"
        rightActions={
          isChild && (
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-sunshine-yellow" />
              <span className="font-semibold">{points.availablePoints}</span>
            </div>
          )
        }
      />

      <div className="p-4 space-y-6">
        {/* Points Display for Child */}
        {isChild && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PointsDisplay
              availablePoints={points.availablePoints}
              totalPoints={points.totalPoints}
              lifetimePoints={points.lifetimePoints}
            />
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white rounded-lg p-1">
          <Button
            variant={activeTab === 'shop' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('shop')}
            className="flex-1"
            leftIcon={<ShoppingBag className="h-4 w-4" />}
          >
            Shop
          </Button>
          <Button
            variant={activeTab === 'inventory' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('inventory')}
            className="flex-1"
            leftIcon={<Gift className="h-4 w-4" />}
          >
            My Rewards ({myRewards.length})
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'shop' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <EmptyState
                    icon={<Gift className="h-12 w-12" />}
                    title="No rewards available"
                    description={isParent ? "Create rewards for your kids to claim" : "Check back later for new rewards!"}
                    action={isParent ? {
                      label: "Create First Reward",
                      onClick: () => setShowCreateModal(true),
                    } : undefined}
                  />
                </Card>
              </div>
            ) : (
              rewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RewardCard
                    reward={reward}
                    userPoints={points.availablePoints}
                    onClaim={handleClaimReward}
                    isClaimed={reward.claimedBy.some(c => c.userId === userProfile?.id)}
                  />
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRewards.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <EmptyState
                    icon={<Gift className="h-12 w-12" />}
                    title="No rewards claimed yet"
                    description="Visit the shop to claim your first reward!"
                    action={{
                      label: "Go to Shop",
                      onClick: () => setActiveTab('shop'),
                    }}
                  />
                </Card>
              </div>
            ) : (
              myRewards.map((reward, index) => {
                const claim = reward.claimedBy.find(c => c.userId === userProfile?.id);
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <RewardCard
                      reward={reward}
                      userPoints={points.availablePoints}
                      onClaim={handleClaimReward}
                      isClaimed={true}
                      isRedeemed={claim?.redeemedAt !== undefined}
                    />
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* FAB for Parents */}
      {isParent && (
        <FAB
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="h-6 w-6" />}
          label="Add Reward"
        />
      )}

      {/* Create Reward Modal */}
      <CreateRewardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createReward}
      />
    </div>
  );
}
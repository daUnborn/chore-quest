import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag, Gift, Trophy } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FAB } from '@/components/layout/FAB';
import { Button } from '@/components/ui/Button';
import { RewardCard } from '@/components/rewards/RewardCard';
import { CreateRewardModal } from '@/components/rewards/CreateRewardModal';
import { useAuth } from '@/contexts/AuthContext';
import { useRewards } from '@/hooks/useRewards';
import { EmptyState } from '@/components/layout/EmptyState';

export function RewardsPage() {
  const { userProfile } = useAuth();
  const {
    rewards,
    userClaimedRewards,
    loading,
    error,
    createReward,
    claimReward,
    deleteReward,
    userPoints, // Use this instead of getUserPoints()
    hasClaimedReward,
    isRewardRedeemed,
  } = useRewards();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  const [claimingReward, setClaimingReward] = useState<string | null>(null);
  
  const isParent = userProfile?.role === 'parent' || userProfile?.activeProfile === 'parent';

  console.log('RewardsPage - User points:', userPoints);
  console.log('RewardsPage - Is parent:', isParent);
  console.log('RewardsPage - Active profile:', userProfile?.activeProfile);

  const handleCreateReward = async (rewardData: any) => {
    try {
      await createReward(rewardData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create reward:', error);
      // TODO: Show error toast
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    setClaimingReward(rewardId);
    try {
      const result = await claimReward(rewardId);
      if (!result.success) {
        // TODO: Show error toast with result.message
        console.error('Failed to claim reward:', result.message);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      // TODO: Show error toast
    } finally {
      setClaimingReward(null);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    try {
      await deleteReward(rewardId);
    } catch (error) {
      console.error('Failed to delete reward:', error);
      // TODO: Show error toast
    }
  };

  // Filter rewards for shop tab
  const shopRewards = rewards.filter(reward => reward.isActive);

  // Get user's claimed rewards with claim info
  const myRewards = userClaimedRewards.map(reward => ({
    ...reward,
    isClaimed: hasClaimedReward(reward.id),
    isRedeemed: isRewardRedeemed(reward.id),
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray pb-20">
        <PageHeader title="Rewards Shop" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-blue"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-gray pb-20">
        <PageHeader title="Rewards Shop" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-coral-accent mb-4">Error loading rewards: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <PageHeader
        title="Rewards Shop"
        rightActions={
          !isParent && (
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-sunshine-yellow" />
              <span className="font-semibold">{userPoints}</span>
            </div>
          )
        }
      />

      <div className="p-4 space-y-6">
        {/* Points Display for Child */}
        {!isParent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-pastel-blue to-mint-green rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Your Points</h2>
                <p className="text-white/80 text-sm">Keep earning to unlock more rewards!</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{userPoints}</div>
                <div className="text-white/80 text-sm">Available</div>
              </div>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shopRewards.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={<Gift className="h-16 w-16" />}
                  title="No rewards available"
                  description={
                    isParent ? "Create rewards for your kids to claim" : "Check back later for new rewards!"
                  }
                  action={
                    isParent ? {
                      label: "Create First Reward",
                      onClick: () => setShowCreateModal(true)
                    } : undefined
                  }
                />
              </div>
            ) : (
              shopRewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RewardCard
                    reward={reward}
                    userPoints={userPoints}
                    onClaim={handleClaimReward}
                    isClaimed={hasClaimedReward(reward.id)}
                    isRedeemed={isRewardRedeemed(reward.id)}
                  />
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRewards.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={<Gift className="h-16 w-16" />}
                  title="No rewards claimed yet"
                  description="Visit the shop to claim your first reward!"
                  action={{
                    label: "Go to Shop",
                    onClick: () => setActiveTab('shop')
                  }}
                />
              </div>
            ) : (
              myRewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RewardCard
                    reward={reward}
                    userPoints={userPoints}
                    onClaim={() => {}} // Already claimed, no action needed
                    isClaimed={true}
                    isRedeemed={reward.isRedeemed}
                  />
                </motion.div>
              ))
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
        onSubmit={handleCreateReward}
      />
    </div>
  );
}
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag, Gift, Trophy } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FAB } from '@/components/layout/FAB';
import { Button } from '@/components/ui/Button';
import { RewardCard } from '@/components/rewards/RewardCard';
import { CreateRewardModal } from '@/components/rewards/CreateRewardModal';
import { RewardsFilter, RewardFilters } from '@/components/rewards/RewardsFilter';
import { RewardsPagination } from '@/components/rewards/RewardsPagination';
import { useAuth } from '@/contexts/AuthContext';
import { useRewards } from '@/hooks/useRewards';
import { EmptyState } from '@/components/layout/EmptyState';
import { Reward } from '@/types';

const ITEMS_PER_PAGE = 20;

export function RewardsPage() {
  const { userProfile, currentUser } = useAuth();
  const {
    rewards,
    userClaimedRewards,
    allClaimedRewards,
    loading,
    error,
    createReward,
    claimReward,
    pauseReward,
    deleteReward,
    approveReward,
    rejectReward,
    userPoints,
    hasClaimedReward,
    isRewardRedeemed,
  } = useRewards();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory' | 'claimed'>('shop');
  const [claimingReward, setClaimingReward] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const isParent = userProfile?.role === 'parent' || userProfile?.activeProfile === 'parent';

  // Initialize filters with today's date
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  
  const [filters, setFilters] = useState<RewardFilters>({
    dateRange: { start: getTodayDate(), end: getTodayDate() },
    status: 'all',
    userId: null,
    userName: null,
  });

  // Reset filters when switching profiles
  useEffect(() => {
    setFilters({
      dateRange: { start: getTodayDate(), end: getTodayDate() },
      status: 'all',
      userId: null,
      userName: null,
    });
    setCurrentPage(1);
  }, [userProfile?.activeProfile]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, activeTab]);

  // Get family members for filtering
  const getFamilyMembers = () => {
    const members: { id: string; name: string; avatar?: string }[] = [];

    if (userProfile) {
      members.push({
        id: 'parent',
        name: userProfile.displayName,
        avatar: userProfile.avatar
      });
    }

    if (userProfile?.childProfiles) {
      userProfile.childProfiles.forEach(child => {
        members.push({
          id: child.id,
          name: child.name,
          avatar: child.avatar
        });
      });
    }

    return members;
  };

  const familyMembers = getFamilyMembers();

  // Filter function for rewards based on date, status, and user
  const filterRewards = (rewardsList: any[], includeClaimInfo = false) => {
    return rewardsList.filter(reward => {
      // Date filtering
      const claimDate = includeClaimInfo && reward.claimInfo 
        ? (typeof reward.claimInfo.claimedAt.toDate === 'function' 
           ? reward.claimInfo.claimedAt.toDate() 
           : new Date(reward.claimInfo.claimedAt))
        : reward.createdAt;
      
      const filterStart = new Date(filters.dateRange.start);
      const filterEnd = new Date(filters.dateRange.end);
      filterEnd.setHours(23, 59, 59, 999); // Include full end date
      
      const itemDate = claimDate instanceof Date ? claimDate : new Date(claimDate);
      
      if (itemDate < filterStart || itemDate > filterEnd) {
        return false;
      }

      // Status filtering
      if (filters.status !== 'all') {
        const itemStatus = includeClaimInfo && reward.claimInfo 
          ? reward.claimInfo.approvalStatus || 'pending'
          : 'approved'; // Shop items are considered "approved"
        
        if (itemStatus !== filters.status) {
          return false;
        }
      }

      // User filtering (parent only)
      if (isParent && filters.userId) {
        if (includeClaimInfo && reward.claimInfo) {
          if (reward.claimInfo.userId !== filters.userId) {
            return false;
          }
        } else {
          // For shop items, no user-specific filtering needed
          return true;
        }
      }

      return true;
    });
  };

  // Shop tab rewards with filtering and pagination
  const filteredShopRewards = useMemo(() => {
    const shopList = isParent ? rewards : rewards.filter(reward => reward.isActive);
    return filterRewards(shopList);
  }, [rewards, isParent, filters]);

  const paginatedShopRewards = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredShopRewards.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredShopRewards, currentPage]);

  // My Rewards tab with filtering
  const filteredMyRewards = useMemo(() => {
    if (isParent) return [];
    
    const myRewardsList = rewards
      .filter(reward => 
        reward.claimedBy.some(claim => 
          claim.userId === (userProfile?.activeProfile === 'parent' ? currentUser?.uid : userProfile?.activeProfile)
        )
      )
      .map(reward => {
        const userClaim = reward.claimedBy.find(claim => 
          claim.userId === (userProfile?.activeProfile === 'parent' ? currentUser?.uid : userProfile?.activeProfile)
        );
        return {
          ...reward,
          isClaimed: true,
          isRedeemed: userClaim?.approvalStatus === 'approved',
          claimInfo: userClaim,
          approvalStatus: userClaim?.approvalStatus || 'pending',
        };
      });

    return filterRewards(myRewardsList, true);
  }, [rewards, userProfile?.activeProfile, currentUser?.uid, isParent, filters]);

  const paginatedMyRewards = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMyRewards.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMyRewards, currentPage]);

  // Family Claims with filtering
  const filteredClaimedRewards = useMemo(() => {
    const claimedList = rewards
      .flatMap(reward => 
        reward.claimedBy.map(claim => ({
          ...reward,
          isClaimed: true,
          isRedeemed: claim.approvalStatus === 'approved',
          claimerName: claim.userName || 'Unknown User',
          claimerAvatar: claim.userAvatar,
          claimInfo: claim,
          approvalStatus: claim.approvalStatus || 'pending',
        }))
      );

    return filterRewards(claimedList, true).sort((a, b) => {
      const aTime = typeof a.claimInfo.claimedAt.toDate === 'function' 
        ? a.claimInfo.claimedAt.toDate().getTime()
        : new Date(a.claimInfo.claimedAt).getTime();
      const bTime = typeof b.claimInfo.claimedAt.toDate === 'function' 
        ? b.claimInfo.claimedAt.toDate().getTime()
        : new Date(b.claimInfo.claimedAt).getTime();
      return bTime - aTime;
    });
  }, [rewards, filters]);

  const paginatedClaimedRewards = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClaimedRewards.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClaimedRewards, currentPage]);

  // Event handlers
  const handleCreateReward = async (rewardData: any) => {
    try {
      await createReward(rewardData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create reward:', error);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    setClaimingReward(rewardId);
    try {
      const result = await claimReward(rewardId);
      if (!result.success) {
        console.error('Failed to claim reward:', result.message);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setClaimingReward(null);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this reward? This action cannot be undone.')) {
      try {
        await deleteReward(rewardId);
      } catch (error) {
        console.error('Failed to delete reward:', error);
      }
    }
  };

  const handlePauseReward = async (rewardId: string) => {
    try {
      await pauseReward(rewardId);
    } catch (error) {
      console.error('Failed to pause reward:', error);
    }
  };

  // Get current data and pagination info for active tab
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'shop':
        return {
          data: paginatedShopRewards,
          total: filteredShopRewards.length
        };
      case 'inventory':
        return {
          data: paginatedMyRewards,
          total: filteredMyRewards.length
        };
      case 'claimed':
        return {
          data: paginatedClaimedRewards,
          total: filteredClaimedRewards.length
        };
      default:
        return { data: [], total: 0 };
    }
  };

  const { data: currentTabData, total: currentTabTotal } = getCurrentTabData();
  const totalPages = Math.ceil(currentTabTotal / ITEMS_PER_PAGE);

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
            <Button onClick={() => window.location.reload()}>Retry</Button>
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
        <div className="flex gap-1 bg-white rounded-lg p-1">
          <Button
            variant={activeTab === 'shop' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('shop')}
            className="flex-1"
            leftIcon={<ShoppingBag className="h-4 w-4" />}
            size="sm"
          >
            Shop ({filteredShopRewards.length})
          </Button>
          {!isParent && (
            <Button
              variant={activeTab === 'inventory' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('inventory')}
              className="flex-1"
              leftIcon={<Gift className="h-4 w-4" />}
              size="sm"
            >
              My Rewards ({filteredMyRewards.length})
            </Button>
          )}
          {isParent && (
            <Button
              variant={activeTab === 'claimed' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('claimed')}
              className="flex-1"
              leftIcon={<Trophy className="h-4 w-4" />}
              size="sm"
            >
              Family Claims ({filteredClaimedRewards.length})
            </Button>
          )}
        </div>

        {/* Filters */}
        <RewardsFilter
          filters={filters}
          onFiltersChange={setFilters}
          isParent={isParent}
          familyMembers={familyMembers}
        />

        {/* Content */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {currentTabData.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon={<Gift className="h-16 w-16" />}
                    title={isParent ? "No rewards found" : "No rewards available"}
                    description={
                      isParent ? "Try adjusting your filters or create new rewards" : "Check back later or adjust your filters!"
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
                currentTabData.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <RewardCard
                      reward={reward}
                      userPoints={userPoints}
                      onClaim={isParent ? () => {} : handleClaimReward}
                      isClaimed={false}
                      isRedeemed={false}
                      showActions={true}
                      activeTab="shop"
                      onPause={handlePauseReward}
                      onDelete={handleDeleteReward}
                    />
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Pagination for Shop */}
            <RewardsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={currentTabTotal}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {activeTab === 'inventory' && !isParent && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {currentTabData.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon={<Gift className="h-16 w-16" />}
                    title="No rewards found"
                    description="Try adjusting your filters or claim some rewards from the shop!"
                    action={{
                      label: "Browse Shop",
                      onClick: () => setActiveTab('shop')
                    }}
                  />
                </div>
              ) : (
                currentTabData.map((reward, index) => (
                  <motion.div
                    key={`my-${reward.id}-${reward.claimInfo?.userId}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <RewardCard
                      reward={reward}
                      userPoints={userPoints}
                      onClaim={() => {}}
                      isClaimed={true}
                      isRedeemed={reward.isRedeemed}
                      showActions={false}
                      activeTab="inventory"
                      approvalStatus={reward.approvalStatus}
                      claimTimestamp={reward.claimInfo?.claimedAt}
                    />
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Pagination for My Rewards */}
            <RewardsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={currentTabTotal}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {activeTab === 'claimed' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {currentTabData.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon={<Trophy className="h-16 w-16" />}
                    title="No claims found"
                    description="Try adjusting your filters or encourage family members to claim rewards!"
                  />
                </div>
              ) : (
                currentTabData.map((reward, index) => (
                  <motion.div
                    key={`claimed-${reward.id}-${reward.claimInfo?.userId}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <RewardCard
                      reward={reward}
                      userPoints={userPoints}
                      onClaim={() => {}}
                      isClaimed={true}
                      isRedeemed={reward.isRedeemed}
                      showActions={false}
                      activeTab="claimed"
                      claimerName={reward.claimerName}
                      claimerAvatar={reward.claimerAvatar}
                      claimUserId={reward.claimInfo?.userId}
                      approvalStatus={reward.approvalStatus}
                      claimTimestamp={reward.claimInfo?.claimedAt}
                      onApprove={approveReward}
                      onReject={rejectReward}
                    />
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Pagination for Family Claims */}
            <RewardsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={currentTabTotal}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
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
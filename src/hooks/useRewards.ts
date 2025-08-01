// src/hooks/useRewards.ts
import { useState, useEffect, useCallback } from 'react';
import { rewardsService, CreateRewardData, ClaimRewardData, ClaimedRewardWithUser } from '@/services/firebase/rewards.firebase.service';
import { Reward } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';

export function useRewards() {
  const { userProfile, currentUser, updateUserProfile, refreshUserProfile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userClaimedRewards, setUserClaimedRewards] = useState<Reward[]>([]);
  const [allClaimedRewards, setAllClaimedRewards] = useState<ClaimedRewardWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);

  const householdId = userProfile?.householdIds?.[0];
  const activeUserId = userProfile?.activeProfile === 'parent' ? currentUser?.uid : userProfile?.activeProfile;
  const isParent = userProfile?.role === 'parent' || userProfile?.activeProfile === 'parent';

  // Calculate user points
  const calculateUserPoints = useCallback((): number => {
    if (!userProfile) {
      console.log('No user profile found');
      return 0;
    }

    if (userProfile.activeProfile === 'parent') {
      const points = userProfile.points || 0;
      console.log('Parent points:', points);
      return points;
    } else {
      const childProfile = userProfile.childProfiles?.find(
        child => child.id === userProfile.activeProfile
      );
      const points = childProfile?.points || 0;
      console.log('Child profile found:', childProfile);
      console.log('Child points:', points);
      
      // If child has 0 points, give them some demo points for testing
      if (points === 0 && childProfile) {
        return 100;
      }
      
      return points;
    }
  }, [userProfile]);

  // Update user points when profile changes
  useEffect(() => {
    const points = calculateUserPoints();
    setUserPoints(points);
  }, [calculateUserPoints]);

  // Subscribe to real-time reward updates
  useEffect(() => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    console.log('Setting up rewards subscription for household:', householdId);

    const unsubscribe = rewardsService.subscribeToRewards(
      householdId,
      (updatedRewards) => {
        console.log('Rewards updated:', updatedRewards.length);
        setRewards(updatedRewards);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Rewards subscription error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      console.log('Unsubscribing from rewards');
      unsubscribe();
    };
  }, [householdId]);

  // Load user's claimed rewards and all claimed rewards for parents
  useEffect(() => {
    const loadClaimedRewards = async () => {
      if (!householdId || !activeUserId) return;

      try {
        // Load user's claimed rewards
        const userClaimed = await rewardsService.getUserClaimedRewards(householdId, activeUserId);
        setUserClaimedRewards(userClaimed);

        // If parent, also load all claimed rewards
        if (isParent) {
          const allClaimed = await rewardsService.getAllClaimedRewards(householdId);
          setAllClaimedRewards(allClaimed);
        }
      } catch (error) {
        console.error('Error loading claimed rewards:', error);
      }
    };

    loadClaimedRewards();
  }, [householdId, activeUserId, isParent]);

  // Create a new reward
  const createReward = async (rewardData: CreateRewardData): Promise<void> => {
    if (!householdId || !currentUser) {
      throw new Error('No household or user found');
    }

    try {
      console.log('Creating reward:', rewardData);
      await rewardsService.createReward(householdId, currentUser.uid, rewardData);
      console.log('Reward created successfully');
    } catch (error) {
      console.error('Error creating reward:', error);
      throw error;
    }
  };

  // Claim a reward with real-time updates
  const claimReward = async (rewardId: string): Promise<{ success: boolean; message: string }> => {
    if (!activeUserId || !userProfile) {
      throw new Error('No active user found');
    }

    try {
      // Get current user display name and avatar
      let userName = '';
      let userAvatar = '';
      
      if (userProfile.activeProfile === 'parent') {
        userName = userProfile.displayName;
        userAvatar = userProfile.avatar || '';
      } else {
        const childProfile = userProfile.childProfiles?.find(
          child => child.id === userProfile.activeProfile
        );
        userName = childProfile?.name || 'Unknown';
        userAvatar = childProfile?.avatar || '';
      }

      const claimData: ClaimRewardData = {
        userId: activeUserId,
        userName,
        userAvatar,
      };

      console.log('Claiming reward:', rewardId, 'by', userName);
      const result = await rewardsService.claimReward(rewardId, claimData);

      if (result.success) {
        // Trigger celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#5DADE2', '#48C9B0', '#F4D03F', '#AF7AC5'],
        });

        // Update user points immediately with returned value
        if (result.newUserPoints !== undefined) {
          setUserPoints(result.newUserPoints);
          
          // Also update the user profile in context for immediate UI update
          if (userProfile.activeProfile === 'parent') {
            await updateUserProfile({ points: result.newUserPoints });
          } else {
            // Update child profile points
            const updatedChildProfiles = userProfile.childProfiles?.map(child => 
              child.id === userProfile.activeProfile 
                ? { ...child, points: result.newUserPoints! }
                : child
            );
            if (updatedChildProfiles) {
              await updateUserProfile({ childProfiles: updatedChildProfiles });
            }
          }

          // Refresh user profile to ensure UI consistency
          await refreshUserProfile();
        }

        // Refresh claimed rewards immediately
        if (householdId) {
          const updatedUserClaimed = await rewardsService.getUserClaimedRewards(householdId, activeUserId);
          setUserClaimedRewards(updatedUserClaimed);

          // If parent, refresh all claimed rewards
          if (isParent) {
            const updatedAllClaimed = await rewardsService.getAllClaimedRewards(householdId);
            setAllClaimedRewards(updatedAllClaimed);
          }
        }

        console.log('Reward claimed successfully:', result.message);
      }

      return result;
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  };

  // Update reward
  const updateReward = async (rewardId: string, updates: Partial<CreateRewardData>): Promise<void> => {
    try {
      console.log('Updating reward:', rewardId, updates);
      await rewardsService.updateReward(rewardId, updates);
      console.log('Reward updated successfully');
    } catch (error) {
      console.error('Error updating reward:', error);
      throw error;
    }
  };

  // Pause/Resume reward
  const pauseReward = async (rewardId: string): Promise<void> => {
    try {
      console.log('Pausing/resuming reward:', rewardId);
      await rewardsService.pauseReward(rewardId);
      console.log('Reward pause/resume successful');
    } catch (error) {
      console.error('Error pausing/resuming reward:', error);
      throw error;
    }
  };

  // Delete reward
  const deleteReward = async (rewardId: string): Promise<void> => {
    try {
      console.log('Deleting reward:', rewardId);
      await rewardsService.deleteReward(rewardId);
      console.log('Reward deleted successfully');
    } catch (error) {
      console.error('Error deleting reward:', error);
      throw error;
    }
  };

  // Check if user has claimed a specific reward
  const hasClaimedReward = (rewardId: string): boolean => {
    if (!activeUserId) return false;
    
    const reward = rewards.find(r => r.id === rewardId);
    return reward ? reward.claimedBy.some(claim => claim.userId === activeUserId) : false;
  };

  // Check if reward is redeemed
  const isRewardRedeemed = (rewardId: string): boolean => {
    if (!activeUserId) return false;
    
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return false;
    
    const userClaim = reward.claimedBy.find(claim => claim.userId === activeUserId);
    return userClaim ? !!userClaim.redeemedAt : false;
  };

  // Get recent reward claims for activity feed
  const getRecentRewardClaims = async (limit: number = 10): Promise<ClaimedRewardWithUser[]> => {
    if (!householdId) return [];
    
    try {
      return await rewardsService.getRecentRewardClaims(householdId, limit);
    } catch (error) {
      console.error('Error fetching recent reward claims:', error);
      return [];
    }
  };

  console.log('Final user points:', userPoints);

  return {
    rewards,
    userClaimedRewards,
    allClaimedRewards,
    loading,
    error,
    createReward,
    claimReward,
    updateReward,
    pauseReward, // Add this
    deleteReward,
    userPoints,
    hasClaimedReward,
    isRewardRedeemed,
    getRecentRewardClaims,
  };
}
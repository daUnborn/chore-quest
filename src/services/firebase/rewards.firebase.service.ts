// src/services/firebase/rewards.firebase.service.ts
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  updateDoc,
  onSnapshot,
  Unsubscribe,
  deleteDoc,
  Timestamp, // Add this
  arrayUnion
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Reward, ClaimRecord } from '@/types';

export interface CreateRewardData {
  title: string;
  description?: string;
  cost: number;
  category: 'virtual' | 'real-world' | 'privilege';
  imageUrl?: string;
  stock?: number;
}

export interface ClaimRewardData {
  userId: string;
  userName: string;
  userAvatar?: string;
}

export interface ClaimedRewardWithUser extends Reward {
  claimInfo: ClaimRecord & {
    userName: string;
    userAvatar?: string;
  };
}

class RewardsService {

  // Get all rewards for a household (parents see all, children only see active)
  async getRewards(householdId: string, includeInactive: boolean = false): Promise<Reward[]> {
    try {
      let q;

      if (includeInactive) {
        // Parents see all rewards (active and paused)
        q = query(
          collection(db, COLLECTIONS.REWARDS),
          where('householdId', '==', householdId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Children only see active rewards
        q = query(
          collection(db, COLLECTIONS.REWARDS),
          where('householdId', '==', householdId),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reward));
    } catch (error) {
      console.error('Error fetching rewards:', error);
      throw new Error('Failed to fetch rewards');
    }
  }

  // Subscribe to real-time reward updates
  subscribeToRewards(
    householdId: string,
    includeInactive: boolean = false,
    callback: (rewards: Reward[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      let q;

      if (includeInactive) {
        // Parents see all rewards
        q = query(
          collection(db, COLLECTIONS.REWARDS),
          where('householdId', '==', householdId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Children only see active rewards
        q = query(
          collection(db, COLLECTIONS.REWARDS),
          where('householdId', '==', householdId),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
      }

      return onSnapshot(q,
        (snapshot) => {
          const rewards = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Reward));
          callback(rewards);
        },
        (error) => {
          console.error('Error in rewards subscription:', error);
          onError?.(new Error('Failed to subscribe to rewards'));
        }
      );
    } catch (error) {
      console.error('Error setting up rewards subscription:', error);
      onError?.(new Error('Failed to set up real-time updates'));
      return () => { }; // Return empty unsubscribe function
    }
  }

  // Create a new reward
  async createReward(householdId: string, createdBy: string, rewardData: CreateRewardData): Promise<Reward> {
    try {
      const docRef = doc(collection(db, COLLECTIONS.REWARDS));

      // Build the reward object, only including defined values
      const newReward: any = {
        householdId,
        title: rewardData.title,
        cost: rewardData.cost,
        category: rewardData.category,
        imageUrl: rewardData.imageUrl || this.getDefaultIcon(rewardData.category),
        isActive: true,
        createdBy,
        createdAt: new Date(),
        claimedBy: [],
      };

      // Only add optional fields if they have values
      if (rewardData.description && rewardData.description.trim()) {
        newReward.description = rewardData.description.trim();
      }

      if (rewardData.stock !== undefined && rewardData.stock > 0) {
        newReward.stock = rewardData.stock;
      }

      console.log('Creating reward with data:', newReward);

      await setDoc(docRef, newReward);

      return {
        id: docRef.id,
        ...newReward
      };
    } catch (error) {
      console.error('Error creating reward:', error);
      throw new Error('Failed to create reward');
    }
  }

  // Claim a reward (spend points) - UPDATED to return user's new points
  async claimReward(rewardId: string, claimData: ClaimRewardData): Promise<{
    success: boolean;
    message: string;
    newUserPoints?: number;
    claimRecord?: ClaimRecord & { userName: string; userAvatar?: string };
  }> {
    try {
      const rewardRef = doc(db, COLLECTIONS.REWARDS, rewardId);
      const rewardDoc = await getDoc(rewardRef);

      if (!rewardDoc.exists()) {
        throw new Error('Reward not found');
      }

      const reward = { id: rewardDoc.id, ...rewardDoc.data() } as Reward;

      // Check if reward is available
      if (!reward.isActive) {
        return { success: false, message: 'Reward is no longer available' };
      }

      // Get user's current points
      const userRef = doc(db, COLLECTIONS.USERS, claimData.userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentPoints = userData.points || 0;

      // Check if user has enough points
      if (currentPoints < reward.cost) {
        return {
          success: false,
          message: `Not enough points. You need ${reward.cost - currentPoints} more points.`
        };
      }

      const newUserPoints = currentPoints - reward.cost;

      // Create enhanced claim record with user info
      const claimRecord: ClaimRecord & { userName: string; userAvatar?: string } = {
        userId: claimData.userId,
        userName: claimData.userName,
        userAvatar: claimData.userAvatar,
        claimedAt: Timestamp.now(),
        approvalStatus: 'pending',
      };

      // Update reward with claim
      await updateDoc(rewardRef, {
        claimedBy: arrayUnion(claimRecord)
      });

      // Deduct points from user
      await updateDoc(userRef, {
        points: newUserPoints,
        lastRewardClaimedAt: new Date(),
      });

      // If this is a child profile, also update parent's childProfiles array
      if (userData.parentId) {
        await this.updateParentChildProfile(userData.parentId, claimData.userId, {
          points: newUserPoints,
        });
      }

      console.log(`Reward claimed: ${reward.title} by ${claimData.userName} for ${reward.cost} points`);

      return {
        success: true,
        message: `Successfully claimed "${reward.title}" for ${reward.cost} points!`,
        newUserPoints,
        claimRecord
      };

    } catch (error) {
      console.error('Error claiming reward:', error);
      throw new Error('Failed to claim reward');
    }
  }

  // Get all claimed rewards for a household (for parents to see all claims)
  async getAllClaimedRewards(householdId: string): Promise<ClaimedRewardWithUser[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REWARDS),
        where('householdId', '==', householdId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const claimedRewards: ClaimedRewardWithUser[] = [];

      snapshot.docs.forEach(doc => {
        const reward = { id: doc.id, ...doc.data() } as Reward;

        // For each claim, create a separate entry
        reward.claimedBy.forEach(claim => {
          claimedRewards.push({
            ...reward,
            claimInfo: claim as ClaimRecord & { userName: string; userAvatar?: string }
          });
        });
      });

      // Sort by claim date (most recent first)
      return claimedRewards.sort((a, b) => {
        const aTime = a.claimInfo.claimedAt instanceof Date
          ? a.claimInfo.claimedAt.getTime()
          : a.claimInfo.claimedAt.toDate().getTime();
        const bTime = b.claimInfo.claimedAt instanceof Date
          ? b.claimInfo.claimedAt.getTime()
          : b.claimInfo.claimedAt.toDate().getTime();
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error fetching all claimed rewards:', error);
      throw new Error('Failed to fetch claimed rewards');
    }
  }

  // Update child profile data in parent's document
  private async updateParentChildProfile(parentId: string, childId: string, updates: any): Promise<void> {
    try {
      const parentRef = doc(db, COLLECTIONS.USERS, parentId);
      const parentDoc = await getDoc(parentRef);

      if (parentDoc.exists()) {
        const parentData = parentDoc.data();
        const childProfiles = parentData.childProfiles || [];

        const updatedProfiles = childProfiles.map((child: any) =>
          child.id === childId ? { ...child, ...updates } : child
        );

        await updateDoc(parentRef, {
          childProfiles: updatedProfiles
        });

        console.log(`Updated child profile ${childId} in parent ${parentId}`);
      }
    } catch (error) {
      console.error('Error updating parent child profile:', error);
    }
  }

  // Get rewards claimed by a specific user - shows ALL available rewards with claim status
  async getUserClaimedRewards(householdId: string, userId: string): Promise<Reward[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REWARDS),
        where('householdId', '==', householdId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      const allRewards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));

      // Return all rewards, but mark which ones the user has claimed
      return allRewards.map(reward => ({
        ...reward,
        userHasClaimed: reward.claimedBy.some(claim => claim.userId === userId)
      }));
    } catch (error) {
      console.error('Error fetching user claimed rewards:', error);
      throw new Error('Failed to fetch claimed rewards');
    }
  }

  // Get recent reward claims for activity feed (last 10)
  async getRecentRewardClaims(householdId: string, limit: number = 10): Promise<ClaimedRewardWithUser[]> {
    try {
      const allClaimed = await this.getAllClaimedRewards(householdId);
      return allClaimed.slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent reward claims:', error);
      throw new Error('Failed to fetch recent reward claims');
    }
  }

  // Update reward
  async updateReward(rewardId: string, updates: Partial<CreateRewardData>): Promise<void> {
    try {
      const rewardRef = doc(db, COLLECTIONS.REWARDS, rewardId);

      // Clean the updates object to remove undefined values
      const cleanUpdates: any = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'description' && typeof value === 'string' && value.trim()) {
            cleanUpdates[key] = value.trim();
          } else if (key !== 'description') {
            cleanUpdates[key] = value;
          }
        }
      });

      await updateDoc(rewardRef, cleanUpdates);
    } catch (error) {
      console.error('Error updating reward:', error);
      throw new Error('Failed to update reward');
    }
  }

  // Pause/Resume a reward (toggle isActive status)
  async pauseReward(rewardId: string): Promise<void> {
    try {
      const rewardRef = doc(db, COLLECTIONS.REWARDS, rewardId);
      const rewardDoc = await getDoc(rewardRef);

      if (!rewardDoc.exists()) {
        throw new Error('Reward not found');
      }

      const currentStatus = rewardDoc.data().isActive;
      await updateDoc(rewardRef, {
        isActive: !currentStatus,
        pausedAt: !currentStatus ? null : new Date(),
        resumedAt: currentStatus ? null : new Date()
      });

      console.log(`Reward ${currentStatus ? 'paused' : 'resumed'}: ${rewardId}`);
    } catch (error) {
      console.error('Error pausing/resuming reward:', error);
      throw new Error('Failed to pause/resume reward');
    }
  }

  // Permanently delete reward
  async deleteReward(rewardId: string): Promise<void> {
    try {
      const rewardRef = doc(db, COLLECTIONS.REWARDS, rewardId);
      await deleteDoc(rewardRef);
      console.log(`Reward permanently deleted: ${rewardId}`);
    } catch (error) {
      console.error('Error deleting reward:', error);
      throw new Error('Failed to delete reward');
    }
  }

  // Get default icon for category
  private getDefaultIcon(category: string): string {
    switch (category) {
      case 'virtual': return '🎮';
      case 'real-world': return '🎁';
      case 'privilege': return '⭐';
      default: return '🎁';
    }
  }

  // Approve a claimed reward
  async approveClaimedReward(rewardId: string, claimUserId: string, approvedBy: string): Promise<void> {
    try {
      const rewardRef = doc(db, COLLECTIONS.REWARDS, rewardId);
      const rewardDoc = await getDoc(rewardRef);

      if (!rewardDoc.exists()) {
        throw new Error('Reward not found');
      }

      const reward = rewardDoc.data() as Reward;
      const updatedClaims = reward.claimedBy.map(claim =>
        claim.userId === claimUserId
          ? {
            ...claim,
            approvalStatus: 'approved' as const,
            approvedBy,
            approvedAt: new Date(),
            redeemedAt: new Date() // Mark as redeemed when approved
          }
          : claim
      );

      await updateDoc(rewardRef, { claimedBy: updatedClaims });
      console.log(`Reward approved: ${rewardId} for user ${claimUserId}`);
    } catch (error) {
      console.error('Error approving reward:', error);
      throw new Error('Failed to approve reward');
    }
  }

  /// Reject a claimed reward and refund points (keep claim visible with rejected status)
async rejectClaimedReward(rewardId: string, claimUserId: string, approvedBy: string, reason?: string): Promise<void> {
  try {
    const rewardRef = doc(db, COLLECTIONS.REWARDS, rewardId);
    const rewardDoc = await getDoc(rewardRef);
    
    if (!rewardDoc.exists()) {
      throw new Error('Reward not found');
    }
    
    const reward = rewardDoc.data() as Reward;
    
    // UPDATE the claim record instead of removing it (keep it visible)
    const updatedClaims = reward.claimedBy.map(claim => 
      claim.userId === claimUserId 
        ? { 
            ...claim, 
            approvalStatus: 'rejected' as const,
            approvedBy,
            approvedAt: new Date(),
            rejectionReason: reason,
            canReclaimAfter: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hour cooldown
          }
        : claim
    );
    
    // Keep the claim in the array - just update its status
    await updateDoc(rewardRef, {
      claimedBy: updatedClaims
    });
    
    // Refund points to user
    const userRef = doc(db, COLLECTIONS.USERS, claimUserId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentPoints = userData.points || 0;
      
      await updateDoc(userRef, {
        points: currentPoints + reward.cost
      });
      
      // If this is a child profile, also update parent's childProfiles array
      if (userData.parentId) {
        await this.updateParentChildProfile(userData.parentId, claimUserId, {
          points: currentPoints + reward.cost,
        });
      }
    }
    
    console.log(`Reward rejected (but kept visible): ${rewardId} for user ${claimUserId}`);
  } catch (error) {
    console.error('Error rejecting reward:', error);
    throw new Error('Failed to reject reward');
  }
}
}

export const rewardsService = new RewardsService();
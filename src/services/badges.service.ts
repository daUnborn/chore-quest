import { BaseService, ServiceResponse } from './base.service';
import { Badge, UserProfile } from '@/types';
import { BADGE_DEFINITIONS } from '@/lib/constants/badges';

interface UserBadgeProgress {
  badgeId: string;
  progress: number;
  required: number;
  percentage: number;
  earned: boolean;
  earnedAt?: Date;
}

interface UserBadge extends Badge {
  earnedAt: Date;
}

class BadgesService extends BaseService {
  private userBadges: Map<string, UserBadge[]> = new Map();

  // Check and award badges based on user stats
  async checkAndAwardBadges(
    userId: string,
    stats: {
      completedTasks: number;
      currentStreak: number;
      lifetimePoints: number;
    }
  ): Promise<ServiceResponse<UserBadge[]>> {
    return this.handleError(async () => {
      const earnedBadges: UserBadge[] = [];
      const userBadgeList = this.userBadges.get(userId) || [];
      const earnedBadgeIds = userBadgeList.map(b => b.id);

      for (const badgeDef of BADGE_DEFINITIONS) {
        const badgeId = this.generateBadgeId(badgeDef);
        
        // Skip if already earned
        if (earnedBadgeIds.includes(badgeId)) continue;

        let earned = false;

        switch (badgeDef.requirement.type) {
          case 'tasks-completed':
            earned = stats.completedTasks >= badgeDef.requirement.value;
            break;
          case 'streak-days':
            earned = stats.currentStreak >= badgeDef.requirement.value;
            break;
          case 'points-earned':
            earned = stats.lifetimePoints >= badgeDef.requirement.value;
            break;
          case 'special':
            // Special badges need custom logic
            earned = this.checkSpecialBadge(badgeDef, stats);
            break;
        }

        if (earned) {
          const newBadge: UserBadge = {
            ...badgeDef,
            id: badgeId,
            earnedAt: new Date(),
          };
          earnedBadges.push(newBadge);
          userBadgeList.push(newBadge);
        }
      }

      // Update user's badges
      this.userBadges.set(userId, userBadgeList);

      return earnedBadges;
    });
  }

  // Check special badge conditions
  private checkSpecialBadge(
    badgeDef: Omit<Badge, 'id'>,
    stats: { completedTasks: number; currentStreak: number; lifetimePoints: number }
  ): boolean {
    const condition = badgeDef.requirement.metadata?.condition;
    
    switch (condition) {
      case 'morning-tasks':
        // This would require checking if tasks were completed before 8 AM
        // For now, just check if they have completed tasks
        return stats.completedTasks >= 5;
      case 'night-tasks':
        // This would require checking if tasks were completed after 9 PM
        return stats.completedTasks >= 3;
      case 'perfect-week':
        // This would require checking if all tasks were completed for 7 consecutive days
        return stats.currentStreak >= 7 && stats.completedTasks >= 21; // Assuming 3 tasks per day
      default:
        return false;
    }
  }

  // Get user's badge progress
  async getUserBadgeProgress(
    userId: string,
    stats: {
      completedTasks: number;
      currentStreak: number;
      lifetimePoints: number;
    }
  ): Promise<ServiceResponse<UserBadgeProgress[]>> {
    return this.handleError(async () => {
      const userBadgeList = this.userBadges.get(userId) || [];
      const earnedBadgeIds = userBadgeList.map(b => b.id);
      const progress: UserBadgeProgress[] = [];

      for (const badgeDef of BADGE_DEFINITIONS) {
        const badgeId = this.generateBadgeId(badgeDef);
        const earned = earnedBadgeIds.includes(badgeId);
        const earnedBadge = userBadgeList.find(b => b.id === badgeId);

        let currentProgress = 0;
        const required = badgeDef.requirement.value;

        switch (badgeDef.requirement.type) {
          case 'tasks-completed':
            currentProgress = Math.min(stats.completedTasks, required);
            break;
          case 'streak-days':
            currentProgress = Math.min(stats.currentStreak, required);
            break;
          case 'points-earned':
            currentProgress = Math.min(stats.lifetimePoints, required);
            break;
          case 'special':
            // For special badges, show binary progress (0 or required)
            currentProgress = this.checkSpecialBadge(badgeDef, stats) ? required : 0;
            break;
        }

        progress.push({
          badgeId,
          progress: currentProgress,
          required,
          percentage: Math.round((currentProgress / required) * 100),
          earned,
          earnedAt: earnedBadge?.earnedAt,
        });
      }

      return progress;
    });
  }

  // Get all available badges
  async getAllBadges(): Promise<ServiceResponse<Badge[]>> {
    return this.handleError(async () => {
      return BADGE_DEFINITIONS.map(def => ({
        ...def,
        id: this.generateBadgeId(def),
      }));
    });
  }

  // Get user's earned badges
  async getUserBadges(userId: string): Promise<ServiceResponse<UserBadge[]>> {
    return this.handleError(async () => {
      // Return existing badges or initialize with some starter badges for demo
      const existingBadges = this.userBadges.get(userId);
      
      if (existingBadges && existingBadges.length > 0) {
        return existingBadges;
      }

      // Initialize with some demo badges if user has none
      const demoBadges: UserBadge[] = [
        {
          id: 'first-steps',
          name: 'First Steps',
          description: 'Complete your first task',
          iconUrl: '🏃',
          requirement: { type: 'tasks-completed', value: 1 },
          tier: 'bronze',
          isSecret: false,
          earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          id: 'star-helper',
          name: 'Star Helper',
          description: 'Help family members by completing 5 tasks',
          iconUrl: '🌟',
          requirement: { type: 'tasks-completed', value: 5 },
          tier: 'silver',
          isSecret: false,
          earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
      ];

      // Only return demo badges for demo purposes
      this.userBadges.set(userId, demoBadges);
      return demoBadges;
    });
  }

  // Award a specific badge to a user (for manual awarding)
  async awardBadge(userId: string, badgeId: string): Promise<ServiceResponse<UserBadge>> {
    return this.handleError(async () => {
      const badgeDef = BADGE_DEFINITIONS.find(def => this.generateBadgeId(def) === badgeId);
      
      if (!badgeDef) {
        throw new Error('Badge not found');
      }

      const userBadgeList = this.userBadges.get(userId) || [];
      
      // Check if already earned
      if (userBadgeList.some(b => b.id === badgeId)) {
        throw new Error('Badge already earned');
      }

      const newBadge: UserBadge = {
        ...badgeDef,
        id: badgeId,
        earnedAt: new Date(),
      };

      userBadgeList.push(newBadge);
      this.userBadges.set(userId, userBadgeList);

      return newBadge;
    });
  }

  private generateBadgeId(badge: Omit<Badge, 'id'>): string {
    return badge.name.toLowerCase().replace(/\s+/g, '-');
  }
}

export const badgesService = new BadgesService();
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

class BadgesService extends BaseService {
  private userBadges: Map<string, string[]> = new Map();

  // Check and award badges based on user stats
  async checkAndAwardBadges(
    userId: string,
    stats: {
      completedTasks: number;
      currentStreak: number;
      lifetimePoints: number;
    }
  ): Promise<ServiceResponse<Badge[]>> {
    return this.handleError(async () => {
      const earnedBadges: Badge[] = [];
      const userBadgeIds = this.userBadges.get(userId) || [];

      for (const badgeDef of BADGE_DEFINITIONS) {
        const badgeId = this.generateBadgeId(badgeDef);
        
        // Skip if already earned
        if (userBadgeIds.includes(badgeId)) continue;

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
            earned = false; // Will implement special conditions later
            break;
        }

        if (earned) {
          const badge: Badge = {
            ...badgeDef,
            id: badgeId,
          };
          earnedBadges.push(badge);
          userBadgeIds.push(badgeId);
        }
      }

      // Update user's badges
      this.userBadges.set(userId, userBadgeIds);

      return earnedBadges;
    });
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
      const userBadgeIds = this.userBadges.get(userId) || [];
      const progress: UserBadgeProgress[] = [];

      for (const badgeDef of BADGE_DEFINITIONS) {
        const badgeId = this.generateBadgeId(badgeDef);
        const earned = userBadgeIds.includes(badgeId);

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
        }

        progress.push({
          badgeId,
          progress: currentProgress,
          required,
          percentage: Math.round((currentProgress / required) * 100),
          earned,
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
  async getUserBadges(userId: string): Promise<ServiceResponse<Badge[]>> {
    return this.handleError(async () => {
      const userBadgeIds = this.userBadges.get(userId) || [];
      
      return BADGE_DEFINITIONS
        .filter(def => userBadgeIds.includes(this.generateBadgeId(def)))
        .map(def => ({
          ...def,
          id: this.generateBadgeId(def),
        }));
    });
  }

  private generateBadgeId(badge: Omit<Badge, 'id'>): string {
    return badge.name.toLowerCase().replace(/\s+/g, '-');
  }
}

export const badgesService = new BadgesService();
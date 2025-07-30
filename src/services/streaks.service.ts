import { BaseService, ServiceResponse } from './base.service';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  streakHistory: Date[];
}

class StreaksService extends BaseService {
  private userStreaks: Map<string, StreakData> = new Map();

  // Update streak when task is completed
  async updateStreak(userId: string): Promise<ServiceResponse<StreakData>> {
    return this.handleError(async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let streakData = this.userStreaks.get(userId) || {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date(0),
        streakHistory: [],
      };

      const lastActive = new Date(streakData.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Already active today, no change
        return streakData;
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        streakData.currentStreak += 1;
        streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
      } else {
        // Streak broken, reset to 1
        streakData.currentStreak = 1;
      }

      streakData.lastActiveDate = today;
      streakData.streakHistory.push(today);

      this.userStreaks.set(userId, streakData);

      return streakData;
    });
  }

  // Get user's streak data
  async getUserStreak(userId: string): Promise<ServiceResponse<StreakData>> {
    return this.handleError(async () => {
      const streakData = this.userStreaks.get(userId) || {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date(0),
        streakHistory: [],
      };

      // Check if streak is still valid
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastActive = new Date(streakData.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff > 1) {
        // Streak broken
        streakData.currentStreak = 0;
        this.userStreaks.set(userId, streakData);
      }

      return streakData;
    });
  }

  // Get streak calendar data for visualization
  async getStreakCalendar(userId: string, month: Date): Promise<ServiceResponse<Date[]>> {
    return this.handleError(async () => {
      const streakData = this.userStreaks.get(userId);
      if (!streakData) return [];

      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      return streakData.streakHistory.filter(date => {
        return date >= startOfMonth && date <= endOfMonth;
      });
    });
  }
}

export const streaksService = new StreaksService();
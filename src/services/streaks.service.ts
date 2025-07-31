import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  streakHistory: Date[];
}

class StreaksService {
  // Update streak when task is completed
  async updateUserStreak(userId: string): Promise<StreakData> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentStreak = userData.currentStreak || 0;
      let longestStreak = userData.longestStreak || 0;
      let lastActiveDate = userData.lastActiveDate?.toDate() || null;
      let streakHistory = userData.streakHistory || [];
      
      // Convert Firestore timestamps to dates
      if (lastActiveDate) {
        lastActiveDate.setHours(0, 0, 0, 0);
      }
      
      // Check if user already completed tasks today
      const todayString = today.toISOString().split('T')[0];
      const hasCompletedToday = streakHistory.some((date: any) => {
        const historyDate = date.toDate ? date.toDate() : new Date(date);
        return historyDate.toISOString().split('T')[0] === todayString;
      });
      
      if (hasCompletedToday) {
        // Already counted today, just return current data
        return {
          currentStreak,
          longestStreak,
          lastActiveDate,
          streakHistory: streakHistory.map((d: any) => d.toDate ? d.toDate() : new Date(d))
        };
      }
      
      // Calculate days since last activity
      const daysSinceLastActive = lastActiveDate 
        ? Math.floor((today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;
      
      if (daysSinceLastActive === 1 || lastActiveDate === null) {
        // Consecutive day or first day
        currentStreak += 1;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (daysSinceLastActive > 1) {
        // Streak broken, start new streak
        currentStreak = 1;
      }
      // If daysSinceLastActive === 0, user already completed tasks today (handled above)
      
      // Update user document
      const updatedData = {
        currentStreak,
        longestStreak,
        lastActiveDate: today,
        streakHistory: [...streakHistory, today]
      };
      
      await updateDoc(userRef, updatedData);
      
      console.log(`Updated streak for user ${userId}: ${currentStreak} days`);
      
      return {
        currentStreak,
        longestStreak,
        lastActiveDate: today,
        streakHistory: [...streakHistory.map((d: any) => d.toDate ? d.toDate() : new Date(d)), today]
      };
      
    } catch (error) {
      console.error('Error updating user streak:', error);
      throw error;
    }
  }
  
  // Get user's current streak data
  async getUserStreak(userId: string): Promise<StreakData> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
          streakHistory: []
        };
      }
      
      const userData = userDoc.data();
      return {
        currentStreak: userData.currentStreak || 0,
        longestStreak: userData.longestStreak || 0,
        lastActiveDate: userData.lastActiveDate?.toDate() || null,
        streakHistory: (userData.streakHistory || []).map((d: any) => d.toDate ? d.toDate() : new Date(d))
      };
      
    } catch (error) {
      console.error('Error getting user streak:', error);
      throw error;
    }
  }
}

export const streaksService = new StreaksService();
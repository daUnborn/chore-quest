// src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types';
import { streaksService } from '@/services/streaks.service';
import { rewardsService } from '@/services/firebase/rewards.firebase.service';

interface DashboardStats {
  tasksToday: number;
  tasksCompletedToday: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  completedTasks: number;
}

interface FamilyMemberStats {
  id: string;
  name: string;
  points: number;
  completedTasks: number;
  currentStreak: number;
  avatar?: string;
}

interface Quest {
  id: string;
  title: string;
  points: number;
  icon: string;
  completed: boolean;
  category: string;
  dueTime?: string;
}

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'reward_claimed' | 'badge_earned' | 'streak_milestone';
  memberName: string;
  memberAvatar?: string;
  title: string;
  points?: number;
  timestamp: Date;
  icon: string;
}

export function useDashboardData() {
  const { userProfile, currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    tasksToday: 0,
    tasksCompletedToday: 0,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    completedTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [todaysQuests, setTodaysQuests] = useState<Quest[]>([]);
  const [familyLeaderboard, setFamilyLeaderboard] = useState<FamilyMemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const householdId = userProfile?.householdIds?.[0];
  const activeProfileId = userProfile?.activeProfile === 'parent' ? currentUser?.uid : userProfile?.activeProfile;


  useEffect(() => {
    if (!householdId || !userProfile || !currentUser) {
      setLoading(false);
      return;
    }

    loadDashboardData();
  }, [householdId, userProfile?.activeProfile, currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load today's tasks
      await loadTodaysTasks();

      // Load user stats
      await loadUserStats();

      // Load recent tasks
      await loadRecentTasks();

      // Load family leaderboard
      await loadFamilyLeaderboard();

      // Load recent activities (tasks + rewards)
      await loadRecentActivities();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    if (!householdId) return;

    try {
      console.log('Loading recent activities for household:', householdId);
      const activities: ActivityItem[] = [];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get all household members for name lookup
      const membersQuery = query(
        collection(db, COLLECTIONS.USERS),
        where('householdIds', 'array-contains', householdId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      const membersMap = new Map();

      membersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        membersMap.set(doc.id, {
          name: data.displayName,
          avatar: data.avatar
        });
      });

      // Get recent completed tasks (last 7 days)
      const tasksQuery = query(
        collection(db, COLLECTIONS.TASKS),
        where('householdId', '==', householdId),
        where('status', '==', 'done'),
        where('completedAt', '!=', null),
        where('completedAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
        orderBy('completedAt', 'desc'),
        limit(10)
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      tasksSnapshot.docs.forEach(doc => {
        const task = doc.data();
        const member = membersMap.get(task.completedBy);

        if (member && task.completedAt) {
          activities.push({
            id: doc.id,
            type: 'task_completed',
            memberName: member.name,
            memberAvatar: member.avatar,
            title: `completed "${task.title}"`,
            points: task.points,
            timestamp: task.completedAt.toDate(),
            icon: '✅'
          });
        }
      });

      // Get recent claimed rewards (last 7 days)
      try {
        const recentRewardClaims = await rewardsService.getRecentRewardClaims(householdId, 10);

        recentRewardClaims.forEach(claimedReward => {
          const claimDate = typeof claimedReward.claimInfo.claimedAt.toDate === 'function'
            ? claimedReward.claimInfo.claimedAt.toDate()
            : new Date(claimedReward.claimInfo.claimedAt);

          if (claimDate >= sevenDaysAgo) {
            activities.push({
              id: `reward-${claimedReward.id}-${claimedReward.claimInfo.userId}`,
              type: 'reward_claimed',
              memberName: claimedReward.claimInfo.userName,
              memberAvatar: claimedReward.claimInfo.userAvatar,
              title: `claimed "${claimedReward.title}"`,
              points: -claimedReward.cost,
              timestamp: claimDate,
              icon: '🎁'
            });
          }
        });
      } catch (error) {
        console.error('Error loading reward claims for activity:', error);
      }

      // Check for streak milestones in user documents
      membersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        const member = membersMap.get(doc.id);

        if (member && userData.lastActiveDate) {
          const lastActiveDate = userData.lastActiveDate.toDate();
          const currentStreak = userData.currentStreak || 0;

          // Check if streak milestone was reached in last 7 days
          if (lastActiveDate >= sevenDaysAgo && [3, 7, 14, 30].includes(currentStreak)) {
            activities.push({
              id: `streak-${doc.id}-${currentStreak}`,
              type: 'streak_milestone',
              memberName: member.name,
              memberAvatar: member.avatar,
              title: `reached ${currentStreak}-day streak!`,
              timestamp: lastActiveDate,
              icon: '🔥'
            });
          }
        }
      });

      // Check for recently earned badges (mock for now - would need badge tracking)
      membersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        const member = membersMap.get(doc.id);

        if (member && userData.badges && userData.badges.length > 0) {
          // For demo purposes, add a badge activity if user has badges
          // In real implementation, you'd track badge earn timestamps
          const recentBadgeDate = new Date();
          recentBadgeDate.setDate(recentBadgeDate.getDate() - Math.floor(Math.random() * 7));

          if (recentBadgeDate >= sevenDaysAgo && Math.random() > 0.7) { // 30% chance for demo
            activities.push({
              id: `badge-${doc.id}-${Date.now()}`,
              type: 'badge_earned',
              memberName: member.name,
              memberAvatar: member.avatar,
              title: `earned a new badge!`,
              timestamp: recentBadgeDate,
              icon: '🏆'
            });
          }
        }
      });

      // Sort all activities by timestamp (most recent first) and limit to 5
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      console.log('Final activities with all types:', activities);
      setRecentActivities(activities.slice(0, 5)); // Limit to 5 most recent
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const loadTodaysTasks = async () => {
    if (!householdId || !activeProfileId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('householdId', '==', householdId),
      where('assignedTo', 'array-contains', activeProfileId),
      where('dueDate', '>=', Timestamp.fromDate(today)),
      where('dueDate', '<', Timestamp.fromDate(tomorrow))
    );

    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));

    const completed = tasks.filter(t => t.status === 'done').length;

    // Convert tasks to quests format
    const quests: Quest[] = tasks.map(task => ({
      id: task.id,
      title: task.title,
      points: task.points,
      icon: getCategoryIcon(task.category),
      completed: task.status === 'done',
      category: task.category || 'other',
      dueTime: task.dueDate.toDate().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      }),
    }));

    setTodaysQuests(quests);
    setStats(prev => ({
      ...prev,
      tasksToday: tasks.length,
      tasksCompletedToday: completed,
    }));
  };

  const loadUserStats = async () => {
    if (!activeProfileId) return;

    try {
      // Get user points and completed tasks from profile
      let userPoints = 0;
      let completedTasksCount = 0;

      if (userProfile?.activeProfile === 'parent') {
        userPoints = userProfile.points || 0;
        completedTasksCount = userProfile.completedTasks || 0;
      } else {
        const childProfile = userProfile?.childProfiles?.find(
          child => child.id === userProfile.activeProfile
        );
        userPoints = childProfile?.points || 0;
        completedTasksCount = childProfile?.completedTasks || 0;
      }

      // Get streak data
      const streakData = await streaksService.getUserStreak(activeProfileId);

      setStats(prev => ({
        ...prev,
        totalPoints: userPoints,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        completedTasks: completedTasksCount,
      }));
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadRecentTasks = async () => {
    if (!householdId) return;

    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('householdId', '==', householdId),
      where('status', '==', 'done'),
      orderBy('completedAt', 'desc'),
      limit(5)
    );

    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    setRecentTasks(tasks);
  };

  const loadFamilyLeaderboard = async () => {
    if (!userProfile || !householdId) return;

    try {
      console.log('Loading family leaderboard for household:', householdId);
      const members: FamilyMemberStats[] = [];

      // Query all users in this household
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where('householdIds', 'array-contains', householdId)
      );

      const snapshot = await getDocs(q);
      console.log('Found', snapshot.docs.length, 'household members');

      snapshot.docs.forEach(doc => {
        const userData = doc.data();
        console.log('Member data:', { id: doc.id, name: userData.displayName, points: userData.points });
        members.push({
          id: doc.id,
          name: userData.displayName,
          points: userData.points || 0,
          completedTasks: userData.completedTasks || 0,
          currentStreak: userData.currentStreak || 0,
          avatar: userData.avatar,
        });
      });

      // Sort by points descending
      members.sort((a, b) => b.points - a.points);
      console.log('Final leaderboard:', members);
      setFamilyLeaderboard(members);
    } catch (error) {
      console.error('Error loading family leaderboard:', error);
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'morning': return '🌅';
      case 'chores': return '🧹';
      case 'homework': return '📚';
      case 'outdoor': return '🌳';
      case 'evening': return '🌙';
      default: return '⭐';
    }
  };

  return {
    stats,
    recentTasks,
    todaysQuests,
    familyLeaderboard,
    recentActivities,
    loading,
    refreshData: loadDashboardData,
  };
}
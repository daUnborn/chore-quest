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
  type: 'task_completed' | 'badge_earned' | 'streak_milestone';
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

      // Load recent activities
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
      // Get recent completed tasks
      const q = query(
        collection(db, COLLECTIONS.TASKS),
        where('householdId', '==', householdId),
        where('status', '==', 'done'),
        where('completedAt', '!=', null),
        orderBy('completedAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const activities: ActivityItem[] = [];

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

      snapshot.docs.forEach(doc => {
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

      setRecentActivities(activities);
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
      const members: FamilyMemberStats[] = [];

      // Query all users in this household
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where('householdIds', 'array-contains', householdId)
      );

      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        const userData = doc.data();
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
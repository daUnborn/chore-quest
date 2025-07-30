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

interface DashboardStats {
  tasksToday: number;
  tasksCompletedToday: number;
  totalPoints: number;
  activeKids: number;
  completionRate: number;
  currentStreak: number;
}

export function useDashboardData() {
  const { userProfile, currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    tasksToday: 0,
    tasksCompletedToday: 0,
    totalPoints: 0,
    activeKids: 0,
    completionRate: 0,
    currentStreak: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !userProfile) return;

    const householdId = userProfile.householdIds[0]; // Get first household
    if (!householdId) return;

    // Get today's start and end
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Query for today's tasks
    const tasksQuery = query(
      collection(db, COLLECTIONS.TASKS),
      where('householdId', '==', householdId),
      where('dueDate', '>=', Timestamp.fromDate(today)),
      where('dueDate', '<', Timestamp.fromDate(tomorrow))
    );

    // Query for recent completed tasks
    const recentTasksQuery = query(
      collection(db, COLLECTIONS.TASKS),
      where('householdId', '==', householdId),
      where('status', '==', 'done'),
      orderBy('completedAt', 'desc'),
      limit(5)
    );

    // Subscribe to tasks
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      const completed = tasks.filter(t => t.status === 'done').length;
      
      setStats(prev => ({
        ...prev,
        tasksToday: tasks.length,
        tasksCompletedToday: completed,
        completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      }));
    });

    // Subscribe to recent tasks
    const unsubscribeRecent = onSnapshot(recentTasksQuery, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setRecentTasks(tasks);
    });

    setLoading(false);

    return () => {
      unsubscribeTasks();
      unsubscribeRecent();
    };
  }, [currentUser, userProfile]);

  return { stats, recentTasks, loading };
}
// src/hooks/useTasks.ts
import { useState, useEffect } from 'react';
import { tasksService, CreateTaskData, UpdateTaskData } from '@/services/firebase/tasks.firebase.service';
import { Task, TaskStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { badgesService } from '@/services/badges.service';
import confetti from 'canvas-confetti';

export function useTasks() {
  const { userProfile, currentUser, updateUserProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const householdId = userProfile?.householdIds?.[0];

  // Subscribe to real-time task updates (SINGLE useEffect)
  useEffect(() => {
    if (!householdId || !userProfile) {
      setLoading(false);
      return;
    }

    console.log('Setting up tasks subscription for household:', householdId);
    console.log('Current active profile:', userProfile.activeProfile);

    const unsubscribe = tasksService.subscribeToTasks(
      householdId,
      (updatedTasks) => {
        console.log('Raw tasks from Firebase:', updatedTasks.length);
        
        // Filter tasks based on active profile
        let filteredTasks = updatedTasks;
        
        // If viewing as child profile, only show tasks assigned to that profile
        if (userProfile.activeProfile && userProfile.activeProfile !== 'parent') {
          filteredTasks = updatedTasks.filter(task => 
            task.assignedTo.includes(userProfile.activeProfile!)
          );
          console.log('Filtered tasks for child:', filteredTasks.length);
        } else {
          console.log('Showing all tasks for parent');
        }
        
        setTasks(filteredTasks);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Tasks subscription error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      console.log('Unsubscribing from tasks');
      unsubscribe();
    };
  }, [householdId, userProfile?.activeProfile]);

  // Create a new task
  const createTask = async (taskData: CreateTaskData): Promise<void> => {
    if (!householdId || !currentUser) {
      throw new Error('No household or user found');
    }

    try {
      console.log('Creating task:', taskData);
      await tasksService.createTask(householdId, currentUser.uid, taskData);
      console.log('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  // Check and award badges after task completion
  const checkAndAwardBadges = async (userId: string, pointsEarned: number): Promise<void> => {
    try {
      // Get current user stats
      let currentStats = {
        completedTasks: 0,
        currentStreak: 0,
        lifetimePoints: 0
      };

      if (userProfile?.activeProfile === 'parent') {
        currentStats = {
          completedTasks: userProfile.completedTasks || 0,
          currentStreak: userProfile.currentStreak || 0,
          lifetimePoints: (userProfile.points || 0) + pointsEarned
        };
      } else {
        const childProfile = userProfile?.childProfiles?.find(
          child => child.id === userProfile.activeProfile
        );
        if (childProfile) {
          currentStats = {
            completedTasks: childProfile.completedTasks + 1,
            currentStreak: childProfile.currentStreak || 0,
            lifetimePoints: childProfile.points + pointsEarned
          };
        }
      }

      // Check for new badges
      const badgeResponse = await badgesService.checkAndAwardBadges(userId, currentStats);
      
      if (badgeResponse.data && badgeResponse.data.length > 0) {
        console.log('New badges earned:', badgeResponse.data);
        
        // Show celebration for each new badge
        badgeResponse.data.forEach((badge, index) => {
          setTimeout(() => {
            // Trigger confetti
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#F4D03F', '#AF7AC5', '#5DADE2'],
            });
            
            // TODO: Show badge earned modal/toast
            console.log(`🎉 Badge earned: ${badge.name}`);
          }, index * 1000);
        });

        // Update user profile with new badges
        if (userProfile?.activeProfile === 'parent') {
          const currentBadges = userProfile.badges || [];
          await updateUserProfile({
            badges: [...currentBadges, ...badgeResponse.data.map(b => b.id)]
          });
        } else {
          // Update child profile badges in parent's document
          const updatedChildProfiles = userProfile?.childProfiles?.map(child => 
            child.id === userProfile.activeProfile 
              ? { 
                  ...child, 
                  badges: [...(child.badges || []), ...badgeResponse.data!.map(b => b.id)]
                }
              : child
          );
          
          if (updatedChildProfiles) {
            await updateUserProfile({ childProfiles: updatedChildProfiles });
          }
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
      // Don't throw - badge failures shouldn't break task completion
    }
  };

  // Update task status with badge checking
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus, completedBy?: string): Promise<void> => {
    try {
      console.log('Updating task status:', taskId, newStatus, 'completed by:', completedBy);
      
      // Use the passed completedBy or default to current user
      const completerId = completedBy || currentUser?.uid;
      const result = await tasksService.updateTaskStatus(taskId, newStatus, completerId);
      
      // If task was completed and points were awarded
      if (newStatus === 'done' && result.pointsAwarded && completerId) {
        try {
          // Update streak
          const { streaksService } = await import('@/services/streaks.service');
          await streaksService.updateUserStreak(completerId);
          console.log('Streak updated after task completion for user:', completerId);
          
          // Check and award badges
          await checkAndAwardBadges(completerId, result.pointsAwarded);
          
        } catch (streakError) {
          console.error('Error updating streak or badges:', streakError);
          // Don't throw - points were still awarded
        }
      }
      
      console.log('Task status updated successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  };

  // Update task
  const updateTask = async (taskId: string, updates: UpdateTaskData): Promise<void> => {
    try {
      console.log('Updating task:', taskId, updates);
      await tasksService.updateTask(taskId, updates);
      console.log('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // Add photo proof
  const addPhotoProof = async (taskId: string, photoUrl: string): Promise<void> => {
    try {
      console.log('Adding photo proof:', taskId, photoUrl);
      await tasksService.addPhotoProof(taskId, photoUrl);
      console.log('Photo proof added successfully');
    } catch (error) {
      console.error('Error adding photo proof:', error);
      throw error;
    }
  };

  // Archive task
  const archiveTask = async (taskId: string): Promise<void> => {
    try {
      console.log('Archiving task:', taskId);
      await tasksService.archiveTask(taskId);
      console.log('Task archived successfully');
    } catch (error) {
      console.error('Error archiving task:', error);
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      console.log('Deleting task:', taskId);
      await tasksService.deleteTask(taskId);
      console.log('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // Get tasks for current user
  const getUserTasks = async (): Promise<Task[]> => {
    if (!householdId || !currentUser) {
      return [];
    }

    try {
      return await tasksService.getUserTasks(householdId, currentUser.uid);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  };

  // Get today's tasks
  const getTodaysTasks = async (): Promise<Task[]> => {
    if (!householdId) {
      return [];
    }

    try {
      return await tasksService.getTasksDueToday(householdId);
    } catch (error) {
      console.error('Error fetching today\'s tasks:', error);
      throw error;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTaskStatus,
    updateTask,
    addPhotoProof,
    archiveTask,
    deleteTask,
    getUserTasks,
    getTodaysTasks,
  };
}
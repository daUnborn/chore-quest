// src/hooks/useTasks.ts
import { useState, useEffect } from 'react';
import { tasksService, CreateTaskData, UpdateTaskData } from '@/services/firebase/tasks.firebase.service';
import { Task, TaskStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useTasks() {
  const { userProfile, currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const householdId = userProfile?.householdIds?.[0];

  // Subscribe to real-time task updates
  useEffect(() => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    console.log('Setting up tasks subscription for household:', householdId);

    const unsubscribe = tasksService.subscribeToTasks(
      householdId,
      (updatedTasks) => {
        console.log('Tasks updated:', updatedTasks.length);
        setTasks(updatedTasks);
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
  }, [householdId]);

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

  // Update task status
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus): Promise<void> => {
    try {
      console.log('Updating task status:', taskId, newStatus);
      await tasksService.updateTaskStatus(taskId, newStatus, currentUser?.uid);
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
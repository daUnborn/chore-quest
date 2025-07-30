import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  onSnapshot,
  Unsubscribe,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Task, TaskStatus } from '@/types';

export interface CreateTaskData {
  title: string;
  description?: string;
  assignedTo: string[];
  dueDate: Date;
  points: number;
  category?: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  assignedTo?: string[];
  dueDate?: Date;
  points?: number;
  category?: string;
  status?: TaskStatus;
  photoProofUrl?: string;
  completedAt?: Date;
  completedBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
}

class TasksService {
  // Get all tasks for a household
  async getTasks(householdId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.TASKS),
        where('householdId', '==', householdId),
        where('status', '!=', 'archived'),
        orderBy('status'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  // Subscribe to real-time task updates
  subscribeToTasks(
    householdId: string, 
    callback: (tasks: Task[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      const q = query(
        collection(db, COLLECTIONS.TASKS),
        where('householdId', '==', householdId),
        where('status', '!=', 'archived'),
        orderBy('status'),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, 
        (snapshot) => {
          const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Task));
          callback(tasks);
        },
        (error) => {
          console.error('Error in tasks subscription:', error);
          onError?.(new Error('Failed to subscribe to tasks'));
        }
      );
    } catch (error) {
      console.error('Error setting up tasks subscription:', error);
      onError?.(new Error('Failed to set up real-time updates'));
      return () => {}; // Return empty unsubscribe function
    }
  }

  // Create a new task
  async createTask(householdId: string, createdBy: string, taskData: CreateTaskData): Promise<Task> {
    try {
      const docRef = doc(collection(db, COLLECTIONS.TASKS));
      
      const newTask: Omit<Task, 'id'> = {
        householdId,
        title: taskData.title,
        description: taskData.description,
        assignedTo: taskData.assignedTo,
        createdBy,
        createdAt: new Date(),
        dueDate: Timestamp.fromDate(taskData.dueDate),
        points: taskData.points,
        status: 'todo',
        category: taskData.category,
        isRecurring: taskData.isRecurring,
        recurringPattern: taskData.recurringPattern,
      };

      await setDoc(docRef, newTask);
      
      return {
        id: docRef.id,
        ...newTask
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  // Update an existing task
  async updateTask(taskId: string, updates: UpdateTaskData): Promise<void> {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      
      const updateData: any = { ...updates };
      
      // Convert Date to Timestamp for Firestore
      if (updates.dueDate) {
        updateData.dueDate = Timestamp.fromDate(updates.dueDate);
      }

      await updateDoc(taskRef, updateData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  // Update task status (common operation)
  async updateTaskStatus(
    taskId: string, 
    newStatus: TaskStatus, 
    completedBy?: string
  ): Promise<void> {
    try {
      const updates: UpdateTaskData = {
        status: newStatus,
      };

      // Add completion data if marking as done
      if (newStatus === 'done') {
        updates.completedAt = new Date();
        if (completedBy) {
          updates.completedBy = completedBy;
        }
      }

      await this.updateTask(taskId, updates);
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  }

  // Add photo proof to task
  async addPhotoProof(taskId: string, photoUrl: string): Promise<void> {
    try {
      await this.updateTask(taskId, {
        photoProofUrl: photoUrl,
        status: 'review' // Automatically move to review when photo is added
      });
    } catch (error) {
      console.error('Error adding photo proof:', error);
      throw new Error('Failed to add photo proof');
    }
  }

  // Archive a task (soft delete)
  async archiveTask(taskId: string): Promise<void> {
    try {
      await this.updateTask(taskId, {
        status: 'archived'
      });
    } catch (error) {
      console.error('Error archiving task:', error);
      throw new Error('Failed to archive task');
    }
  }

  // Delete a task permanently (hard delete)
  async deleteTask(taskId: string): Promise<void> {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }

  // Get tasks assigned to a specific user
  async getUserTasks(householdId: string, userId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.TASKS),
        where('householdId', '==', householdId),
        where('assignedTo', 'array-contains', userId),
        where('status', '!=', 'archived'),
        orderBy('status'),
        orderBy('dueDate', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw new Error('Failed to fetch user tasks');
    }
  }

  // Get tasks due today
  async getTasksDueToday(householdId: string): Promise<Task[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const q = query(
        collection(db, COLLECTIONS.TASKS),
        where('householdId', '==', householdId),
        where('dueDate', '>=', Timestamp.fromDate(today)),
        where('dueDate', '<', Timestamp.fromDate(tomorrow)),
        where('status', '!=', 'archived'),
        orderBy('dueDate', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
    } catch (error) {
      console.error('Error fetching today\'s tasks:', error);
      throw new Error('Failed to fetch today\'s tasks');
    }
  }
}

export const tasksService = new TasksService();
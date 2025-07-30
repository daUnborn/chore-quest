import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { Task } from '@/types';
import { BaseService, ServiceResponse } from '../base.service';

class TasksFirebaseService extends BaseService {
  // Get tasks for a household
  async getTasks(householdId: string): Promise<ServiceResponse<Task[]>> {
    return this.handleError(async () => {
      const q = query(
        collection(db, COLLECTIONS.TASKS),
        where('householdId', '==', householdId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
    });
  }

  // Subscribe to real-time task updates
  subscribeTasks(
    householdId: string, 
    callback: (tasks: Task[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('householdId', '==', householdId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
      callback(tasks);
    });
  }

  // Create task
  async createTask(task: Omit<Task, 'id'>): Promise<ServiceResponse<Task>> {
    return this.handleError(async () => {
      const docRef = doc(collection(db, COLLECTIONS.TASKS));
      await setDoc(docRef, {
        ...task,
        createdAt: new Date()
      });
      
      return {
        ...task,
        id: docRef.id
      } as Task;
    });
  }

  // Update task status
  async updateTaskStatus(taskId: string, status: Task['status']): Promise<ServiceResponse<void>> {
    return this.handleError(async () => {
      await updateDoc(doc(db, COLLECTIONS.TASKS, taskId), {
        status,
        ...(status === 'done' ? { completedAt: new Date() } : {})
      });
    });
  }
}

export const tasksFirebaseService = new TasksFirebaseService();
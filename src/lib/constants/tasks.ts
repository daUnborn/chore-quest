import { TaskStatus } from '@/types';

export const TASK_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-pastel-blue' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-mint-green' },
  { id: 'review', title: 'Review', color: 'bg-sunshine-yellow' },
  { id: 'done', title: 'Done', color: 'bg-lavender-accent' },
  { id: 'archived', title: 'Archived', color: 'bg-medium-gray' },
];

export const TASK_CATEGORIES = [
  { value: 'morning', label: 'Morning Routine', icon: '🌅' },
  { value: 'chores', label: 'Chores', icon: '🧹' },
  { value: 'homework', label: 'Homework', icon: '📚' },
  { value: 'outdoor', label: 'Outdoor', icon: '🌳' },
  { value: 'evening', label: 'Evening Routine', icon: '🌙' },
  { value: 'other', label: 'Other', icon: '⭐' },
];

export const DEFAULT_TASK_POINTS = {
  easy: 3,
  medium: 5,
  hard: 10,
};
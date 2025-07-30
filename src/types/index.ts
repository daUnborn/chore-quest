// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'parent' | 'child';
  avatar: string;
  createdAt: Date;
  householdIds: string[];
  isActive: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  pinEnabled: boolean;
  pin?: string;
  points: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  completedTasks: number;
}

export interface UserProfile extends User {
  age?: number; // For children
  points: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  completedTasks: number;
  joinedHouseholds: HouseholdMembership[];
  childProfiles?: ChildProfile[]; // For parent accounts
  activeProfile?: string; // 'parent' or child profile ID
  parentPin?: string; // PIN for parent verification
}

// Household types
export interface Household {
  id: string;
  name: string;
  code: string;
  createdBy: string;
  createdAt: Date;
  memberCount: number;
  settings: HouseholdSettings;
}

export interface HouseholdSettings {
  defaultTaskPoints: number;
  allowChildrenToCreateTasks: boolean;
  requirePhotoProof: boolean;
  weeklyRecapEnabled: boolean;
  reminderTime: string; // "16:00"
}

export interface HouseholdMembership {
  householdId: string;
  householdName: string;
  joinedAt: Date;
  role: 'admin' | 'member';
}

// Task types
export type TaskStatus = 'to-do' | 'in-progress' | 'review' | 'done' | 'archived';

export interface Task {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  assignedTo: string[];
  createdBy: string;
  createdAt: Date;
  dueDate: Date;
  points: number;
  status: TaskStatus;
  category?: string;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  photoProofUrl?: string;
  completedAt?: Date;
  completedBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[]; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
}

// Reward types
export interface Reward {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  cost: number;
  category: 'virtual' | 'real-world' | 'privilege';
  imageUrl?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  stock?: number; // For limited rewards
  claimedBy: ClaimRecord[];
}

export interface ClaimRecord {
  userId: string;
  claimedAt: Date;
  redeemedAt?: Date;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'task-assigned' | 'task-completed' | 'task-approved' | 'reward-claimed' | 'streak-achievement';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

// Badge types
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  requirement: BadgeRequirement;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isSecret: boolean;
}

export interface BadgeRequirement {
  type: 'tasks-completed' | 'streak-days' | 'points-earned' | 'special';
  value: number;
  metadata?: Record<string, any>;
}

// Chat types
export interface ChatMessage {
  id: string;
  householdId: string;
  senderId: string;
  senderName: string;
  message: string;
  type: 'text' | 'sticker' | 'gif' | 'reaction';
  attachmentUrl?: string;
  createdAt: Date;
  reactions: Reaction[];
}

export interface Reaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

// Subscription types
export interface Subscription {
  tier: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}
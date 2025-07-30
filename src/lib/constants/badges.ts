import { Badge, BadgeRequirement } from '@/types';

export const BADGE_DEFINITIONS: Omit<Badge, 'id'>[] = [
  // Task Completion Badges
  {
    name: 'First Steps',
    description: 'Complete your first task',
    iconUrl: '🏃',
    requirement: { type: 'tasks-completed', value: 1 },
    tier: 'bronze',
    isSecret: false,
  },
  {
    name: 'Task Master',
    description: 'Complete 10 tasks',
    iconUrl: '🎯',
    requirement: { type: 'tasks-completed', value: 10 },
    tier: 'silver',
    isSecret: false,
  },
  {
    name: 'Super Achiever',
    description: 'Complete 50 tasks',
    iconUrl: '🌟',
    requirement: { type: 'tasks-completed', value: 50 },
    tier: 'gold',
    isSecret: false,
  },
  {
    name: 'Legend',
    description: 'Complete 100 tasks',
    iconUrl: '🏆',
    requirement: { type: 'tasks-completed', value: 100 },
    tier: 'platinum',
    isSecret: false,
  },

  // Streak Badges
  {
    name: 'Consistent',
    description: 'Maintain a 3-day streak',
    iconUrl: '🔥',
    requirement: { type: 'streak-days', value: 3 },
    tier: 'bronze',
    isSecret: false,
  },
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    iconUrl: '💪',
    requirement: { type: 'streak-days', value: 7 },
    tier: 'silver',
    isSecret: false,
  },
  {
    name: 'Unstoppable',
    description: 'Maintain a 14-day streak',
    iconUrl: '⚡',
    requirement: { type: 'streak-days', value: 14 },
    tier: 'gold',
    isSecret: false,
  },
  {
    name: 'Streak Master',
    description: 'Maintain a 30-day streak',
    iconUrl: '👑',
    requirement: { type: 'streak-days', value: 30 },
    tier: 'platinum',
    isSecret: false,
  },

  // Points Badges
  {
    name: 'Point Collector',
    description: 'Earn 100 points',
    iconUrl: '💰',
    requirement: { type: 'points-earned', value: 100 },
    tier: 'bronze',
    isSecret: false,
  },
  {
    name: 'Rich Kid',
    description: 'Earn 500 points',
    iconUrl: '💎',
    requirement: { type: 'points-earned', value: 500 },
    tier: 'silver',
    isSecret: false,
  },
  {
    name: 'Millionaire',
    description: 'Earn 1000 points',
    iconUrl: '🤑',
    requirement: { type: 'points-earned', value: 1000 },
    tier: 'gold',
    isSecret: false,
  },

  // Special Badges
  {
    name: 'Early Bird',
    description: 'Complete all morning tasks before 8 AM',
    iconUrl: '🌅',
    requirement: { type: 'special', value: 1, metadata: { condition: 'morning-tasks' } },
    tier: 'silver',
    isSecret: false,
  },
  {
    name: 'Night Owl',
    description: 'Complete tasks after 9 PM',
    iconUrl: '🦉',
    requirement: { type: 'special', value: 1, metadata: { condition: 'night-tasks' } },
    tier: 'bronze',
    isSecret: true,
  },
  {
    name: 'Perfect Week',
    description: 'Complete all tasks for 7 days straight',
    iconUrl: '✨',
    requirement: { type: 'special', value: 7, metadata: { condition: 'perfect-week' } },
    tier: 'gold',
    isSecret: false,
  },
];
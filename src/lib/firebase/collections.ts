// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  HOUSEHOLDS: 'households',
  TASKS: 'tasks',
  REWARDS: 'rewards',
  USER_HOUSEHOLDS: 'user-households',
  NOTIFICATIONS: 'notifications',
  BADGES: 'badges',
  CHAT_MESSAGES: 'chat-messages',
} as const;

// Storage bucket paths
export const STORAGE_PATHS = {
  AVATARS: 'avatars',
  TASK_PHOTOS: 'task-photos',
  REWARD_IMAGES: 'reward-images',
} as const;
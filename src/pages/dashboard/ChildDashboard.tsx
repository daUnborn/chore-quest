import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { AvatarWorld } from '@/components/dashboard/AvatarWorld';
import { DailyQuests } from '@/components/dashboard/DailyQuests';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Trophy, Zap, Target } from 'lucide-react';
import { BadgeDisplay } from '@/components/badges/BadgeDisplay';
import { badgesService } from '@/services/badges.service';
import { useDashboardData } from '@/hooks/useDashboardData';
import { FamilyLeaderboard } from '@/components/dashboard/FamilyLeaderboard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

interface UserBadge {
  id: string;
  name: string;
  iconUrl: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isSecret: boolean;
  earnedAt?: Date;
}

export function ChildDashboard() {
  const navigate = useNavigate();
  const { userProfile, getCurrentDisplayName, getCurrentAvatar, currentUser } = useAuth();
  const { stats, todaysQuests, familyLeaderboard, recentActivities, loading } = useDashboardData();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);

  // Calculate unlocked rooms based on current streak
  const unlockedRooms = useMemo(() => {
    const unlocked = ['bedroom']; // Always unlocked
    if (stats.currentStreak >= 3) unlocked.push('playroom');
    if (stats.currentStreak >= 7) unlocked.push('treehouse');
    if (stats.currentStreak >= 14) unlocked.push('garden');
    if (stats.currentStreak >= 30) unlocked.push('castle');
    return unlocked;
  }, [stats.currentStreak]);

  // Calculate recent badges (earned within last 7 days)
  const recentBadges = useMemo(() => {
    const now = new Date();
    return userBadges
      .filter(badge => {
        if (!badge.earnedAt) return false;
        const daysSince = (now.getTime() - badge.earnedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      })
      .sort((a, b) => (b.earnedAt?.getTime() || 0) - (a.earnedAt?.getTime() || 0))
      .slice(0, 3);
  }, [userBadges]);

  useEffect(() => {
    const loadBadges = async () => {
      if (!userProfile?.activeProfile) return;

      try {
        const activeUserId = userProfile.activeProfile === 'parent' ? currentUser?.uid : userProfile.activeProfile;
        if (activeUserId) {
          const response = await badgesService.getUserBadges(activeUserId);
          if (response.data) {
            setUserBadges(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to load badges:', error);
        // Set mock badges with timestamps for demo
        const mockBadges: UserBadge[] = [
          { 
            id: '1', 
            name: 'First Steps', 
            iconUrl: '🏃', 
            description: 'Complete your first task', 
            tier: 'bronze', 
            isSecret: false,
            earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          },
          { 
            id: '2', 
            name: 'Star Helper', 
            iconUrl: '🌟', 
            description: 'Help family members', 
            tier: 'silver', 
            isSecret: false,
            earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
          },
          { 
            id: '3', 
            name: 'Task Master', 
            iconUrl: '🎯', 
            description: 'Complete 10 tasks', 
            tier: 'gold', 
            isSecret: false,
            earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago (not recent)
          },
        ];
        setUserBadges(mockBadges);
      }
    };

    loadBadges();
  }, [userProfile?.activeProfile, currentUser]);

  const progressPercentage = todaysQuests.length > 0 ? Math.round((todaysQuests.filter(q => q.completed).length / todaysQuests.length) * 100) : 0;

  const handleQuestClick = (questId: string) => {
    // Navigate to tasks page instead of specific quest
    navigate('/tasks');
  };

  const handleViewAllBadges = () => {
    navigate('/badges');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-blue/20 via-light-gray to-mint-green/20 pb-20">
        <PageHeader title={`Hi ${getCurrentDisplayName() || 'there'}! 🎮`} showMenuButton={true} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue/20 via-light-gray to-mint-green/20 pb-20">
      <PageHeader
        title={`Hi ${getCurrentDisplayName() || 'there'}! 🎮`}
        showMenuButton={true}
      />

      <div className="p-4 space-y-6">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="relative">
            <ProgressRing
              progress={progressPercentage}
              size={140}
              strokeWidth={10}
              label="Today"
            />
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="p-3 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-1 text-sunshine-yellow" />
            <p className="text-2xl font-bold text-dark-slate">{stats.totalPoints}</p>
            <p className="text-xs text-medium-gray">Points</p>
          </Card>
          <Card className="p-3 text-center">
            <Zap className="h-6 w-6 mx-auto mb-1 text-coral-accent" />
            <p className="text-2xl font-bold text-dark-slate">{stats.currentStreak}</p>
            <p className="text-xs text-medium-gray">Day Streak</p>
          </Card>
          <Card className="p-3 text-center">
            <Target className="h-6 w-6 mx-auto mb-1 text-mint-green" />
            <p className="text-2xl font-bold text-dark-slate">{userBadges.length}</p>
            <p className="text-xs text-medium-gray">Badges</p>
          </Card>
        </motion.div>

        {/* Avatar World - Now with proper unlocked rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AvatarWorld
            currentStreak={stats.currentStreak}
            unlockedRooms={unlockedRooms}
            avatarUrl={getCurrentAvatar() || `https://api.dicebear.com/7.x/adventurer/svg?seed=${getCurrentDisplayName()}`}
          />
        </motion.div>

        {/* Daily Quests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <DailyQuests
            quests={todaysQuests}
            onQuestClick={handleQuestClick}
          />
        </motion.div>

        {/* Recent Activity & Family Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <RecentActivity activities={recentActivities} />
          <FamilyLeaderboard 
            members={familyLeaderboard} 
            currentUserId={userProfile?.activeProfile === 'parent' ? currentUser?.uid || 'parent' : userProfile?.activeProfile || ''}
          />
        </motion.div>

        {/* Recent Achievements - Now shows actual recent badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-4">
            <h3 className="font-semibold text-dark-slate mb-3">Recent Achievements</h3>
            <div className="flex gap-2 flex-wrap">
              {recentBadges.length > 0 ? (
                recentBadges.map((badge) => (
                  <Badge key={badge.id} variant="success" className="text-sm">
                    {badge.iconUrl} {badge.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-medium-gray">
                  Complete tasks to earn your first badge! 🎯
                </p>
              )}
            </div>
            {recentBadges.length > 0 && (
              <p className="text-xs text-medium-gray mt-2">
                🎉 Earned in the last 7 days
              </p>
            )}
          </Card>
        </motion.div>

        {/* Badges Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-dark-slate">My Badges</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAllBadges}
              >
                View All
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {userBadges.slice(0, 4).map((badge) => (
                <BadgeDisplay
                  key={badge.id}
                  badge={badge}
                  earned={true}
                  size="sm"
                />
              ))}
              {userBadges.length === 0 && (
                <p className="col-span-4 text-center text-sm text-medium-gray py-4">
                  Complete tasks to earn badges!
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
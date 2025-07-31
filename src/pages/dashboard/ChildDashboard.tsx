import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { AvatarWorld } from '@/components/dashboard/AvatarWorld';
import { DailyQuests } from '@/components/dashboard/DailyQuests';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button'; // Added missing import
import { Trophy, Zap, Target } from 'lucide-react';
import { BadgeDisplay } from '@/components/badges/BadgeDisplay';
import { badgesService } from '@/services/badges.service';
import { useDashboardData } from '@/hooks/useDashboardData';
import { FamilyLeaderboard } from '@/components/dashboard/FamilyLeaderboard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export function ChildDashboard() {
  const navigate = useNavigate();
  const { userProfile, getCurrentDisplayName, getCurrentAvatar, currentUser } = useAuth();
  const { stats, todaysQuests, familyLeaderboard, recentActivities, loading } = useDashboardData();
  const [userBadges, setUserBadges] = useState<any[]>([]);

  // Add useEffect to load badges with error handling:
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
        // Set mock badges if service fails
        setUserBadges([
          { id: '1', name: 'First Steps', iconUrl: '🏃', description: 'Complete your first task', tier: 'bronze', isSecret: false },
          { id: '2', name: 'Star Helper', iconUrl: '🌟', description: 'Help family members', tier: 'silver', isSecret: false },
          { id: '3', name: 'Task Master', iconUrl: '🎯', description: 'Complete 10 tasks', tier: 'gold', isSecret: false },
        ]);
      }
    };

    loadBadges();
  }, [userProfile?.activeProfile, currentUser]);

  const progressPercentage = todaysQuests.length > 0 ? Math.round((todaysQuests.filter(q => q.completed).length / todaysQuests.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-blue/20 via-light-gray to-mint-green/20 pb-20">
        <PageHeader title={`Hi ${getCurrentDisplayName() || 'there'}! 🎮`} showMenuButton={false} />
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
        showMenuButton={false}
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

        {/* Avatar World */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AvatarWorld
            currentStreak={stats.currentStreak}
            unlockedRooms={[]}
            avatarUrl={getCurrentAvatar()}
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
            onQuestClick={(questId) => navigate(`/tasks/${questId}`)}
          />
        </motion.div>

        {/* Recent Activity & Family Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recent Activity - Shows first on mobile, left on desktop */}
          <RecentActivity activities={recentActivities} />
          
          {/* Family Leaderboard - Shows second on mobile, right on desktop */}
          <FamilyLeaderboard 
            members={familyLeaderboard} 
            currentUserId={userProfile?.activeProfile === 'parent' ? currentUser?.uid || 'parent' : userProfile?.activeProfile || ''}
          />
        </motion.div>

        {/* Daily Quests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <DailyQuests
            quests={quests}
            onQuestClick={(questId) => navigate(`/tasks/${questId}`)}
          />
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4">
            <h3 className="font-semibold text-dark-slate mb-3">Recent Achievements</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="warning" className="text-sm">
                🏃 First Steps
              </Badge>
              <Badge variant="success" className="text-sm">
                🌟 Star Helper
              </Badge>
              <Badge variant="primary" className="text-sm">
                🎯 Task Master
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Badges Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-dark-slate">My Badges</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/badges')}
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
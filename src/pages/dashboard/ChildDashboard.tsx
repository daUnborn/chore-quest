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
import { Trophy, Zap, Target } from 'lucide-react';

export function ChildDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [quests, setQuests] = useState<any[]>([]);

  useEffect(() => {
    // Mock quests data
    setQuests([
      { id: '1', title: 'Make your bed', points: 5, icon: '🛏️', completed: true, category: 'Morning' },
      { id: '2', title: 'Brush teeth', points: 3, icon: '🦷', completed: true, category: 'Morning' },
      { id: '3', title: 'Pack school bag', points: 5, icon: '🎒', completed: false, category: 'Morning' },
      { id: '4', title: 'Do homework', points: 10, icon: '📚', completed: false, category: 'Afternoon' },
      { id: '5', title: 'Tidy room', points: 8, icon: '🧹', completed: false, category: 'Evening' },
    ]);
  }, []);

  const completedQuests = quests.filter(q => q.completed).length;
  const progressPercentage = Math.round((completedQuests / quests.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue/20 via-light-gray to-mint-green/20 pb-20">
      <PageHeader 
        title={`Hi ${userProfile?.displayName}! 🎮`}
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
            <p className="text-2xl font-bold text-dark-slate">{userProfile?.points || 0}</p>
            <p className="text-xs text-medium-gray">Points</p>
          </Card>
          <Card className="p-3 text-center">
            <Zap className="h-6 w-6 mx-auto mb-1 text-coral-accent" />
            <p className="text-2xl font-bold text-dark-slate">{userProfile?.currentStreak || 0}</p>
            <p className="text-xs text-medium-gray">Day Streak</p>
          </Card>
          <Card className="p-3 text-center">
            <Target className="h-6 w-6 mx-auto mb-1 text-mint-green" />
            <p className="text-2xl font-bold text-dark-slate">{userProfile?.badges?.length || 0}</p>
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
            currentStreak={userProfile?.currentStreak || 0}
            unlockedRooms={[]}
            avatarUrl={userProfile?.avatar || ''}
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
      </div>
    </div>
  );
}
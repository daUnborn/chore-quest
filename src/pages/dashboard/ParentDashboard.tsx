import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Users,
  Trophy,
  TrendingUp,
  Plus,
  Calendar,
  FileText,
  Gift
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { WeeklyCalendar } from '@/components/dashboard/WeeklyCalendar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FAB } from '@/components/layout/FAB';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { CreateRewardModal } from '@/components/rewards/CreateRewardModal';
import { useTasks } from '@/hooks/useTasks';
import { useRewards } from '@/hooks/useRewards';
import { useDashboardData } from '@/hooks/useDashboardData';
import { FamilyLeaderboard } from '@/components/dashboard/FamilyLeaderboard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';


export function ParentDashboard() {
  const navigate = useNavigate();
  const { userProfile, logout, getCurrentDisplayName, currentUser } = useAuth();
  const { createTask } = useTasks();
  const { createReward } = useRewards();
  const { stats, familyLeaderboard, recentActivities, loading } = useDashboardData();
  const [weekDays, setWeekDays] = useState<any[]>([]);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCreateRewardModal, setShowCreateRewardModal] = useState(false);
  const [showRecap, setShowRecap] = useState(false);



  useEffect(() => {
    // Generate week days
    const today = new Date();
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      week.push({
        date,
        tasksCompleted: Math.floor(Math.random() * 5),
        totalTasks: 5,
      });
    }
    setWeekDays(week);
  }, []);

  const handleCreateReward = async (rewardData: any) => {
    try {
      await createReward(rewardData);
      setShowCreateRewardModal(false);
    } catch (error) {
      console.error('Failed to create reward:', error);
    }
  };

  const kpiData = [
    {
      title: 'Tasks Today',
      value: `${stats.tasksCompletedToday}/${stats.tasksToday}`,
      icon: <CheckCircle className="h-8 w-8" />,
      color: 'blue' as const,
      trend: stats.tasksToday > 0 ? {
        value: Math.round((stats.tasksCompletedToday / stats.tasksToday) * 100),
        isPositive: true
      } : undefined,
    },
    {
      title: 'Family Members',
      value: familyLeaderboard.length.toString(),
      icon: <Users className="h-8 w-8" />,
      color: 'green' as const,
    },
    {
      title: 'Total Points',
      value: stats.totalPoints.toString(),
      icon: <Trophy className="h-8 w-8" />,
      color: 'yellow' as const,
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Family Streak',
      value: `${stats.currentStreak} days`,
      icon: <TrendingUp className="h-8 w-8" />,
      color: 'purple' as const,
      trend: { value: stats.currentStreak, isPositive: true },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray pb-20">
        <PageHeader title={`Welcome back, ${getCurrentDisplayName()}!`} showMenuButton={false} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <PageHeader
        title={`Welcome back, ${userProfile?.displayName}!`}
        showMenuButton={false}
      />

      <div className="p-4 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          {kpiData.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <KPICard {...kpi} onClick={() => navigate('/tasks')} />
            </motion.div>
          ))}
        </div>

        {/* Calendar Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <WeeklyCalendar
            days={weekDays}
            onDayClick={(date) => console.log('Day clicked:', date)}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4">
            <h3 className="font-semibold text-dark-slate mb-3">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateTaskModal(true)}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs">Add Task</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateRewardModal(true)}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <Gift className="h-5 w-5" />
                <span className="text-xs">Add Reward</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecap(true)}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs">View Recap</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity & Family Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recent Activity - Shows first on mobile, left on desktop */}
          <RecentActivity activities={recentActivities} />
          
          {/* Family Leaderboard - Shows second on mobile, right on desktop */}
          <FamilyLeaderboard 
            members={familyLeaderboard} 
            currentUserId={currentUser?.uid || 'parent'}
          />
        </motion.div>

        {/* Temporary Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-4">
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await logout();
                  navigate('/login');
                } catch (error) {
                  console.error('Logout failed:', error);
                }
              }}
              fullWidth
            >
              Logout (Temporary)
            </Button>
          </Card>
        </motion.div>
      </div>

      <FAB onClick={() => navigate('/tasks')} />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onSubmit={async (taskData) => {
          try {
            await createTask(taskData);
            setShowCreateTaskModal(false);
          } catch (error) {
            console.error('Failed to create task:', error);
          }
        }}
      />

      {/* Create Reward Modal */}
      <CreateRewardModal
        isOpen={showCreateRewardModal}
        onClose={() => setShowCreateRewardModal(false)}
        onSubmit={handleCreateReward}
      />
    </div>
  );
}
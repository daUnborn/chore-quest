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


export function ParentDashboard() {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const [weekDays, setWeekDays] = useState<any[]>([]);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCreateRewardModal, setShowCreateRewardModal] = useState(false);


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

  const kpiData = [
    {
      title: 'Tasks Today',
      value: '8/12',
      icon: <CheckCircle className="h-8 w-8" />,
      color: 'blue' as const,
      trend: { value: 15, isPositive: true },
    },
    {
      title: 'Active Kids',
      value: '3',
      icon: <Users className="h-8 w-8" />,
      color: 'green' as const,
    },
    {
      title: 'Total Points',
      value: '245',
      icon: <Trophy className="h-8 w-8" />,
      color: 'yellow' as const,
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Completion',
      value: '67%',
      icon: <TrendingUp className="h-8 w-8" />,
      color: 'purple' as const,
      trend: { value: 12, isPositive: true },
    },
  ];

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
                onClick={() => navigate('/recap')}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs">View Recap</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-4">
            <h3 className="font-semibold text-dark-slate mb-3">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-mint-green flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Emma completed "Make bed"</p>
                    <p className="text-xs text-medium-gray">5 minutes ago</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">+5 pts</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sunshine-yellow flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Jack earned "Week Warrior" badge</p>
                    <p className="text-xs text-medium-gray">1 hour ago</p>
                  </div>
                </div>
                <Badge variant="warning" size="sm">New!</Badge>
              </div>
            </div>
          </Card>
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
          // TODO: Implement task creation
          console.log('Create task:', taskData);
          setShowCreateTaskModal(false);
        }}
      />

      {/* Create Reward Modal */}
      <CreateRewardModal
        isOpen={showCreateRewardModal}
        onClose={() => setShowCreateRewardModal(false)}
        onSubmit={async (rewardData) => {
          // TODO: Implement reward creation
          console.log('Create reward:', rewardData);
          setShowCreateRewardModal(false);
        }}
      />
    </div>
  );
}
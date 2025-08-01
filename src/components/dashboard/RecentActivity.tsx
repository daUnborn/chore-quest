import { motion } from 'framer-motion';
import { CheckCircle, Trophy, Award, Clock, Gift } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'badge_earned' | 'streak_milestone';
  memberName: string;
  memberAvatar?: string;
  title: string;
  points?: number;
  timestamp: Date;
  icon: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
  switch (type) {
    case 'task_completed':
      return <CheckCircle className="h-4 w-4 text-mint-green" />;
    case 'badge_earned':
      return <Award className="h-4 w-4 text-sunshine-yellow" />;
    case 'streak_milestone':
      return <Trophy className="h-4 w-4 text-coral-accent" />;
    case 'reward_claimed':
      return <Gift className="h-4 w-4 text-lavender-accent" />;
    default:
      return <Clock className="h-4 w-4 text-medium-gray" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'bg-mint-green';
      case 'badge_earned':
        return 'bg-sunshine-yellow';
      case 'streak_milestone':
        return 'bg-coral-accent';
      case 'reward_claimed':
        return 'bg-lavender-accent';
      default:
        return 'bg-medium-gray';
    }
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-dark-slate mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-pastel-blue" />
        Recent Activity
      </h3>
      
      <div className="space-y-3">
        {activities.slice(0, 5).map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-light-gray transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex items-center gap-2">
                {activity.memberAvatar && (
                  <img
                    src={activity.memberAvatar}
                    alt={activity.memberName}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-dark-slate">
                    <span className="font-semibold">{activity.memberName}</span> {activity.title}
                    {activity.type === 'streak_milestone' && ' 🎉'}
                    {activity.type === 'badge_earned' && ' ⭐'}
                  </p>
                  <p className="text-xs text-medium-gray">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
            
            {activity.points && (
              <Badge variant="success" size="sm">
                +{activity.points} pts
              </Badge>
            )}
          </motion.div>
        ))}
        
        {activities.length === 0 && (
          <div className="text-center py-6 text-medium-gray">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </Card>
  );
}
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface FamilyMember {
  id: string;
  name: string;
  points: number;
  completedTasks: number;
  currentStreak: number;
  avatar?: string;
}

interface FamilyLeaderboardProps {
  members: FamilyMember[];
  currentUserId: string;
}

export function FamilyLeaderboard({ members, currentUserId }: FamilyLeaderboardProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Award className="h-5 w-5 text-orange-600" />;
      default: return <span className="text-sm font-bold text-medium-gray">#{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-50 border-yellow-200';
      case 1: return 'bg-gray-50 border-gray-200';
      case 2: return 'bg-orange-50 border-orange-200';
      default: return 'bg-white border-light-gray';
    }
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-dark-slate mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-sunshine-yellow" />
        Family Leaderboard
      </h3>
      
      <div className="space-y-2">
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg border-2 transition-all ${getRankColor(index)} ${
              member.id === currentUserId ? 'ring-2 ring-pastel-blue ring-opacity-30' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(index)}
                </div>
                
                <div className="flex items-center gap-2">
                  {member.avatar && (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-dark-slate">
                      {member.name}
                      {member.id === currentUserId && (
                        <Badge variant="primary" size="sm" className="ml-2">You</Badge>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-medium-gray">
                      <span>{member.completedTasks} tasks</span>
                      <span>•</span>
                      <span>{member.currentStreak} day streak</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-lg text-dark-slate">{member.points}</p>
                <p className="text-xs text-medium-gray">points</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {members.length === 0 && (
        <div className="text-center py-6 text-medium-gray">
          <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No family members yet</p>
        </div>
      )}
    </Card>
  );
}
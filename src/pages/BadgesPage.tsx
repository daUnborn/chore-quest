import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { BadgeDisplay } from '@/components/badges/BadgeDisplay';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { badgesService } from '@/services/badges.service';

interface UserBadge {
  id: string;
  name: string;
  iconUrl: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isSecret: boolean;
  earnedAt?: Date;
}

export function BadgesPage() {
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      if (!userProfile?.activeProfile) return;

      try {
        const activeUserId = userProfile.activeProfile === 'parent' ? currentUser?.uid : userProfile.activeProfile;
        if (activeUserId) {
          // Load earned badges
          const userResponse = await badgesService.getUserBadges(activeUserId);
          if (userResponse.data) {
            setUserBadges(userResponse.data);
          }

          // Load all available badges
          const allResponse = await badgesService.getAllBadges();
          if (allResponse.data) {
            setAllBadges(allResponse.data);
          }
        }
      } catch (error) {
        console.error('Failed to load badges:', error);
        // Set mock data
        const mockEarned: UserBadge[] = [
          { 
            id: '1', 
            name: 'First Steps', 
            iconUrl: '🏃', 
            description: 'Complete your first task', 
            tier: 'bronze', 
            isSecret: false,
            earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          { 
            id: '2', 
            name: 'Star Helper', 
            iconUrl: '🌟', 
            description: 'Help family members', 
            tier: 'silver', 
            isSecret: false,
            earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
        ];

        const mockAll: UserBadge[] = [
          ...mockEarned,
          { 
            id: '3', 
            name: 'Task Master', 
            iconUrl: '🎯', 
            description: 'Complete 10 tasks', 
            tier: 'gold', 
            isSecret: false
          },
          { 
            id: '4', 
            name: 'Streak Champion', 
            iconUrl: '🔥', 
            description: 'Maintain a 7-day streak', 
            tier: 'gold', 
            isSecret: false
          },
          { 
            id: '5', 
            name: 'Super Helper', 
            iconUrl: '🦸', 
            description: 'Complete 50 tasks', 
            tier: 'platinum', 
            isSecret: false
          },
        ];

        setUserBadges(mockEarned);
        setAllBadges(mockAll);
      } finally {
        setLoading(false);
      }
    };

    loadBadges();
  }, [userProfile?.activeProfile, currentUser]);

  const earnedBadgeIds = userBadges.map(badge => badge.id);
  const unearnedBadges = allBadges.filter(badge => !earnedBadgeIds.includes(badge.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray pb-20">
        <PageHeader title="My Badges" showBackButton />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <PageHeader 
        title="My Badges" 
        showBackButton 
        rightActions={
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        }
      />

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sunshine-yellow/20 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-sunshine-yellow" />
          </div>
          <h2 className="text-2xl font-bold text-dark-slate mb-2">
            {userBadges.length} Badge{userBadges.length !== 1 ? 's' : ''} Earned
          </h2>
          <p className="text-medium-gray">
            {unearnedBadges.length} more to unlock!
          </p>
        </motion.div>

        {/* Earned Badges */}
        {userBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-sunshine-yellow" />
                <h3 className="font-semibold text-dark-slate">Earned Badges</h3>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {userBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <BadgeDisplay
                      badge={badge}
                      earned={true}
                      size="md"
                      onClick={() => {
                        // Show badge details modal (future enhancement)
                        console.log('Badge clicked:', badge);
                      }}
                    />
                    {badge.earnedAt && (
                      <p className="text-xs text-medium-gray text-center mt-1">
                        {badge.earnedAt.toLocaleDateString()}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Available Badges */}
        {unearnedBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-full bg-medium-gray/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-medium-gray rounded-full" />
                </div>
                <h3 className="font-semibold text-dark-slate">Available Badges</h3>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {unearnedBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <BadgeDisplay
                      badge={badge}
                      earned={false}
                      size="md"
                      showProgress={false}
                      onClick={() => {
                        // Show badge requirements modal (future enhancement)
                        console.log('Locked badge clicked:', badge);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {userBadges.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-medium-gray/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-medium-gray" />
              </div>
              <h3 className="text-lg font-semibold text-dark-slate mb-2">
                No badges earned yet
              </h3>
              <p className="text-medium-gray mb-4">
                Complete tasks and build streaks to earn your first badge!
              </p>
              <Button onClick={() => navigate('/tasks')}>
                Start Completing Tasks
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Badge Categories Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <h3 className="font-semibold text-dark-slate mb-3">Badge Tiers</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-400 rounded-full" />
                <span className="text-sm">Bronze - Getting Started</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full" />
                <span className="text-sm">Silver - Making Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                <span className="text-sm">Gold - Expert Level</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-400 rounded-full" />
                <span className="text-sm">Platinum - Master</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
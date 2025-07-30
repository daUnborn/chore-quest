import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag, Gift, Trophy, Star } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FAB } from '@/components/layout/FAB';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';

// Mock reward type
interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: string;
  imageUrl?: string;
  claimedBy: { userId: string; claimedAt: Date; redeemedAt?: Date }[];
  isActive: boolean;
}

// Mock data
const mockRewards: Reward[] = [
  {
    id: '1',
    title: '30 Minutes Extra Screen Time',
    description: 'Enjoy an extra 30 minutes of screen time on weekends',
    cost: 50,
    category: 'entertainment',
    claimedBy: [],
    isActive: true,
  },
  {
    id: '2',
    title: 'Choose Tonight\'s Dinner',
    description: 'Pick what the family has for dinner',
    cost: 75,
    category: 'privileges',
    claimedBy: [],
    isActive: true,
  },
  {
    id: '3',
    title: '$5 Allowance Bonus',
    description: 'Extra $5 added to your weekly allowance',
    cost: 100,
    category: 'money',
    claimedBy: [],
    isActive: true,
  },
  {
    id: '4',
    title: 'Movie Night Pick',
    description: 'Choose the movie for family movie night',
    cost: 60,
    category: 'entertainment',
    claimedBy: [{ userId: 'current-user', claimedAt: new Date() }],
    isActive: true,
  }
];

export function RewardsPage() {
  const { userProfile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>(mockRewards);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  const [userPoints] = useState(125); // Mock points
  
  const isParent = userProfile?.role === 'parent';
  const isChild = userProfile?.role === 'child';
  const currentUserId = userProfile?.uid || 'current-user';

  // Get user's claimed rewards
  const myRewards = rewards.filter(reward =>
    reward.claimedBy.some(claim => claim.userId === currentUserId)
  );

  const handleClaimReward = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || userPoints < reward.cost) return;

    // Update reward with claim
    setRewards(prev => prev.map(r => 
      r.id === rewardId 
        ? {
            ...r,
            claimedBy: [...r.claimedBy, { userId: currentUserId, claimedAt: new Date() }]
          }
        : r
    ));

    // Celebrate!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#5DADE2', '#48C9B0', '#F4D03F'],
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'entertainment': return '🎮';
      case 'privileges': return '👑';
      case 'money': return '💰';
      case 'treats': return '🍭';
      default: return '🎁';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'entertainment': return 'bg-blue-100 text-blue-800';
      case 'privileges': return 'bg-purple-100 text-purple-800';
      case 'money': return 'bg-green-100 text-green-800';
      case 'treats': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <PageHeader
        title="Rewards Shop"
        rightActions={
          isChild && (
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-sunshine-yellow" />
              <span className="font-semibold">{userPoints}</span>
            </div>
          )
        }
      />

      <div className="p-4 space-y-6">
        {/* Points Display for Child */}
        {isChild && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-pastel-blue to-mint-green rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Your Points</h2>
                <p className="text-white/80 text-sm">Keep earning to unlock more rewards!</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{userPoints}</div>
                <div className="text-white/80 text-sm">Available</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white rounded-lg p-1">
          <Button
            variant={activeTab === 'shop' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('shop')}
            className="flex-1"
            leftIcon={<ShoppingBag className="h-4 w-4" />}
          >
            Shop
          </Button>
          <Button
            variant={activeTab === 'inventory' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('inventory')}
            className="flex-1"
            leftIcon={<Gift className="h-4 w-4" />}
          >
            My Rewards ({myRewards.length})
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'shop' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl p-8 text-center">
                <Gift className="h-16 w-16 mx-auto mb-4 text-medium-gray" />
                <h3 className="text-lg font-semibold text-dark-slate mb-2">No rewards available</h3>
                <p className="text-medium-gray">
                  {isParent ? "Create rewards for your kids to claim" : "Check back later for new rewards!"}
                </p>
                {isParent && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4"
                    variant="primary"
                  >
                    Create First Reward
                  </Button>
                )}
              </div>
            ) : (
              rewards.map((reward, index) => {
                const isClaimed = reward.claimedBy.some(c => c.userId === currentUserId);
                const canAfford = userPoints >= reward.cost;
                
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${
                      isClaimed 
                        ? 'border-green-200 bg-green-50' 
                        : canAfford 
                        ? 'border-transparent hover:border-pastel-blue hover:shadow-md' 
                        : 'border-gray-200 opacity-60'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCategoryIcon(reward.category)}</span>
                        <div>
                          <h3 className="font-semibold text-dark-slate">{reward.title}</h3>
                          <Badge className={getCategoryColor(reward.category)} size="sm">
                            {reward.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sunshine-yellow">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-bold">{reward.cost}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-medium-gray text-sm mb-4">{reward.description}</p>

                    {/* Action Button */}
                    {isChild && (
                      <Button
                        onClick={() => handleClaimReward(reward.id)}
                        disabled={!canAfford || isClaimed}
                        variant={isClaimed ? 'success' : canAfford ? 'primary' : 'ghost'}
                        fullWidth
                        className="mt-auto"
                      >
                        {isClaimed ? '✅ Claimed' : canAfford ? 'Claim Reward' : 'Not enough points'}
                      </Button>
                    )}

                    {isClaimed && (
                      <div className="mt-2 text-center">
                        <Badge variant="success" size="sm">
                          Claimed {new Date().toLocaleDateString()}
                        </Badge>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRewards.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl p-8 text-center">
                <Gift className="h-16 w-16 mx-auto mb-4 text-medium-gray" />
                <h3 className="text-lg font-semibold text-dark-slate mb-2">No rewards claimed yet</h3>
                <p className="text-medium-gray mb-4">Visit the shop to claim your first reward!</p>
                <Button onClick={() => setActiveTab('shop')} variant="primary">
                  Go to Shop
                </Button>
              </div>
            ) : (
              myRewards.map((reward, index) => {
                const claim = reward.claimedBy.find(c => c.userId === currentUserId);
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-200 bg-green-50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCategoryIcon(reward.category)}</span>
                        <div>
                          <h3 className="font-semibold text-dark-slate">{reward.title}</h3>
                          <Badge className={getCategoryColor(reward.category)} size="sm">
                            {reward.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">
                        ✅ Owned
                      </Badge>
                    </div>
                    
                    <p className="text-medium-gray text-sm mb-4">{reward.description}</p>
                    
                    <div className="text-center">
                      <Badge variant="secondary" size="sm">
                        Claimed {claim?.claimedAt.toLocaleDateString()}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* FAB for Parents */}
      {isParent && (
        <FAB
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="h-6 w-6" />}
          label="Add Reward"
        />
      )}

      {/* Placeholder for Create Reward Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Reward</h2>
            <p className="text-medium-gray mb-4">Reward creation form would go here...</p>
            <Button onClick={() => setShowCreateModal(false)} variant="primary" fullWidth>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
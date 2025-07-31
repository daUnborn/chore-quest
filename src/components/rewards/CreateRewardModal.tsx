import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Package, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/contexts/AuthContext';

// Updated Reward interface to match what we're using
interface Reward {
  id?: string;
  householdId: string;
  title: string;
  description: string;
  cost: number;
  category: 'virtual' | 'real-world' | 'privilege';
  imageUrl: string;
  stock?: number;
  isActive: boolean;
  createdBy: string;
  createdAt?: Date;
  claimedBy?: { userId: string; claimedAt: Date; redeemedAt?: Date }[];
}

interface CreateRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reward: Omit<Reward, 'id' | 'createdAt' | 'claimedBy'>) => Promise<void>;
}

const REWARD_CATEGORIES = [
  { value: 'virtual', label: 'Virtual', icon: '🎮', color: 'bg-pastel-blue' },
  { value: 'real-world', label: 'Real World', icon: '🎁', color: 'bg-mint-green' },
  { value: 'privilege', label: 'Privilege', icon: '⭐', color: 'bg-sunshine-yellow' },
];

const EMOJI_OPTIONS = ['🍦', '🍕', '🎮', '📱', '🎬', '🏈', '🎨', '📚', '🚴', '🎸'];

export function CreateRewardModal({ isOpen, onClose, onSubmit }: CreateRewardModalProps) {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost: 50,
    category: 'virtual' as Reward['category'],
    imageUrl: '🎁',
    stock: undefined as number | undefined,
    hasStock: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Build the reward data object, excluding undefined values
      const rewardData: any = {
        householdId: userProfile?.householdIds?.[0] || 'default-household',
        title: formData.title.trim(),
        cost: formData.cost,
        category: formData.category,
        imageUrl: formData.imageUrl,
        isActive: true,
        createdBy: userProfile?.uid || 'unknown',
      };

      // Only add description if it has content
      if (formData.description && formData.description.trim()) {
        rewardData.description = formData.description.trim();
      }

      // Only add stock if hasStock is enabled and stock has a value
      if (formData.hasStock && formData.stock && formData.stock > 0) {
        rewardData.stock = formData.stock;
      }

      console.log('Submitting reward data:', rewardData);

      await onSubmit(rewardData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        cost: 50,
        category: 'virtual',
        imageUrl: '🎁',
        stock: undefined,
        hasStock: false,
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to create reward:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickSetCost = (cost: number) => {
    setFormData(prev => ({ ...prev, cost }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Reward"
      size="md"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <Input
            label="Reward Title"
            placeholder="e.g., Extra Screen Time, Ice Cream Treat"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-1">
              Description (optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-light-gray bg-white px-3 py-2 text-dark-slate resize-none focus:border-pastel-blue focus:outline-none focus:ring-2 focus:ring-pastel-blue focus:ring-opacity-20"
              rows={2}
              placeholder="Add details about this reward..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {REWARD_CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, category: cat.value as Reward['category'] })}
                  className={cn(
                    'p-2 rounded-lg border-2 transition-all text-center',
                    formData.category === cat.value
                      ? `border-dark-slate ${cat.color} text-white`
                      : 'border-light-gray hover:border-medium-gray bg-white'
                  )}
                >
                  <div className="text-lg mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium">{cat.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-2">
              Choose Icon
            </label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: emoji })}
                  className={cn(
                    'w-10 h-10 rounded-lg border-2 text-lg transition-all flex items-center justify-center',
                    formData.imageUrl === emoji
                      ? 'border-pastel-blue bg-pastel-blue/10'
                      : 'border-light-gray hover:border-medium-gray'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Cost - IMPROVED SECTION */}
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-2">
              Point Cost
            </label>
            <div className="space-y-3">
              {/* Quick Set Buttons */}
              <div className="flex gap-2 flex-wrap">
                {[25, 50, 75, 100, 150, 200].map((points) => (
                  <Button
                    key={points}
                    type="button"
                    variant={formData.cost === points ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => quickSetCost(points)}
                    className="text-xs px-3 py-1"
                  >
                    {points}
                  </Button>
                ))}
              </div>
              
              {/* Custom Input - Made wider */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-medium-gray whitespace-nowrap">
                  Custom amount:
                </label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                  className="flex-1 min-w-[200px]"
                  min="1"
                  max="1000"
                  placeholder="Enter points..."
                />
                <span className="text-sm text-medium-gray">points</span>
              </div>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasStock}
                onChange={(e) => setFormData({ ...formData, hasStock: e.target.checked })}
                className="w-4 h-4 text-pastel-blue rounded focus:ring-pastel-blue"
              />
              <span className="text-sm font-medium text-dark-slate">Limited Stock</span>
            </label>
            
            {formData.hasStock && (
              <div className="mt-2">
                <Input
                  type="number"
                  label="Stock Quantity"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || undefined })}
                  leftIcon={<Package className="h-4 w-4" />}
                  min="1"
                  placeholder="How many available?"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t sticky bottom-0 bg-white">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={!formData.title || formData.cost <= 0 || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Reward'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Package, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Reward } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

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
      await onSubmit({
        householdId: userProfile?.householdIds[0] || '',
        title: formData.title,
        description: formData.description,
        cost: formData.cost,
        category: formData.category,
        imageUrl: formData.imageUrl,
        stock: formData.hasStock ? formData.stock : undefined,
        isActive: true,
        createdBy: userProfile?.id || '',
      });
      
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
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
            className="w-full rounded-lg border border-light-gray bg-white px-4 py-2 text-dark-slate resize-none focus:border-pastel-blue focus:outline-none focus:ring-2 focus:ring-pastel-blue focus:ring-opacity-20"
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
                  'p-3 rounded-lg border-2 transition-all text-center',
                  formData.category === cat.value
                    ? `border-dark-slate ${cat.color} text-white`
                    : 'border-light-gray hover:border-medium-gray bg-white'
                )}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
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
                  'w-12 h-12 rounded-lg border-2 text-2xl transition-all',
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

        {/* Cost */}
        <div>
          <label className="block text-sm font-medium text-dark-slate mb-2">
            Point Cost
          </label>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((points) => (
                <Button
                  key={points}
                  type="button"
                  variant={formData.cost === points ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => quickSetCost(points)}
                >
                  {points}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
              className="w-20"
              min="1"
              max="1000"
            />
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
        <div className="flex gap-3 pt-4 border-t">
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
            isLoading={isLoading}
            disabled={!formData.title || formData.cost <= 0}
          >
            Create Reward
          </Button>
        </div>
      </form>
    </Modal>
  );
}
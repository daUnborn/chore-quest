import { motion } from 'framer-motion';
import { UserCircle, Baby } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Card } from '@/components/ui/Card';

interface RoleSelectionProps {
  onNext: () => void;
}

export function RoleSelection({ onNext }: RoleSelectionProps) {
  const { updateData } = useOnboarding();

  const handleRoleSelect = (role: 'parent' | 'child') => {
    updateData({ role });
    onNext();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-white"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome to Chore Quest!</h1>
        <p className="text-white/80">Who's joining the adventure?</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            variant="interactive"
            className="p-8 text-center cursor-pointer hover:border-2 hover:border-pastel-blue"
            onClick={() => handleRoleSelect('parent')}
          >
            <UserCircle className="h-20 w-20 mx-auto mb-4 text-pastel-blue" />
            <h3 className="text-xl font-semibold mb-2">I'm a Parent</h3>
            <p className="text-sm text-medium-gray">
              Manage tasks and rewards for your family
            </p>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            variant="interactive"
            className="p-8 text-center cursor-pointer hover:border-2 hover:border-mint-green"
            onClick={() => handleRoleSelect('child')}
          >
            <Baby className="h-20 w-20 mx-auto mb-4 text-mint-green" />
            <h3 className="text-xl font-semibold mb-2">I'm a Kid</h3>
            <p className="text-sm text-medium-gray">
              Complete tasks and earn awesome rewards
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
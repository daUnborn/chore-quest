import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Users, Loader2 } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  createHousehold,
  joinHouseholdByCode,
  addUserToHousehold
} from '@/lib/firebase/households';

interface HouseholdSetupProps {
  onNext: () => void;
}

export function HouseholdSetup({ onNext }: HouseholdSetupProps) {
  const { data, updateData } = useOnboarding();
  const { currentUser, updateUserProfile } = useAuth();
  const [mode, setMode] = useState<'choice' | 'create' | 'join'>('choice');
  const [householdName, setHouseholdName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateHousehold = async () => {
    if (!currentUser || !householdName.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Create the household
      const { householdId, code } = await createHousehold(
        householdName,
        currentUser.uid
      );

      // Update user profile with role
      await updateUserProfile({
        role: data.role || 'parent'
      });

      // Add user to household
      await addUserToHousehold(
        currentUser.uid,
        householdId,
        householdName,
        'admin'
      );

      // Update onboarding data
      updateData({
        householdAction: 'create',
        householdCode: code,
        householdName
      });

      // Force auth context to refresh user profile
      window.location.reload(); // Temporary solution to force refresh

    } catch (err) {
      console.error('Error creating household:', err);
      setError('Failed to create household. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinHousehold = async () => {
    if (!currentUser || !joinCode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await joinHouseholdByCode(joinCode);

      if (!result) {
        setError('Invalid household code. Please check and try again.');
        return;
      }

      // Update user profile with role
      await updateUserProfile({
        role: data.role || 'child'
      });

      // Add user to household
      await addUserToHousehold(
        currentUser.uid,
        result.householdId,
        result.household.name,
        'member'
      );

      // Update onboarding data
      updateData({
        householdAction: 'join',
        householdCode: joinCode,
        householdName: result.household.name
      });

      // Force auth context to refresh user profile
      window.location.reload(); // Temporary solution to force refresh

    } catch (err) {
      console.error('Error joining household:', err);
      setError('Failed to join household. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'choice') {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <h2 className="text-2xl font-bold mb-2">Set Up Your Household</h2>
          <p className="text-white/80">Create a new family or join an existing one</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              variant="interactive"
              className="p-6 text-center cursor-pointer"
              onClick={() => setMode('create')}
            >
              <Home className="h-16 w-16 mx-auto mb-3 text-pastel-blue" />
              <h3 className="text-lg font-semibold mb-1">Create New</h3>
              <p className="text-sm text-medium-gray">Start a new family</p>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              variant="interactive"
              className="p-6 text-center cursor-pointer"
              onClick={() => setMode('join')}
            >
              <Users className="h-16 w-16 mx-auto mb-3 text-mint-green" />
              <h3 className="text-lg font-semibold mb-1">Join Family</h3>
              <p className="text-sm text-medium-gray">Enter a family code</p>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <Card className="p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMode('choice')}
          className="mb-4"
        >
          ← Back
        </Button>

        <h2 className="text-2xl font-bold mb-2">Create Your Family</h2>
        <p className="text-medium-gray mb-6">Choose a fun name for your household</p>

        <form onSubmit={(e) => { e.preventDefault(); handleCreateHousehold(); }}>
          <Input
            label="Household Name"
            placeholder="The Smith Family"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            error={error}
            className="mb-6"
            required
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            disabled={isLoading || !householdName.trim()}
          >
            Create Household
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode('choice')}
        className="mb-4"
      >
        ← Back
      </Button>

      <h2 className="text-2xl font-bold mb-2">Join a Family</h2>
      <p className="text-medium-gray mb-6">Enter the 6-character family code</p>

      <form onSubmit={(e) => { e.preventDefault(); handleJoinHousehold(); }}>
        <Input
          label="Family Code"
          placeholder="ABC123"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          error={error}
          maxLength={6}
          className="mb-6 text-center text-2xl font-mono"
          required
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          disabled={isLoading || joinCode.length !== 6}
        >
          Join Household
        </Button>
      </form>
    </Card>
  );
}
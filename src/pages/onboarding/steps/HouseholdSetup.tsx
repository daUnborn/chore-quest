import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Users, Loader2 } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useNavigate } from 'react-router-dom';
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
  const { currentUser, updateUserProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'choice' | 'create' | 'join'>('create');
  const [householdName, setHouseholdName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

const handleCreateHousehold = async () => {
    if (!currentUser || !householdName.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('Creating household for user:', currentUser.uid);
      
      // Create the household
      const { householdId, code } = await createHousehold(
        householdName,
        currentUser.uid
      );
      console.log('Household created:', householdId);

      // Add user to household (this will create/update user doc)
      await addUserToHousehold(
        currentUser.uid,
        householdId,
        householdName,
        'admin'
      );
      console.log('User added to household');

      // Update onboarding data
      updateData({
        householdAction: 'create',
        householdCode: code,
        householdName
      });

      // Refresh user profile to get updated household data
      await refreshUserProfile();
      console.log('Profile refreshed');

      // Navigate to next step
      navigate('/profiles');
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

      // Refresh user profile to get updated household data
      await refreshUserProfile();

      // Navigate to next step
      onNext();

    } catch (err) {
      console.error('Error joining household:', err);
      setError('Failed to join household. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

if (mode === 'create') {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <h1 className="text-3xl font-bold mb-2">Create Your Family</h1>
          <p className="text-white/80">Choose a fun name for your household</p>
        </motion.div>

        <Card className="p-6">
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
      </div>
    );
  }

return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-white"
      >
        <h1 className="text-3xl font-bold mb-2">Join a Family</h1>
        <p className="text-white/80">Enter the 6-character family code</p>
      </motion.div>

      <Card className="p-6">
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

        <div className="text-center mt-4">
          <Button
            variant="ghost"
            onClick={() => setMode('create')}
            className="text-medium-gray hover:text-dark-slate"
          >
            Want to create a new family instead?
          </Button>
        </div>
      </Card>
    </div>
  );
}
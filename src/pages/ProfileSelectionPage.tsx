// src/pages/ProfileSelectionPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Baby, Plus, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { ChildProfile } from '@/types';

export function ProfileSelectionPage() {
  const navigate = useNavigate();
  const { userProfile, currentUser, updateUserProfile, refreshUserProfile } = useAuth();
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form for adding new child
  const [childForm, setChildForm] = useState({
    name: '',
    age: 5,
    pinEnabled: false,
    pin: ''
  });

  useEffect(() => {
    loadChildProfiles();
  }, [userProfile]);

  const loadChildProfiles = async () => {
    if (!userProfile?.householdIds?.length) {
      setIsLoading(false);
      return;
    }

    try {
      // Load child profiles from user document
      const profiles = userProfile.childProfiles || [];
      setChildProfiles(profiles);
    } catch (error) {
      console.error('Failed to load child profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentLogin = async () => {
    try {
      // Set current user as active parent and navigate to dashboard
      await updateUserProfile({ 
        activeProfile: 'parent',
        role: 'parent'
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to set parent profile:', error);
    }
  };

  const handleChildSelect = async (child: ChildProfile) => {
    if (child.pinEnabled && child.pin) {
      setSelectedChild(child);
      setShowPinPrompt(true);
      setPin('');
      setPinError('');
    } else {
      await loginAsChild(child);
    }
  };

  const handlePinSubmit = async () => {
    if (!selectedChild) return;

    if (pin === selectedChild.pin) {
      setShowPinPrompt(false);
      await loginAsChild(selectedChild);
    } else {
      setPinError('Incorrect PIN. Try again.');
      setPin('');
    }
  };

  const loginAsChild = async (child: ChildProfile) => {
    try {
      // Update user profile to track active child
      await updateUserProfile({ 
        activeProfile: child.id,
        role: 'child',
        displayName: child.name,
        avatar: child.avatar
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to set child profile:', error);
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !currentUser) return;

    setIsLoading(true);
    try {
      const newChild: ChildProfile = {
        id: `child_${Date.now()}`,
        name: childForm.name,
        age: childForm.age,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${childForm.name}`,
        pinEnabled: childForm.pinEnabled,
        pin: childForm.pinEnabled ? childForm.pin : undefined,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
        completedTasks: 0
      };

      // Update user profile with new child
      const updatedProfiles = [...(userProfile.childProfiles || []), newChild];
      await updateUserProfile({ childProfiles: updatedProfiles });
      
      setChildProfiles(updatedProfiles);
      setShowAddChild(false);
      setChildForm({ name: '', age: 5, pinEnabled: false, pin: '' });
    } catch (error) {
      console.error('Failed to add child:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToHouseholdSetup = () => {
    navigate('/onboarding');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-light-gray to-mint-green flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading profiles...</p>
        </div>
      </div>
    );
  }

  // If no household, redirect to household setup
  if (!userProfile?.householdIds?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-light-gray to-mint-green flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to Chore Quest!</h2>
            <p className="text-medium-gray mb-6">
              Let's set up your family household first.
            </p>
            <Button onClick={navigateToHouseholdSetup} fullWidth size="lg">
              Set Up Household
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-light-gray to-mint-green">
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center text-white mb-8">
            <h1 className="text-3xl font-bold mb-2">Who's using Chore Quest?</h1>
            <p className="text-white/80">Select your profile to continue</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Parent Profile */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                variant="interactive"
                className="p-6 text-center cursor-pointer hover:border-2 hover:border-pastel-blue"
                onClick={handleParentLogin}
              >
                <UserCircle className="h-20 w-20 mx-auto mb-4 text-pastel-blue" />
                <h3 className="text-lg font-semibold mb-1">Parent</h3>
                <p className="text-sm text-medium-gray">Manage family tasks</p>
              </Card>
            </motion.div>

            {/* Child Profiles */}
            {childProfiles.map((child) => (
              <motion.div
                key={child.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  variant="interactive"
                  className="p-6 text-center cursor-pointer hover:border-2 hover:border-mint-green"
                  onClick={() => handleChildSelect(child)}
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-mint-green flex items-center justify-center">
                    <img
                      src={child.avatar}
                      alt={child.name}
                      className="w-16 h-16 rounded-full"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{child.name}</h3>
                  <p className="text-sm text-medium-gray">
                    Age {child.age} {child.pinEnabled && '🔒'}
                  </p>
                </Card>
              </motion.div>
            ))}

            {/* Add Child Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                variant="interactive"
                className="p-6 text-center cursor-pointer hover:border-2 hover:border-sunshine-yellow border-dashed border-2 border-medium-gray"
                onClick={() => setShowAddChild(true)}
              >
                <Plus className="h-20 w-20 mx-auto mb-4 text-sunshine-yellow" />
                <h3 className="text-lg font-semibold mb-1">Add Child</h3>
                <p className="text-sm text-medium-gray">Create new profile</p>
              </Card>
            </motion.div>
          </div>

          {/* Settings Link */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/household-settings')}
              className="text-white hover:bg-white/10"
              leftIcon={<Settings className="h-4 w-4" />}
            >
              Household Settings
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Add Child Modal */}
      <Modal
        isOpen={showAddChild}
        onClose={() => setShowAddChild(false)}
        title="Add Child Profile"
        size="md"
      >
        <form onSubmit={handleAddChild} className="space-y-4">
          <Input
            label="Child's Name"
            placeholder="Enter name"
            value={childForm.name}
            onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
            required
          />
          
          <Input
            label="Age"
            type="number"
            min="3"
            max="18"
            value={childForm.age}
            onChange={(e) => setChildForm({ ...childForm, age: parseInt(e.target.value) })}
            required
          />

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={childForm.pinEnabled}
                onChange={(e) => setChildForm({ ...childForm, pinEnabled: e.target.checked })}
                className="w-4 h-4 text-pastel-blue rounded focus:ring-pastel-blue"
              />
              <span className="text-sm font-medium">Require PIN to access</span>
            </label>
          </div>

          {childForm.pinEnabled && (
            <Input
              label="4-Digit PIN"
              type="password"
              maxLength={4}
              placeholder="1234"
              value={childForm.pin}
              onChange={(e) => setChildForm({ ...childForm, pin: e.target.value })}
              required
            />
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddChild(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!childForm.name || (childForm.pinEnabled && childForm.pin.length !== 4)}
            >
              Add Child
            </Button>
          </div>
        </form>
      </Modal>

      {/* PIN Prompt Modal */}
      <Modal
        isOpen={showPinPrompt}
        onClose={() => setShowPinPrompt(false)}
        title={`Enter PIN for ${selectedChild?.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            type="password"
            maxLength={4}
            placeholder="Enter 4-digit PIN"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setPinError('');
            }}
            error={pinError}
            className="text-center text-2xl tracking-widest"
            autoFocus
          />
          
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowPinPrompt(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePinSubmit}
              fullWidth
              disabled={pin.length !== 4}
            >
              Enter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
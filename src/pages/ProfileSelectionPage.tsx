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

    // Get the actual parent display name (original name, not active profile name)
    const getParentDisplayName = () => {
        return userProfile?.displayName || 'Parent';
    };

    const handleParentLogin = async () => {
        // Check if parent has PIN protection
        if (userProfile?.parentPin) {
            setSelectedChild(null); // Clear selected child
            setShowPinPrompt(true);
            setPin('');
            setPinError('');
            return;
        }

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
        let correctPin = '';
        let isParentLogin = false;

        if (selectedChild) {
            // Child profile login
            correctPin = selectedChild.pin || '';
        } else {
            // Parent profile login
            correctPin = userProfile?.parentPin || '';
            isParentLogin = true;
        }

        if (pin === correctPin) {
            setShowPinPrompt(false);
            if (isParentLogin) {
                await updateUserProfile({
                    activeProfile: 'parent',
                    role: 'parent'
                });
                navigate('/dashboard');
            } else {
                await loginAsChild(selectedChild!);
            }
        } else {
            setPinError('Incorrect PIN. Try again.');
            setPin('');
        }
    };

    const loginAsChild = async (child: ChildProfile) => {
        try {
            // Update user profile to track active child (don't change displayName permanently)
            await updateUserProfile({
                activeProfile: child.id,
                role: 'child'
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
      const childProfileId = `child_${Date.now()}`;
      
      const newProfile: ChildProfile = {
        id: childProfileId,
        name: childForm.name,
        age: childForm.age,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${childForm.name}`,
        pinEnabled: childForm.pinEnabled,
        ...(childForm.pinEnabled && { pin: childForm.pin }),
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
        completedTasks: 0
      };

      // Create Firebase document for child profile
      await setDoc(doc(db, COLLECTIONS.USERS, childProfileId), {
        id: childProfileId,
        email: `${childProfileId}@child.local`, // Placeholder email
        displayName: childForm.name,
        role: 'child',
        avatar: newProfile.avatar,
        createdAt: new Date(),
        householdIds: userProfile.householdIds,
        isActive: true,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
        completedTasks: 0,
        joinedHouseholds: userProfile.joinedHouseholds,
        parentId: currentUser.uid, // Link to parent
        age: childForm.age,
        pinEnabled: childForm.pinEnabled,
        ...(childForm.pinEnabled && { pin: childForm.pin }),
      });

      // Update parent's child profiles list
      const updatedProfiles = [...(userProfile.childProfiles || []), newProfile];
      await updateUserProfile({ childProfiles: updatedProfiles });

      setChildProfiles(updatedProfiles);
      setShowAddChild(false);
      setChildForm({ name: '', age: 5, pinEnabled: false, pin: '' });
    } catch (error) {
      console.error('Failed to add profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState<ChildProfile | null>(null);
    const [parentPin, setParentPin] = useState('');

    const handleDeleteProfile = (profile: ChildProfile) => {
        setProfileToDelete(profile);
        setShowDeleteConfirm(true);
        setParentPin('');
        setPinError('');
    };

    const confirmDeleteProfile = async () => {
        if (!profileToDelete || !userProfile) return;

        // Check parent PIN (you'll need to add this to user profile)
        if (userProfile.parentPin && parentPin !== userProfile.parentPin) {
            setPinError('Incorrect PIN');
            return;
        }

        try {
            const updatedProfiles = childProfiles.filter(p => p.id !== profileToDelete.id);
            await updateUserProfile({ childProfiles: updatedProfiles });
            setChildProfiles(updatedProfiles);
            setShowDeleteConfirm(false);
            setProfileToDelete(null);
        } catch (error) {
            console.error('Failed to delete profile:', error);
        }
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
                                <h3 className="text-lg font-semibold mb-1">{getParentDisplayName()}</h3>
                                <p className="text-sm text-medium-gray">Manage family tasks</p>
                            </Card>
                        </motion.div>

                        {/* Child Profiles */}
                        {childProfiles.map((child) => (
                            <motion.div
                                key={child.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative"
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
                                {/* Delete button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteProfile(child);
                                    }}
                                    className="absolute top-2 right-2 w-6 h-6 bg-coral-accent rounded-full flex items-center justify-center text-white text-xs hover:bg-opacity-80"
                                >
                                    ×
                                </button>
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
                                <h3 className="text-lg font-semibold mb-1">Add New Profile</h3>
                                <p className="text-sm text-medium-gray">Create profile for family member</p>
                            </Card>
                        </motion.div>
                    </div>

                </motion.div>
            </div>

            {/* Add New Profile Modal */}
            <Modal
                isOpen={showAddChild}
                onClose={() => setShowAddChild(false)}
                title="Add New Profile"
                size="md"
            >
                <form onSubmit={handleAddChild} className="space-y-4">
                    <Input
                        label="Family Member Name"
                        placeholder="Enter name"
                        value={childForm.name}
                        onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Age"
                        type="number"
                        min="2"
                        max="100"
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
                            disabled={!childForm.name || (childForm.pinEnabled && childForm.pin.length !== 4) || isLoading}
                        >
                            Add Profile
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* PIN Prompt Modal */}
            <Modal
                isOpen={showPinPrompt}
                onClose={() => setShowPinPrompt(false)}
                title={selectedChild ? `Enter PIN for ${selectedChild.name}` : 'Enter Parent PIN'}
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
            {/* Delete Profile Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={`Delete ${profileToDelete?.name}'s Profile`}
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-medium-gray">
                        Are you sure you want to delete this profile? This action cannot be undone.
                    </p>

                    <Input
                        type="password"
                        label="Parent PIN"
                        placeholder="Enter your PIN to confirm"
                        value={parentPin}
                        onChange={(e) => {
                            setParentPin(e.target.value);
                            setPinError('');
                        }}
                        error={pinError}
                        autoFocus
                    />

                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteConfirm(false)}
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDeleteProfile}
                            fullWidth
                            disabled={!parentPin}
                        >
                            Delete Profile
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
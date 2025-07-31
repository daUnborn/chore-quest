import { createContext, useContext, useEffect, useState } from 'react';
import {
    User as FirebaseUser,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { User, UserProfile } from '@/types';
import { getAuthErrorMessage } from '@/lib/firebase/errors';

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userProfile: UserProfile | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string, parentPin?: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
    clearError: () => void;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user profile from Firestore
    const fetchUserProfile = async (uid: string) => {
        try {
            console.log('Fetching user profile for:', uid);
            const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
            if (userDoc.exists()) {
                const profile = userDoc.data() as UserProfile;
                console.log('User profile loaded:', profile);
                setUserProfile(profile);
            } else {
                console.log('No user profile found for:', uid);
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    };

    const refreshUserProfile = async () => {
        if (currentUser) {
            await fetchUserProfile(currentUser.uid);
        }
    };

    // Get current display name based on active profile
    const getCurrentDisplayName = () => {
        if (!userProfile) return '';
        
        if (userProfile.activeProfile === 'parent') {
            return userProfile.displayName; // Original parent name
        }
        
        // Find child profile
        const childProfile = userProfile.childProfiles?.find(
            child => child.id === userProfile.activeProfile
        );
        return childProfile?.name || userProfile.displayName;
    };

    // Create user profile in Firestore
    const createUserProfile = async (
        user: FirebaseUser,
        additionalData?: Partial<UserProfile>
    ) => {
        const userRef = doc(db, COLLECTIONS.USERS, user.uid);

        const defaultProfile: UserProfile = {
            id: user.uid,
            email: user.email!,
            displayName: user.displayName || 'User',
            role: 'parent', // Default role, will be set during onboarding
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
            createdAt: new Date(),
            householdIds: [],
            isActive: true,
            points: 0,
            currentStreak: 0,
            longestStreak: 0,
            badges: [],
            completedTasks: 0,
            joinedHouseholds: [],
            childProfiles: [],
            ...additionalData,
        };

        await setDoc(userRef, defaultProfile);
        setUserProfile(defaultProfile);
    };

    // Login with email and password
    const login = async (email: string, password: string) => {
        try {
            setError(null);
            console.log('Attempting login with:', { email }); // Debug log
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', user.uid); // Debug log
            await fetchUserProfile(user.uid);
        } catch (err: any) {
            console.error('Login error:', err); // Better error logging
            setError(getAuthErrorMessage(err.code));
            throw err;
        }
    };

    // Register with email and password
    const register = async (email: string, password: string, displayName: string, parentPin?: string) => {
        try {
            setError(null);
            console.log('Creating account for:', email);
            
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Account created, updating profile...');

            // Update display name
            await updateProfile(user, { displayName });
            console.log('Display name updated, creating user profile...');

            // Create user profile with parent PIN
            await createUserProfile(user, { displayName, parentPin });
            console.log('User profile created successfully');
            
        } catch (err: any) {
            console.error('Registration error:', err);
            
            // If account was created but profile creation failed, still proceed
            if (err.code === 'permission-denied' || err.message?.includes('profile')) {
                console.log('Account created but profile creation had issues - this is okay');
                return; // Don't throw error if account exists
            }
            
            setError(getAuthErrorMessage(err.code));
            throw err;
        }
    };

    // Login with Google
    const loginWithGoogle = async () => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            const { user } = await signInWithPopup(auth, provider);

            // Check if user profile exists
            const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
            if (!userDoc.exists()) {
                await createUserProfile(user);
            } else {
                await fetchUserProfile(user.uid);
            }
        } catch (err: any) {
            setError(getAuthErrorMessage(err.code));
            throw err;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (err: any) {
            setError('Failed to log out');
            throw err;
        }
    };

    // Reset password
    const resetPassword = async (email: string) => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (err: any) {
            setError(getAuthErrorMessage(err.code));
            throw err;
        }
    };

    // Update user profile
    const updateUserProfile = async (data: Partial<UserProfile>) => {
        if (!currentUser || !userProfile) return;

        try {
            console.log('Updating user profile with:', data);
            const userRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
            
            // Create update data, but preserve original displayName for parent
            const updateData = { ...data };
            
            // If switching to parent profile, restore original displayName
            if (data.activeProfile === 'parent' && data.displayName && data.displayName !== userProfile.displayName) {
                // Don't update displayName in Firebase for parent profile switches
                delete updateData.displayName;
                
                // Update local state with original displayName
                setUserProfile({ 
                    ...userProfile, 
                    ...updateData, 
                    displayName: userProfile.displayName // Preserve original parent name
                });
            } else {
                await setDoc(userRef, updateData, { merge: true });
                setUserProfile({ ...userProfile, ...updateData });
            }
            
            console.log('Profile updated successfully');
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('Failed to update profile');
            throw err;
        }
    };

    const clearError = () => setError(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('Auth state changed:', user?.uid || 'logged out');
            setCurrentUser(user);

            if (user) {
                await fetchUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updateUserProfile,
        clearError,
        refreshUserProfile,
        getCurrentDisplayName,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
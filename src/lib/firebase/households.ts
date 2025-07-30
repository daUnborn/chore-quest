import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';
import { Household, HouseholdMembership } from '@/types';

// Generate a unique 6-character household code
export const generateHouseholdCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Check if household code exists
export const isCodeAvailable = async (code: string): Promise<boolean> => {
  const q = query(
    collection(db, COLLECTIONS.HOUSEHOLDS),
    where('code', '==', code)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

// Create a new household
export const createHousehold = async (
  name: string,
  createdBy: string
): Promise<{ householdId: string; code: string }> => {
  let code = generateHouseholdCode();

  // Ensure code is unique
  while (!(await isCodeAvailable(code))) {
    code = generateHouseholdCode();
  }

  const householdId = doc(collection(db, COLLECTIONS.HOUSEHOLDS)).id;

  const household: Household = {
    id: householdId,
    name,
    code,
    createdBy,
    createdAt: new Date(),
    memberCount: 1,
    settings: {
      defaultTaskPoints: 5,
      allowChildrenToCreateTasks: false,
      requirePhotoProof: true,
      weeklyRecapEnabled: true,
      reminderTime: '16:00',
    },
  };

  await setDoc(doc(db, COLLECTIONS.HOUSEHOLDS, householdId), household);

  return { householdId, code };
};

// Join household by code
export const joinHouseholdByCode = async (
  code: string
): Promise<{ householdId: string; household: Household } | null> => {
  const q = query(
    collection(db, COLLECTIONS.HOUSEHOLDS),
    where('code', '==', code.toUpperCase())
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  const household = docSnap.data() as Household;

  return { householdId: docSnap.id, household };
};

// Add user to household
export const addUserToHousehold = async (
  userId: string,
  householdId: string,
  householdName: string,
  role: 'admin' | 'member' = 'member'
): Promise<void> => {
  // Update user's household list
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  
  // Get current user data
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    // Create user document if it doesn't exist
    await setDoc(userRef, {
      householdIds: [householdId],
      joinedHouseholds: [{
        householdId,
        householdName,
        joinedAt: new Date(),
        role,
      }]
    }, { merge: true });
  } else {
    const userData = userDoc.data();
    
    // Update existing document
    await updateDoc(userRef, {
      householdIds: arrayUnion(householdId),
      joinedHouseholds: [
        ...(userData?.joinedHouseholds || []),
        {
          householdId,
          householdName,
          joinedAt: new Date(),
          role,
        }
      ]
    });
  }

  // Update household member count
  const householdRef = doc(db, COLLECTIONS.HOUSEHOLDS, householdId);
  const householdDoc = await getDoc(householdRef);
  
  if (householdDoc.exists()) {
    await updateDoc(householdRef, {
      memberCount: (householdDoc.data().memberCount || 0) + 1,
    });
  }
};
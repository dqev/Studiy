import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { UserRole } from '@/src/types';

const db = getFirestore();

/**
 * Promote a user to admin role (use with caution!)
 * In a production app, this should only be callable by existing admins with proper authorization
 */
export const promoteUserToAdmin = async (userId: string, userEmail: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: UserRole.ADMIN,
    });
    console.log(`✅ User ${userEmail} (${userId}) promoted to admin`);
    return true;
  } catch (error) {
    console.error(`❌ Error promoting user ${userEmail}:`, error);
    return false;
  }
};

/**
 * Demote an admin to regular user
 */
export const demoteAdminToUser = async (userId: string, userEmail: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: UserRole.USER,
    });
    console.log(`✅ Admin ${userEmail} (${userId}) demoted to user`);
    return true;
  } catch (error) {
    console.error(`❌ Error demoting admin ${userEmail}:`, error);
    return false;
  }
};

/**
 * Debug function to check if user is admin
 */
export const checkIfUserIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { getDoc } = await import('firebase/firestore');
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const isAdmin = userDoc.data().role === UserRole.ADMIN;
      console.log(`🔍 User ${userId} role: ${userDoc.data().role}`);
      return isAdmin;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error checking admin status:`, error);
    return false;
  }
};

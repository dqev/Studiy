import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { UserRole } from '@/src/types';

const db = getFirestore();

/**
 * Migrate admin users from users collection to admins collection
 * Run this function once to move all admins to the new admins collection
 * Usage: Call this in useEffect or during app initialization for one-time migration
 */
export const migrateAdminsToNewCollection = async (): Promise<void> => {
  try {
    console.log('🔄 Starting admin migration...');
    
    // Query all admin users in users collection
    const usersRef = collection(db, 'users');
    const adminQuery = query(usersRef, where('role', '==', UserRole.ADMIN));
    const querySnapshot = await getDocs(adminQuery);
    
    if (querySnapshot.empty) {
      console.log('✅ No admins found to migrate');
      return;
    }
    
    console.log(`🔍 Found ${querySnapshot.size} admin(s) to migrate`);
    
    // Migrate each admin
    let migratedCount = 0;
    for (const userDoc of querySnapshot.docs) {
      try {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        // Create admin document
        const adminRef = doc(db, 'admins', userId);
        await setDoc(adminRef, userData);
        
        // Delete from users collection
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);
        
        migratedCount++;
        console.log(`✅ Migrated admin: ${userData.email}`);
      } catch (error) {
        console.error(`❌ Error migrating user ${userDoc.id}:`, error);
      }
    }
    
    console.log(`✅ Migration complete! ${migratedCount} admin(s) migrated successfully`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

/**
 * Check database structure and log statistics
 */
export const checkDatabaseStructure = async (): Promise<void> => {
  try {
    // Count users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    // Count admins
    const adminsRef = collection(db, 'admins');
    const adminsSnapshot = await getDocs(adminsRef);
    
    console.log('📊 Database Structure:');
    console.log(`  Users collection: ${usersSnapshot.size} documents`);
    console.log(`  Admins collection: ${adminsSnapshot.size} documents`);
    
    // Check for admins still in users collection
    const adminQuery = query(usersRef, where('role', '==', UserRole.ADMIN));
    const adminInUsersSnapshot = await getDocs(adminQuery);
    
    if (adminInUsersSnapshot.size > 0) {
      console.log(`  ⚠️  Found ${adminInUsersSnapshot.size} admin(s) still in users collection!`);
    }
  } catch (error) {
    console.error('❌ Error checking database structure:', error);
  }
};

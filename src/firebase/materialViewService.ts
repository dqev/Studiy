import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  collection, 
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';

const db = getFirestore();

/**
 * Check if a user has already viewed a material
 * @param materialId - The ID of the material
 * @param userId - The ID of the user
 * @returns Promise<boolean> - True if user has already viewed, false otherwise
 */
export const hasUserViewedMaterial = async (
  materialId: string,
  userId: string
): Promise<boolean> => {
  try {
    if (!materialId || !userId) {
      console.warn('⚠️ Missing materialId or userId for view check');
      return false;
    }

    const viewsRef = collection(db, 'material_views');
    const q = query(
      viewsRef,
      where('materialId', '==', materialId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const hasViewed = !querySnapshot.empty;

    if (hasViewed) {
      console.log('✅ User has already viewed this material');
    }

    return hasViewed;
  } catch (error) {
    console.error('❌ Error checking if user viewed material:', error);
    throw error;
  }
};

/**
 * Increment the view count for a material
 * Uses Firestore atomic increment to prevent race conditions
 * @param materialId - The ID of the material
 * @returns Promise<void>
 */
export const incrementMaterialView = async (
  materialId: string
): Promise<void> => {
  try {
    if (!materialId) {
      console.warn('⚠️ Missing materialId for increment');
      return;
    }

    const materialRef = doc(db, 'materials', materialId);
    
    // Use atomic increment to safely increment views
    await updateDoc(materialRef, {
      views: increment(1),
      lastViewedAt: serverTimestamp()
    });

    console.log('✅ Material view count incremented');
  } catch (error) {
    console.error('❌ Error incrementing material view:', error);
    throw error;
  }
};

/**
 * Record a material view for a user
 * This is the main function to call when a user views a material
 * @param materialId - The ID of the material
 * @param userId - The ID of the user
 * @returns Promise<boolean> - True if view was recorded, false if user already viewed
 */
export const recordMaterialView = async (
  materialId: string,
  userId: string
): Promise<boolean> => {
  try {
    if (!materialId || !userId) {
      console.warn('⚠️ Missing materialId or userId');
      return false;
    }

    // Step 1: Check if user has already viewed this material
    const hasViewed = await hasUserViewedMaterial(materialId, userId);

    if (hasViewed) {
      console.log('⏭️ User already viewed this material, skipping view record');
      return false;
    }

    // Step 2: If not viewed before, create a new view record
    const viewDocRef = doc(
      collection(db, 'material_views'),
      `${materialId}_${userId}`
    );

    await setDoc(viewDocRef, {
      materialId,
      userId,
      viewedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    console.log('✅ View record created');

    // Step 3: Increment the view count in materials collection
    await incrementMaterialView(materialId);

    return true;
  } catch (error) {
    console.error('❌ Error recording material view:', error);
    throw error;
  }
};

/**
 * Get total views for a material
 * @param materialId - The ID of the material
 * @returns Promise<number> - Total views count
 */
export const getMaterialViews = async (materialId: string): Promise<number> => {
  try {
    if (!materialId) {
      console.warn('⚠️ Missing materialId');
      return 0;
    }

    const materialRef = doc(db, 'materials', materialId);
    const materialDoc = await getDoc(materialRef);

    if (!materialDoc.exists()) {
      console.warn('⚠️ Material not found');
      return 0;
    }

    const views = materialDoc.data().views || 0;
    return views;
  } catch (error) {
    console.error('❌ Error getting material views:', error);
    throw error;
  }
};

/**
 * Get all users who have viewed a material
 * @param materialId - The ID of the material
 * @returns Promise<string[]> - Array of user IDs
 */
export const getMaterialViewers = async (materialId: string): Promise<string[]> => {
  try {
    if (!materialId) {
      console.warn('⚠️ Missing materialId');
      return [];
    }

    const viewsRef = collection(db, 'material_views');
    const q = query(viewsRef, where('materialId', '==', materialId));

    const querySnapshot = await getDocs(q);
    const userIds = querySnapshot.docs.map(doc => doc.data().userId);

    return userIds;
  } catch (error) {
    console.error('❌ Error getting material viewers:', error);
    throw error;
  }
};

/**
 * Get view count for a specific user on a specific material
 * @param materialId - The ID of the material
 * @param userId - The ID of the user
 * @returns Promise<number> - 1 if viewed, 0 if not viewed
 */
export const getUserMaterialViewCount = async (
  materialId: string,
  userId: string
): Promise<number> => {
  try {
    const hasViewed = await hasUserViewedMaterial(materialId, userId);
    return hasViewed ? 1 : 0;
  } catch (error) {
    console.error('❌ Error getting user material view count:', error);
    throw error;
  }
};

/**
 * Get materials viewed by a user (useful for user dashboard)
 * @param userId - The ID of the user
 * @returns Promise<string[]> - Array of material IDs
 */
export const getUserViewedMaterials = async (userId: string): Promise<string[]> => {
  try {
    if (!userId) {
      console.warn('⚠️ Missing userId');
      return [];
    }

    const viewsRef = collection(db, 'material_views');
    const q = query(viewsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    const materialIds = querySnapshot.docs.map(doc => doc.data().materialId);

    return materialIds;
  } catch (error) {
    console.error('❌ Error getting user viewed materials:', error);
    throw error;
  }
};

/**
 * Clear view history for a material (admin only)
 * @param materialId - The ID of the material
 * @returns Promise<void>
 */
export const clearMaterialViewHistory = async (materialId: string): Promise<void> => {
  try {
    if (!materialId) {
      console.warn('⚠️ Missing materialId');
      return;
    }

    const viewsRef = collection(db, 'material_views');
    const q = query(viewsRef, where('materialId', '==', materialId));

    const querySnapshot = await getDocs(q);
    
    // Delete all view records for this material
    const deletePromises = querySnapshot.docs.map(docSnapshot => {
      return deleteDoc(docSnapshot.ref);
    });

    await Promise.all(deletePromises);

    // Reset view count to 0
    const materialRef = doc(db, 'materials', materialId);
    await updateDoc(materialRef, {
      views: 0
    });

    console.log('✅ View history cleared for material:', materialId);
  } catch (error) {
    console.error('❌ Error clearing material view history:', error);
    throw error;
  }
};

/**
 * Get view analytics for a material
 * @param materialId - The ID of the material
 * @returns Promise<object> - Analytics data including total views, unique viewers, etc.
 */
export const getMaterialViewAnalytics = async (materialId: string): Promise<{
  totalViews: number;
  uniqueViewers: number;
  viewers: string[];
  firstViewedAt?: Timestamp;
  lastViewedAt?: Timestamp;
}> => {
  try {
    if (!materialId) {
      console.warn('⚠️ Missing materialId');
      return {
        totalViews: 0,
        uniqueViewers: 0,
        viewers: []
      };
    }

    const viewsRef = collection(db, 'material_views');
    const q = query(viewsRef, where('materialId', '==', materialId));

    const querySnapshot = await getDocs(q);
    const viewers = new Set<string>();
    let firstViewedAt: Timestamp | undefined;
    let lastViewedAt: Timestamp | undefined;

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      viewers.add(data.userId);

      if (data.viewedAt) {
        if (!firstViewedAt || data.viewedAt < firstViewedAt) {
          firstViewedAt = data.viewedAt;
        }
        if (!lastViewedAt || data.viewedAt > lastViewedAt) {
          lastViewedAt = data.viewedAt;
        }
      }
    });

    const totalViews = await getMaterialViews(materialId);

    return {
      totalViews,
      uniqueViewers: viewers.size,
      viewers: Array.from(viewers),
      firstViewedAt,
      lastViewedAt
    };
  } catch (error) {
    console.error('❌ Error getting material view analytics:', error);
    throw error;
  }
};

import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, onSnapshot, getDoc } from 'firebase/firestore';
import { Material, MaterialStatus } from '@/src/types';

const db = getFirestore();

export interface MaterialWithEmail extends Material {
  uploader_email: string;
  firebaseId?: string;
}

// Helper function to fetch uploader profile picture from users collection
export const enrichMaterialWithProfilePicture = async (material: MaterialWithEmail): Promise<MaterialWithEmail> => {
  // If profile picture already exists, return as is
  if (material.uploader_profile_picture) {
    return material;
  }
  
  try {
    // Find user by email in users collection
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', material.uploader_email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const profilePicture = userDoc.data().profile_picture;
      
      if (profilePicture) {
        return {
          ...material,
          uploader_profile_picture: profilePicture
        };
      }
    }
  } catch (error) {
    // Silently handle error
  }
  
  return material;
};

// Upload material to Firestore (stored as PENDING)
export const uploadMaterial = async (
  material: Omit<Material, 'id' | 'created_at' | 'status' | 'uploader_username'>,
  uploaderEmail: string,
  uploaderUsername: string,
  uploaderProfilePicture?: string
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'materials'), {
      ...material,
      uploader_email: uploaderEmail,
      uploader_username: uploaderUsername,
      uploader_profile_picture: uploaderProfilePicture || null,
      status: MaterialStatus.PENDING,
      created_at: new Date().toISOString(),
      approved_at: null
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Get all pending materials (for admin dashboard)
export const getPendingMaterials = async (): Promise<MaterialWithEmail[]> => {
  try {
    const q = query(collection(db, 'materials'), where('status', '==', MaterialStatus.PENDING));
    const querySnapshot = await getDocs(q);
    const materials: MaterialWithEmail[] = [];
    
    querySnapshot.forEach((doc) => {
      materials.push({
        ...doc.data() as Material,
        uploader_email: doc.data().uploader_email,
        firebaseId: doc.id,
        id: doc.id
      });
    });
    
    return materials;
  } catch (error) {
    return [];
  }
};

// Get all approved materials (for public feed)
export const getApprovedMaterials = async (): Promise<MaterialWithEmail[]> => {
  try {
    const q = query(collection(db, 'materials'), where('status', '==', MaterialStatus.APPROVED));
    const querySnapshot = await getDocs(q);
    const materials: MaterialWithEmail[] = [];
    
    querySnapshot.forEach((doc) => {
      materials.push({
        ...doc.data() as Material,
        uploader_email: doc.data().uploader_email,
        firebaseId: doc.id,
        id: doc.id
      });
    });
    
    return materials;
  } catch (error) {
    return [];
  }
};

// Get materials by uploader ID
export const getMaterialsByUploader = async (uploaderId: string): Promise<Material[]> => {
  try {
    const q = query(
      collection(db, 'materials'),
      where('uploader_id', '==', uploaderId)
    );
    const querySnapshot = await getDocs(q);
    const materials: Material[] = [];
    
    querySnapshot.forEach((doc) => {
      materials.push({
        ...doc.data() as Material,
        id: doc.id
      });
    });
    
    return materials;
  } catch (error) {
    return [];
  }
};

// Get materials by uploader email (fallback if uploader_id is not set)
export const getMaterialsByUploaderEmail = async (uploaderEmail: string): Promise<Material[]> => {
  try {
    const q = query(
      collection(db, 'materials'),
      where('uploader_email', '==', uploaderEmail)
    );
    const querySnapshot = await getDocs(q);
    const materials: Material[] = [];
    
    querySnapshot.forEach((doc) => {
      materials.push({
        ...doc.data() as Material,
        id: doc.id
      });
    });
    
    return materials;
  } catch (error) {
    return [];
  }
};

// Get user's pending uploads
export const getUserPendingUploads = async (userEmail: string): Promise<MaterialWithEmail[]> => {
  try {
    const q = query(
      collection(db, 'materials'),
      where('status', '==', MaterialStatus.PENDING),
      where('uploader_email', '==', userEmail)
    );
    const querySnapshot = await getDocs(q);
    const materials: MaterialWithEmail[] = [];
    
    querySnapshot.forEach((doc) => {
      materials.push({
        ...doc.data() as Material,
        uploader_email: doc.data().uploader_email,
        firebaseId: doc.id,
        id: doc.id
      });
    });
    
    return materials;
  } catch (error) {
    return [];
  }
};

// Approve material (admin action)
export const approveMaterial = async (materialId: string): Promise<void> => {
  try {
    const materialRef = doc(db, 'materials', materialId);
    await updateDoc(materialRef, {
      status: MaterialStatus.APPROVED,
      approved_at: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

// Send approval notification to user
export const sendApprovalNotification = async (materialId: string, uploaderEmail: string, materialTitle: string): Promise<void> => {
  try {
    // Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', uploaderEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    const currentNotifications = userDoc.data().notifications || [];

    // Create notification object
    const notification = {
      id: Date.now().toString(),
      type: 'success' as const,
      title: 'Material Approved! 🎉',
      message: `Your material "${materialTitle}" has been approved and is now available for other students to view.`,
      timestamp: new Date().toISOString(),
      read: false,
      relatedId: materialId
    };

    // Update user document with new notification
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      notifications: [...currentNotifications, notification]
    });
  } catch (error) {
    // Don't throw - notification failure shouldn't block approval
  }
};

// Send rejection notification to user
export const sendRejectionNotification = async (materialId: string, uploaderEmail: string, materialTitle: string, reason?: string): Promise<void> => {
  try {
    // Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', uploaderEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    const currentNotifications = userDoc.data().notifications || [];

    // Create notification object
    const notification = {
      id: Date.now().toString(),
      type: 'warning' as const,
      title: 'Material Not Approved',
      message: reason 
        ? `Your material "${materialTitle}" was not approved. Reason: ${reason}`
        : `Your material "${materialTitle}" was not approved. Please review and try again.`,
      timestamp: new Date().toISOString(),
      read: false,
      relatedId: materialId
    };

    // Update user document with new notification
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      notifications: [...currentNotifications, notification]
    });
  } catch (error) {
    // Don't throw - notification failure shouldn't block rejection
  }
};

// Reject/delete material (admin action)
export const rejectMaterial = async (materialId: string): Promise<void> => {
  try {
    const materialRef = doc(db, 'materials', materialId);
    await deleteDoc(materialRef);
  } catch (error) {
    throw error;
  }
};

// Real-time listener for pending materials
export const onPendingMaterialsChange = (callback: (materials: MaterialWithEmail[]) => void) => {
  const q = query(collection(db, 'materials'), where('status', '==', MaterialStatus.PENDING));
  return onSnapshot(q, (querySnapshot) => {
    const materials: MaterialWithEmail[] = [];
    
    querySnapshot.docs.forEach((docSnapshot) => {
      const material: MaterialWithEmail = {
        ...docSnapshot.data() as Material,
        uploader_email: docSnapshot.data().uploader_email,
        firebaseId: docSnapshot.id,
        id: docSnapshot.id
      };
      
      materials.push(material);
    });
    
    // Call callback immediately with materials data
    callback(materials);
    
    // Then enrich with profile pictures in the background
    materials.forEach((material, index) => {
      enrichMaterialWithProfilePicture(material).then(enrichedMaterial => {
        // Update the material with profile picture
        materials[index] = enrichedMaterial;
        callback([...materials]);
      });
    });
  }, (error) => {
    // Silently handle error
  });
};

// Real-time listener for approved materials
export const onApprovedMaterialsChange = (callback: (materials: MaterialWithEmail[]) => void) => {
  const q = query(collection(db, 'materials'), where('status', '==', MaterialStatus.APPROVED));
  return onSnapshot(q, (querySnapshot) => {
    const materials: MaterialWithEmail[] = [];
    
    querySnapshot.docs.forEach((docSnapshot) => {
      const material: MaterialWithEmail = {
        ...docSnapshot.data() as Material,
        uploader_email: docSnapshot.data().uploader_email,
        firebaseId: docSnapshot.id,
        id: docSnapshot.id
      };
      
      materials.push(material);
    });
    
    // Call callback immediately with materials data
    callback(materials);
    
    // Then enrich with profile pictures in the background
    materials.forEach((material, index) => {
      enrichMaterialWithProfilePicture(material).then(enrichedMaterial => {
        // Update the material with profile picture
        materials[index] = enrichedMaterial;
        callback([...materials]);
      });
    });
  }, (error) => {
    // Silently handle error
  });
};

// Real-time listener for user's pending uploads
export const onUserPendingUploadsChange = (userEmail: string, callback: (materials: MaterialWithEmail[]) => void) => {
  const q = query(
    collection(db, 'materials'),
    where('status', '==', MaterialStatus.PENDING),
    where('uploader_email', '==', userEmail)
  );
  return onSnapshot(q, (querySnapshot) => {
    const materials: MaterialWithEmail[] = [];
    
    querySnapshot.docs.forEach((docSnapshot) => {
      const material: MaterialWithEmail = {
        ...docSnapshot.data() as Material,
        uploader_email: docSnapshot.data().uploader_email,
        firebaseId: docSnapshot.id,
        id: docSnapshot.id
      };
      
      materials.push(material);
    });
    
    // Call callback immediately with materials data
    callback(materials);
    
    // Then enrich with profile pictures in the background
    materials.forEach((material, index) => {
      enrichMaterialWithProfilePicture(material).then(enrichedMaterial => {
        // Update the material with profile picture
        materials[index] = enrichedMaterial;
        callback([...materials]);
      });
    });
  }, (error) => {
   
  });
};

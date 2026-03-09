import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';

export interface LostAndFinderItem {
  id?: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  category: string;
  imageUrl: string;
  location: string;
  latitude?: number;
  longitude?: number;
  dateTime: string;
  uploaderEmail: string;
  uploaderName: string;
  uploaderPhone: string;
  uploaderProfilePicture?: string;
  uploaderId: string;
  status: 'active' | 'resolved';
  createdAt: string;
  updatedAt: string;
  colors?: string[];
  size?: string;
  additionalInfo?: string;
  views: number;
}

const db = getFirestore();

// Upload a lost/found item
export const uploadLostAndFinderItem = async (
  item: Omit<LostAndFinderItem, 'id' | 'createdAt' | 'updatedAt' | 'views'>
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'lostAndFinder'), {
      ...item,
      createdAt: now,
      updatedAt: now,
      views: 0,
      status: 'active'
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Get all active items
export const getAllLostAndFinderItems = async (): Promise<LostAndFinderItem[]> => {
  try {
    const q = query(
      collection(db, 'lostAndFinder'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const items: LostAndFinderItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as LostAndFinderItem;
      // Filter to only active items on the client side
      if (data.status === 'active') {
        items.push({
          ...data,
          id: doc.id
        });
      }
    });
    return items;
  } catch (error) {
    return [];
  }
};

// Get items by type (lost or found)
export const getLostAndFinderItemsByType = async (type: 'lost' | 'found'): Promise<LostAndFinderItem[]> => {
  try {
    const q = query(
      collection(db, 'lostAndFinder'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const items: LostAndFinderItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as LostAndFinderItem;
      // Filter by type and status on client side
      if (data.type === type && data.status === 'active') {
        items.push({
          ...data,
          id: doc.id
        });
      }
    });

    return items;
  } catch (error) {
    return [];
  }
};

// Get items by uploader
export const getLostAndFinderItemsByUploader = async (uploaderEmail: string): Promise<LostAndFinderItem[]> => {
  try {
    const q = query(
      collection(db, 'lostAndFinder'),
      where('uploaderEmail', '==', uploaderEmail),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const items: LostAndFinderItem[] = [];

    querySnapshot.forEach((doc) => {
      items.push({
        ...doc.data() as LostAndFinderItem,
        id: doc.id
      });
    });

    return items;
  } catch (error) {
    return [];
  }
};

// Search by category
export const searchLostAndFinderByCategory = async (category: string): Promise<LostAndFinderItem[]> => {
  try {
    const q = query(
      collection(db, 'lostAndFinder'),
      where('category', '==', category),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const items: LostAndFinderItem[] = [];

    querySnapshot.forEach((doc) => {
      items.push({
        ...doc.data() as LostAndFinderItem,
        id: doc.id
      });
    });

    return items;
  } catch (error) {
    return [];
  }
};

// Get single item
export const getLostAndFinderItem = async (itemId: string): Promise<LostAndFinderItem | null> => {
  try {
    const docRef = doc(db, 'lostAndFinder', itemId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        ...docSnap.data() as LostAndFinderItem,
        id: docSnap.id
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Update item view count
export const incrementLostAndFinderItemView = async (itemId: string): Promise<void> => {
  try {
    const itemRef = doc(db, 'lostAndFinder', itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (itemSnap.exists()) {
      const currentViews = itemSnap.data().views || 0;
      await updateDoc(itemRef, {
        views: currentViews + 1,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    // Silently handle error
  }
};

// Update item status
export const updateLostAndFinderItemStatus = async (
  itemId: string,
  status: 'active' | 'resolved'
): Promise<void> => {
  try {
    const itemRef = doc(db, 'lostAndFinder', itemId);
    await updateDoc(itemRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

// Delete item
export const deleteLostAndFinderItem = async (itemId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'lostAndFinder', itemId));
  } catch (error) {
    
    throw error;
  }
};

// Update item
export const updateLostAndFinderItem = async (
  itemId: string,
  updates: Partial<LostAndFinderItem>
): Promise<void> => {
  try {
    const itemRef = doc(db, 'lostAndFinder', itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
   
    throw error;
  }
};

// Comment interface
export interface LostAndFinderComment {
  id: string;
  itemId: string;
  authorId: string;
  authorEmail: string;
  authorUsername: string;
  authorDisplayName: string;
  authorProfilePicture?: string;
  content: string;
  createdAt: string;
}

// Add comment to lost/found item
export const addLostAndFinderComment = async (
  itemId: string,
  authorId: string,
  authorEmail: string,
  authorUsername: string,
  authorDisplayName: string,
  authorProfilePicture: string | undefined,
  content: string
): Promise<string> => {
  try {
    const commentsRef = collection(db, 'lostAndFinder', itemId, 'comments');
    const docRef = await addDoc(commentsRef, {
      itemId,
      authorId,
      authorEmail,
      authorUsername,
      authorDisplayName,
      authorProfilePicture,
      content,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    
    throw error;
  }
};

// Get comments for an item
export const getLostAndFinderComments = async (itemId: string): Promise<LostAndFinderComment[]> => {
  try {
    const commentsRef = collection(db, 'lostAndFinder', itemId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const comments: LostAndFinderComment[] = [];

    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data() as Omit<LostAndFinderComment, 'id'>
      });
    });

    return comments;
  } catch (error) {
    
    return [];
  }
};

// Delete comment
export const deleteLostAndFinderComment = async (itemId: string, commentId: string): Promise<void> => {
  try {
    const commentRef = doc(db, 'lostAndFinder', itemId, 'comments', commentId);
    await deleteDoc(commentRef);
  } catch (error) {
    
    throw error;
  }
};

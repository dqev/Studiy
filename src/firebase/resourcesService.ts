import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserResource {
  id: string;
  userId: string;
  semester: string;
  subject: string;
  resourceType: string; // Notes, Videos, Assignments, PYQ's, etc.
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  isCustom: boolean; // true if user-added, false if from default data
}

export interface UserResourceCollection {
  userId: string;
  semester: string;
  subject: string;
  resources: UserResource[];
}

export const resourcesService = {
  // Get all resources for a user (default + custom) - One-time fetch
  async getUserResources(userId: string, semester: string, subject: string) {
    try {
      const customRef = collection(db, 'user_resources');
      const q = query(
        customRef,
        where('userId', '==', userId),
        where('semester', '==', semester),
        where('subject', '==', subject),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as UserResource);
    } catch (error) {
      console.warn('Error fetching user resources:', error);
      return [];
    }
  },

  // Listen to real-time updates for user resources
  listenUserResources(
    userId: string,
    semester: string,
    subject: string,
    callback: (resources: UserResource[]) => void
  ): Unsubscribe {
    try {
      const customRef = collection(db, 'user_resources');
      const q = query(
        customRef,
        where('userId', '==', userId),
        where('semester', '==', semester),
        where('subject', '==', subject),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const resources = snapshot.docs.map((doc) => doc.data() as UserResource);
          callback(resources);
        },
        (error) => {
          console.warn('Error listening to user resources:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.warn('Error setting up listener for user resources:', error);
      // Return a no-op unsubscribe function if listener setup fails
      return () => {};
    }
  },

  // Add custom resource
  async addCustomResource(
    userId: string,
    semester: string,
    subject: string,
    resourceType: string,
    data: {
      title: string;
      url: string;
      description?: string;
      tags?: string[];
    }
  ) {
    const resourceRef = doc(collection(db, 'user_resources'));
    const newResource: UserResource = {
      id: resourceRef.id,
      userId,
      semester,
      subject,
      resourceType,
      title: data.title,
      url: data.url,
      description: data.description,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      isCustom: true,
    };

    await setDoc(resourceRef, newResource);
    return newResource;
  },

  // Update custom resource
  async updateCustomResource(resourceId: string, updates: Partial<UserResource>) {
    const resourceRef = doc(db, 'user_resources', resourceId);
    await updateDoc(resourceRef, updates);
  },

  // Delete custom resource
  async deleteCustomResource(resourceId: string) {
    const resourceRef = doc(db, 'user_resources', resourceId);
    await deleteDoc(resourceRef);
  },

  // Get user's custom resources count by type
  async getResourceStats(userId: string) {
    try {
      const customRef = collection(db, 'user_resources');
      const q = query(customRef, where('userId', '==', userId));

      const snapshot = await getDocs(q);
      const resources = snapshot.docs.map((doc) => doc.data() as UserResource);

      const stats: Record<string, number> = {};
      resources.forEach((r) => {
        stats[r.resourceType] = (stats[r.resourceType] || 0) + 1;
      });

      return {
        totalCustomResources: resources.length,
        byType: stats,
      };
    } catch (error) {
      console.warn('Error fetching resource stats:', error);
      return { totalCustomResources: 0, byType: {} };
    }
  },

  // Batch import resources
  async importResources(
    userId: string,
    semester: string,
    subject: string,
    resources: Array<{
      resourceType: string;
      title: string;
      url: string;
      description?: string;
    }>
  ) {
    const batch = writeBatch(db);
    const imported: UserResource[] = [];

    resources.forEach((resource) => {
      const resourceRef = doc(collection(db, 'user_resources'));
      const newResource: UserResource = {
        id: resourceRef.id,
        userId,
        semester,
        subject,
        resourceType: resource.resourceType,
        title: resource.title,
        url: resource.url,
        description: resource.description,
        tags: [],
        createdAt: new Date().toISOString(),
        isCustom: true,
      };
      batch.set(resourceRef, newResource);
      imported.push(newResource);
    });

    await batch.commit();
    return imported;
  },
};

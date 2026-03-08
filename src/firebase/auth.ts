import { auth, googleProvider } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User, UserRole } from '@/src/types';

const db = getFirestore();

// Get user role from Firestore
export const getUserRole = async (firebaseUser: FirebaseUser): Promise<UserRole> => {
  try {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const role = userDoc.data().role as UserRole;
      return role;
    }
  } catch (error: any) {
    // Silently handle error
  }
  return UserRole.USER; // Default role
};

// Create user in Firestore
export const createUserInFirestore = async (
  firebaseUser: FirebaseUser,
  role: UserRole = UserRole.USER,
  password?: string
) => {
  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userData: any = {
      email: firebaseUser.email,
      role: role,
      username: firebaseUser.email?.split('@')[0] || 'user',
      created_at: new Date().toISOString(),
      displayName: firebaseUser.displayName || '',
      profile_picture: firebaseUser.photoURL || null
    };
    
    // Store password if provided (for email/password signup)
    if (password) {
      userData.password = password;
    }
    
    await setDoc(userRef, userData);
  } catch (error: any) {
    // Silently handle error
  }
};

// Convert Firebase User to App User
export const convertFirebaseUserToAppUser = async (
  firebaseUser: FirebaseUser
): Promise<User> => {
  const role = await getUserRole(firebaseUser);
  
  let username = firebaseUser.email?.split('@')[0] || 'user';
  let profilePicture = firebaseUser.photoURL || undefined;
  
  try {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists() && userDoc.data().username) {
      username = userDoc.data().username;
      if (userDoc.data().profile_picture) {
        profilePicture = userDoc.data().profile_picture;
      }
    }
  } catch (error) {
    // Silently handle error
  }
  
  return {
    id: firebaseUser.uid,
    google_id: firebaseUser.uid,
    username: username,
    email: firebaseUser.email || '',
    role: role,
    created_at: new Date().toISOString(),
    profile_picture: profilePicture
  };
};

// Sign up as student only (no admin signup)
export const signUpStudent = async (email: string, password: string): Promise<User> => {
  try {
    // Persistence is already set in AuthContext, no need to set it again
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Create user in Firestore with USER role and store password
    await createUserInFirestore(firebaseUser, UserRole.USER, password);
    
    // Return user immediately with student role (already created as USER)
    return {
      id: firebaseUser.uid,
      google_id: firebaseUser.uid,
      username: firebaseUser.email?.split('@')[0] || 'user',
      email: firebaseUser.email || '',
      role: UserRole.USER,
      created_at: new Date().toISOString(),
      profile_picture: firebaseUser.photoURL || undefined
    };
  } catch (error) {
    throw error;
  }
};

// Login (student or admin - but admin is created only by the system)
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    // Persistence is already set in AuthContext, no need to set it again
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const role = await getUserRole(firebaseUser);
    
    // Get the username and profile picture from Firestore
    let username = firebaseUser.email?.split('@')[0] || 'user';
    let profilePicture = firebaseUser.photoURL || undefined;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().username) {
        username = userDoc.data().username;
        if (userDoc.data().profile_picture) {
          profilePicture = userDoc.data().profile_picture;
        }
      }
    } catch (error) {
      // Silently handle error
    }
    
    return {
      id: firebaseUser.uid,
      google_id: firebaseUser.uid,
      username: username,
      email: firebaseUser.email || '',
      role: role,
      created_at: new Date().toISOString(),
      profile_picture: profilePicture
    };
  } catch (error) {
    throw error;
  }
};

// Google login/signup
export const loginWithGoogle = async (): Promise<User> => {
  try {
    // Persistence is already set in AuthContext, no need to set it again
    
    const userCredential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = userCredential.user;
    
    // Check if user exists in Firestore
    const userDocSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    // If first time Google login, create user document with USER role
    if (!userDocSnap.exists()) {
      await createUserInFirestore(firebaseUser, UserRole.USER);
    }
    
    const role = await getUserRole(firebaseUser);
    
    // Get the username and profile picture from Firestore
    let username = firebaseUser.email?.split('@')[0] || 'user';
    let profilePicture = firebaseUser.photoURL || undefined;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().username) {
        username = userDoc.data().username;
        if (userDoc.data().profile_picture) {
          profilePicture = userDoc.data().profile_picture;
        }
      }
    } catch (error) {
      // Silently handle error
    }
    
    return {
      id: firebaseUser.uid,
      google_id: firebaseUser.uid,
      username: username,
      email: firebaseUser.email || '',
      role: role,
      created_at: new Date().toISOString(),
      profile_picture: profilePicture
    };
  } catch (error) {
    throw error;
  }
};

// Logout
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Auth state listener
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const appUser = await convertFirebaseUserToAppUser(firebaseUser);
        callback(appUser);
      } catch (error) {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// Update username in Firestore with 1-month cooldown
export const updateUsername = async (uid: string, newUsername: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const lastUsernameChange = userData.lastUsernameChange ? new Date(userData.lastUsernameChange).getTime() : 0;
      const now = new Date().getTime();
      const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
      
      if (lastUsernameChange && (now - lastUsernameChange) < oneMonthInMs) {
        const daysRemaining = Math.ceil((oneMonthInMs - (now - lastUsernameChange)) / (24 * 60 * 60 * 1000));
        throw new Error(`You can only change your username once every 30 days. Try again in ${daysRemaining} days.`);
      }
    }
    
    await setDoc(userRef, { 
      username: newUsername,
      lastUsernameChange: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    throw error;
  }
};

// Check if username can be changed (1-month cooldown)
export const canChangeUsername = async (uid: string): Promise<{ canChange: boolean; daysRemaining?: number }> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { canChange: true };
    }
    
    const userData = userDoc.data();
    const lastUsernameChange = userData.lastUsernameChange ? new Date(userData.lastUsernameChange).getTime() : 0;
    
    if (!lastUsernameChange) {
      return { canChange: true };
    }
    
    const now = new Date().getTime();
    const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
    const timeSinceChange = now - lastUsernameChange;
    
    if (timeSinceChange < oneMonthInMs) {
      const daysRemaining = Math.ceil((oneMonthInMs - timeSinceChange) / (24 * 60 * 60 * 1000));
      return { canChange: false, daysRemaining };
    }
    
    return { canChange: true };
  } catch (error) {
    return { canChange: true };
  }
};

// Check if username is available
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // Available if no docs found
  } catch (error) {
    return false;
  }
};

// Send password reset email
export const sendResetPasswordEmail = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

// Login with username or email
export const loginWithUsernameOrEmail = async (emailOrUsername: string, password: string): Promise<User> => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    
    // Try direct email login first
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailOrUsername, password);
      const firebaseUser = userCredential.user;
      const role = await getUserRole(firebaseUser);
      
      // Get the username and profile picture from Firestore
      let username = firebaseUser.email?.split('@')[0] || 'user';
      let profilePicture = firebaseUser.photoURL || undefined;
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().username) {
          username = userDoc.data().username;
          if (userDoc.data().profile_picture) {
            profilePicture = userDoc.data().profile_picture;
          }
        }
      } catch (error) {
        // Silently handle error
      }
      
      return {
        id: firebaseUser.uid,
        google_id: firebaseUser.uid,
        username: username,
        email: firebaseUser.email || '',
        role: role,
        created_at: new Date().toISOString(),
        profile_picture: profilePicture
      };
    } catch (error: any) {
      // If email login fails and input looks like username, try to find email
      if (!emailOrUsername.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', emailOrUsername));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userEmail = userDoc.data().email;
          const username = userDoc.data().username;
          const profilePicture = userDoc.data().profile_picture || undefined;
          
          const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
          const firebaseUser = userCredential.user;
          const role = await getUserRole(firebaseUser);
          
          return {
            id: firebaseUser.uid,
            google_id: firebaseUser.uid,
            username: username,
            email: userEmail,
            role: role,
            created_at: new Date().toISOString(),
            profile_picture: profilePicture
          };
        }
      }
      throw error;
    }
  } catch (error) {
    throw error;
  }
};


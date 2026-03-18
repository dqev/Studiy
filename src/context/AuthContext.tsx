import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/src/firebase/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { User, UserRole } from '@/src/types';
import { loginUser, signUpStudent, getUserRole, convertFirebaseUserToAppUser, loginWithGoogle } from '@/src/firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, username: string) => Promise<void>;
    loginGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const persistenceInitializedRef = React.useRef(false);

    useEffect(() => {
        // Initialize persistence ONLY once
        const initializeAuth = async () => {
            try {
                // Set persistence only if not already set
                if (!persistenceInitializedRef.current) {
                    await setPersistence(auth, browserLocalPersistence);
                    persistenceInitializedRef.current = true;
                }
            } catch (err) {
                console.error('Error setting persistence:', err);
            }

            // Set up auth state listener
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                try {
                    if (firebaseUser) {
                        // Token found in localStorage - user session is restored
                        const appUser = await convertFirebaseUserToAppUser(firebaseUser);
                        setUser(appUser);
                        // Cache user data for instant access on landing page
                        localStorage.setItem('cachedUser', JSON.stringify(appUser));
                    } else {
                        // No valid token found - user is logged out
                        setUser(null);
                        localStorage.removeItem('cachedUser');
                    }
                    setError(null);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Authentication error');
                    setUser(null);
                    localStorage.removeItem('cachedUser');
                } finally {
                    setLoading(false);
                }
            });

            return unsubscribe;
        };

        let unsubscribe: (() => void) | undefined;
        initializeAuth().then((unsub) => {
            unsubscribe = unsub;
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const appUser = await loginUser(email, password);
            setUser(appUser);
            // Cache user data for instant access
            localStorage.setItem('cachedUser', JSON.stringify(appUser));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (email: string, password: string, username: string) => {
        try {
            setLoading(true);
            setError(null);
            const appUser = await signUpStudent(email, password, username);
            setUser(appUser);
            // Cache user data for instant access
            localStorage.setItem('cachedUser', JSON.stringify(appUser));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Signup failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const loginGoogle = async () => {
        try {
            setLoading(true);
            setError(null);
            const appUser = await loginWithGoogle();
            setUser(appUser);
            // Cache user data for instant access
            localStorage.setItem('cachedUser', JSON.stringify(appUser));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Google login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            setError(null);
            await firebaseSignOut(auth);
            setUser(null);
            // Clear cached user data
            localStorage.removeItem('cachedUser');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Logout failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        login,
        signup,
        loginGoogle,
        logout,
        isAdmin: user?.role === UserRole.ADMIN,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

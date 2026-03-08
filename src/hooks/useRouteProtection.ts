import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { UserRole } from '@/src/types';

/**
 * Custom hook to prevent redirect to parent route when refreshing on child routes
 * Preserves the current route location even after auth check completes
 * Only redirects unauthenticated users to home page
 */
export function useRouteProtection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, loading } = useAuth();
    const hasCheckedAuth = useRef(false);

    useEffect(() => {
        // Skip if still loading auth state
        if (loading) {
            return;
        }

        // Auth check is complete
        if (!hasCheckedAuth.current) {
            hasCheckedAuth.current = true;

            // Only redirect if NOT authenticated
            if (!isAuthenticated) {
                navigate('/', { replace: true });
                return;
            }

            // If authenticated, keep the user on current page
            // Don't force redirect to /user/home or any parent route
        }
    }, [loading, isAuthenticated, navigate]);

    return { user, isAuthenticated, loading };
}

/**
 * Custom hook for admin-specific route protection
 * Ensures admin users stay on their intended route and non-admins are redirected
 */
export function useAdminRouteProtection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useAuth();
    const hasCheckedAuth = useRef(false);

    useEffect(() => {
        // Skip if still loading
        if (loading) {
            return;
        }

        // Auth check is complete
        if (!hasCheckedAuth.current) {
            hasCheckedAuth.current = true;

            // Only redirect if user exists but is not admin
            if (user && user.role !== UserRole.ADMIN) {
                navigate('/user', { replace: true });
                return;
            }

            // If no user and not loading, redirect to home
            if (!user && !loading) {
                navigate('/', { replace: true });
                return;
            }

            // If admin user on admin route, keep them there
            if (user && user.role === UserRole.ADMIN) {
                return;
            }
        }
    }, [loading, user, navigate]);

    return { user, loading };
}

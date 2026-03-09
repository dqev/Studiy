import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to prevent back navigation from protected routes (/user, /admin)
 * Completely disables browser back button on protected pages
 */
export function useBackNavigation() {
    const location = useLocation();
    const entryCountRef = useRef(0);

    useEffect(() => {
        // Check if we're on a protected route
        const isProtectedRoute = location.pathname.startsWith('/user') || location.pathname.startsWith('/admin');

        if (!isProtectedRoute) return;

        // Clear forward history by pushing multiple entries
        // This creates a "trap" so going back loops back to same page
        const pushState = () => {
            window.history.pushState(
                { preventBack: true },
                '',
                window.location.href
            );
        };

        // Initial push to establish history state
        pushState();
        entryCountRef.current++;

        // Handle popstate (back button press)
        const handlePopState = (event: PopStateEvent) => {
            // Push forward immediately to keep user on page
            pushState();
            entryCountRef.current++;
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [location.pathname]);
}


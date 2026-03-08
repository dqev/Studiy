import * as React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Bookmark,
    Upload,
    User,
    Bell,
    Settings,
    ClipboardList
} from 'lucide-react';
import { Sidebar, NavItem } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { useAuth } from '@/src/context/AuthContext';
import { UserRole } from '@/src/types';

const userNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/user', icon: LayoutDashboard },
    { name: 'My Resources', href: '/user/resources', icon: BookOpen },
    { name: 'Upload Material', href: '/user/upload', icon: Upload },
    { name: 'Saved Materials', href: '/user/saved', icon: Bookmark },
    { name: 'Pending Approval', href: '/user/pending', icon: ClipboardList },
    { name: 'Notifications', href: '/user/notifications', icon: Bell },
    { name: 'Profile', href: '/user/profile', icon: User },
    { name: 'Settings', href: '/user/settings', icon: Settings },
];

export function UserLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Redirect admin users to admin layout
    if (user?.role === UserRole.ADMIN) {
        return <Navigate to="/admin" replace />;
    }

    const headerUser = {
        name: user?.displayName || user?.username || 'User',
        email: user?.email || '',
        avatar: user?.profile_picture,
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar
                items={userNavItems}
                title="Studiy"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
                <Header user={headerUser} onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="p-4 sm:p-8 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

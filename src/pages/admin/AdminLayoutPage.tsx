import * as React from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import {
    BarChart3,
    Users,
    Files,
    CheckCircle2,
    AlertCircle,
    Settings,
    LogOut,
    Shield,
    User,
    Award
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useAdminRouteProtection } from '@/src/hooks/useRouteProtection';
import { useBackNavigation } from '@/src/hooks/useBackNavigation';
import { UserRole } from '@/src/types';

const adminNavItems = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Profile', href: '/admin/profile', icon: User },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'Manage Teachers', href: '/admin/teachers', icon: Award },
    { name: 'Manage Resources', href: '/admin/resources', icon: Files },
    { name: 'Approvals', href: '/admin/approvals', icon: CheckCircle2 },
    { name: 'Reports', href: '/admin/reports', icon: AlertCircle },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminLayoutPage() {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const location = useLocation();
    const { user, loading } = useAdminRouteProtection();
    const { logout } = useAuth();

    // Prevent back navigation to landing page
    useBackNavigation();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-slate-600 font-medium">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== UserRole.ADMIN) {
        return <Navigate to="/user" replace />;
    }

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            // Silently handle error
        }
    };

    const isActive = (href: string) => {
        if (href === '/admin') return location.pathname === '/admin' || location.pathname.match(/^\/admin\/?$/);
        return location.pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white z-50 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="p-5">
                    <div className="flex items-center space-x-2">
                        <img
                            src="favicon/favicon.svg"
                            alt="Studiy Logo"
                            className="h-7 w-7 rounded-lg"
                        />
                        <div>
                            <h1 className="text-xl font-bold">Admin</h1>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                        Management
                    </p>
                    <div className="space-y-1">
                        {adminNavItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${active
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                        }
                  `}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Admin Info & Logout */}
                <div className="border-t border-slate-700 p-4 space-y-4">
                    <Link to="/admin/profile" className="block p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                        <p className="text-sm font-medium text-white">{user?.username || 'Admin'}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@studiy.com'}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <Shield className="h-3 w-3 text-indigo-400" />
                            <span className="text-xs text-indigo-400 font-semibold">Administrator</span>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
                {/* Header */}
                <header className="bg-white sticky top-0 z-40">
                    <div className="h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
                        >
                            <svg viewBox="0 0 16 16" fill="#000000" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600">
                                <path d="M10.666666666666666 12v1.3333333333333333H3.333333333333333v-1.3333333333333333h7.333333333333333Zm3.333333333333333 -4.666666666666666v1.3333333333333333H2v-1.3333333333333333h12Zm-1.3333333333333333 -4.666666666666666v1.3333333333333333H5.333333333333333V2.6666666666666665h7.333333333333333Z" strokeWidth="0.6667"></path>
                            </svg>
                        </button>

                        <div className="flex-1" />

                        <div className="flex items-center space-x-4">
                            {/* Admin Status Badge */}
                            <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                                <Shield className="h-3 w-3" />
                                Admin Access
                            </div>

                            {/* User Avatar with Link to Profile */}
                            <Link to="/admin/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-slate-900">{user?.username || 'Admin'}</p>
                                    <p className="text-xs text-slate-500">Administrator</p>
                                </div>
                                {user?.profile_picture ? (
                                    <img
                                        src={user.profile_picture}
                                        alt={user.username}
                                        className="h-10 w-10 rounded-full border-2 border-indigo-600"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-indigo-700">
                                        <span className="text-white font-bold text-sm">
                                            {(user?.username || 'A')[0].toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-8 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

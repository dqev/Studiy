import * as React from 'react';
import { Outlet, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Bookmark,
    Upload,
    User,
    Bell,
    Settings,
    LogOut,
    Notebook,
    Users,
    Search,
} from 'lucide-react';
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { VscRequestChanges } from "react-icons/vsc";
import { MdPendingActions } from "react-icons/md";
import { IoHome } from "react-icons/io5";
import { RiSettings3Fill } from "react-icons/ri";
import { BarChart3 } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useRouteProtection } from '@/src/hooks/useRouteProtection';
import { useBackNavigation } from '@/src/hooks/useBackNavigation';
import { UserRole } from '@/src/types';

const teacherNavItems = [
    { name: 'Home', href: '/teacher', icon: IoHome },
    { name: 'Dashboard', href: '/teacher/dashboard', icon: TbLayoutDashboardFilled },
    { name: 'My Classes', href: '/teacher/my-classes', icon: Notebook },
    { name: 'Course Materials', href: '/teacher/materials', icon: Notebook },
    { name: 'Upload Material', href: '/teacher/upload', icon: Upload },
    { name: 'Student Progress', href: '/teacher/student-progress', icon: BarChart3 },
    { name: 'Pending Approval', href: '/teacher/pending', icon: MdPendingActions },
    { name: 'Notifications', href: '/teacher/notifications', icon: Bell },
    // Profile will be dynamically added with username
    { name: 'Settings', href: '/teacher/settings', icon: RiSettings3Fill },
];

export function TeacherLayoutPage() {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
    const profileMenuRef = React.useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, loading } = useRouteProtection();
    const { logout } = useAuth();

    // Prevent back navigation to landing page
    useBackNavigation();

    // Close profile menu when clicking outside - MUST be before early returns
    React.useEffect(() => {
        if (!isProfileMenuOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileMenuOpen]);

    // Prevent body scroll when sidebar is open on mobile
    React.useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-4">
                    <img
                        src="favicon/favicon.svg"
                        alt="Loading"
                        className="h-10 w-10 animate-spin"
                    />
                    <p className="text-slate-600 font-medium">Loading..</p>
                </div>
            </div>
        );
    }

    // Only redirect if explicitly not authenticated AFTER loading is complete
    if (!loading && !isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Redirect non-teacher and non-admin users
    if (user?.role !== UserRole.TEACHER && user?.role !== UserRole.ADMIN) {
        return <Navigate to="/user" replace />;
    }

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/', { replace: true });
        } catch (error) {
            // Silently handle error
        }
    };

    const handleProfileMenuClick = (path: string) => {
        navigate(path);
        setIsProfileMenuOpen(false);
    };

    const isActive = (href: string) => {
        if (href === '/teacher') return location.pathname === '/teacher' || location.pathname === '/teacher/';
        if (href === '/teacher/dashboard') return location.pathname === '/teacher/dashboard';
        return location.pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white">
                <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    {/* Left side */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="inline-flex lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <Link to="/teacher" className="flex items-center space-x-2">
                            <img src="favicon/favicon.svg" alt="Studiy" className="h-8 w-8" />
                            <span className="font-bold text-slate-900 hidden sm:inline">Studiy</span>
                        </Link>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/teacher/notifications')}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative"
                        >
                            <Bell className="h-5 w-5" />
                        </button>

                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center space-x-2 p-1 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                <img
                                    src={user?.profile_picture || 'favicon/favicon.svg'}
                                    alt={user?.username}
                                    className="h-8 w-8 rounded-full"
                                />
                                <span className="text-sm text-slate-900 hidden sm:inline">{user?.username}</span>
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                    <button
                                        onClick={() => handleProfileMenuClick('/teacher/profile')}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                                    >
                                        <User className="h-4 w-4" />
                                        <span>Profile</span>
                                    </button>
                                    <hr className="my-1 border-slate-200" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
                        w-64 bg-white border-r border-slate-200 flex flex-col fixed left-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:top-0 lg:h-screen overflow-hidden rounded-r-3xl
                        top-16 h-[calc(100vh-64px)] md:top-16 md:h-[calc(100vh-64px)] lg:top-0 lg:h-screen
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    {/* Logo */}
                    <div className="h-16 flex items-center px-4 sm:px-6 border-b border-slate-200">
                        <div className="flex items-center space-x-2 w-full">
                            <div className="bg-amber-600 p-1.5 rounded-lg flex-shrink-0">
                                <Notebook className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Studiy</h1>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                            Menu
                        </p>
                        <div className="space-y-1">
                            {teacherNavItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`
                                            flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
                                            ${active
                                                ? 'bg-amber-50 text-amber-600'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center">
                                            <Icon className={`mr-3 h-5 w-5 ${active ? 'text-amber-600' : 'text-slate-400'}`} />
                                            {item.name}
                                        </div>
                                        {active && <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Logout */}
                    <div className="border-t border-slate-200 p-4 space-y-4">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="bg-white p-4 sm:p-8 flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

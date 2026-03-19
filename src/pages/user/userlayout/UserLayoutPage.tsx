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
import { useAuth } from '@/src/context/AuthContext';
import { useRouteProtection } from '@/src/hooks/useRouteProtection';
import { useBackNavigation } from '@/src/hooks/useBackNavigation';
import { UserRole } from '@/src/types';

const userNavItems = [
    { name: 'Home', href: '/user', icon: IoHome },
    { name: 'Dashboard', href: '/user/dashboard', icon: TbLayoutDashboardFilled },
    { name: 'Class Material', href: '/user/class-material', icon: Notebook },
    { name: 'My Resources', href: '/user/resources', icon: Notebook },
    { name: 'Upload Material', href: '/user/upload', icon: Upload },
    { name: 'Saved Materials', href: '/user/saved', icon: Bookmark },
    { name: 'Search Users', href: '/user/search', icon: Users },
    { name: 'Lost & Finder', href: '/user/lost-and-finder', icon: Search },
    { name: 'Resource Requests', href: '/user/requests', icon: VscRequestChanges },
    { name: 'Pending Approval', href: '/user/pending', icon: MdPendingActions },
    { name: 'Notifications', href: '/user/notifications', icon: Bell },
    // Profile will be dynamically added with username
    { name: 'Settings', href: '/user/settings', icon: RiSettings3Fill },
];

export function UserLayoutPage() {
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
                        src="/icon.png"
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

    // Redirect admin users to admin layout
    if (user?.role === UserRole.ADMIN) {
        return <Navigate to="/admin" replace />;
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
        if (href === '/user') return location.pathname === '/user' || location.pathname === '/user/';
        if (href === '/user/dashboard') return location.pathname === '/user/dashboard';
        // Don't check paths that look like /:username (profile routes) for /user prefix
        if (!location.pathname.startsWith('/user') && location.pathname !== '/') return false;
        return location.pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0  z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-50 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="p-5">
                    <button
                        onClick={() => navigate('/user')}
                        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                    >
                        <img
                            src="/icon.png"
                            alt="Studiy Logo"
                            className="h-5 w-5 rounded-lg"
                        />
                        <h1 className="text-xl font-bold text-slate-900">Studiy</h1>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                        Menu
                    </p>
                    <div className="space-y-1">
                        {userNavItems.map((item) => {
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
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }
                  `}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}

                        {/* Profile Link (Dynamic with username) */}
                        {user && (
                            <Link
                                to={`/${user.username}`}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${location.pathname === `/${user.username}`
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                  `}
                            >
                                <User className={`mr-3 h-5 w-5 ${location.pathname === `/${user.username}` ? 'text-indigo-600' : 'text-slate-400'}`} />
                                Profile
                            </Link>
                        )}
                    </div>

                    {/* Create Request Button */}
                    <div className="mt-6 pt-4 border-t border-slate-200">
                        <Link
                            to="/user/request/create"
                            onClick={() => setIsSidebarOpen(false)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                            <VscRequestChanges size={16} />
                            Request a Resource
                        </Link>
                    </div>
                </nav>

                {/* Logout */}
                <div className="border-t border-slate-200 p-4">
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
            <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
                {/* Header */}
                <header className="bg-white sticky top-0 z-40">
                    <div className="h-16 px-4 sm:px-8 flex items-center justify-between">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
                        >
                            <svg viewBox="0 0 16 16" fill="#000000" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600">
                                <path d="M2 2.6666666666666665h12v1.3333333333333333H2V2.6666666666666665Zm0 4.666666666666666h8v1.3333333333333333H2v-1.3333333333333333Zm0 4.666666666666666h12v1.3333333333333333H2v-1.3333333333333333Z" strokeWidth="0.6667"></path>
                            </svg>
                        </button>

                        {/* Branding - Mobile only */}
                        <div className="p-1 lg:hidden">
                            <button
                                onClick={() => navigate('/user')}
                                className="flex items-center space-x-1 hover:opacity-80 transition-opacity"
                            >
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">Studiy</h1>
                                </div>
                            </button>
                        </div>

                        <div className="flex-1 lg:flex-none" />

                        {/* Left side - Search and Avatar (shown on all devices) */}
                        <div className="flex items-center gap-2">
                            {/* Search Icon Button */}
                            <button
                                onClick={() => navigate('/user/search')}
                                className="h-10 w-10 rounded-full flex items-center justify-center border border-slate-200 hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900 hover:ring-2 hover:ring-indigo-500"
                                title="Search users"
                            >
                                <Search className="h-5 w-5" />
                            </button>

                            {/* User Avatar with Dropdown Menu */}
                            <div className="relative flex items-center gap-3" ref={profileMenuRef}>
                                {/* Profile Avatar Button */}
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    {user?.profile_picture ? (
                                        <img
                                            src={user.profile_picture}
                                            alt={user.username}
                                            className="h-10 w-10 rounded-full border border-slate-200 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all">
                                            <span className="text-white font-medium">
                                                {(user?.username || 'U')[0].toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </button>

                                {/* User Info - Desktop only (right side) */}
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-medium text-slate-900">{user?.username || 'User'}</p>
                                    <p className="text-xs text-slate-500">{user?.role || 'Student'}</p>
                                </div>

                                {/* Dropdown Menu */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 top-12 mt-3 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                        {/* Profile Option */}
                                        <button
                                            onClick={() => user && handleProfileMenuClick(`/${user.username}`)}
                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors"
                                        >
                                            <User className="h-4 w-4 text-slate-500" />
                                            <span>Profile</span>
                                        </button>

                                        {/* Settings Option */}
                                        <button
                                            onClick={() => handleProfileMenuClick('/user/settings')}
                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors"
                                        >
                                            <Settings className="h-4 w-4 text-slate-500" />
                                            <span>Settings</span>
                                        </button>

                                        {/* Divider */}
                                        <div className="my-2 border-t border-slate-200" />

                                        {/* Logout Option */}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4 text-red-500" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="bg-white p-4 sm:p-8 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
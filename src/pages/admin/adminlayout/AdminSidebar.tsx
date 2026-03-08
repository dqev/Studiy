import * as React from 'react';
import {
    BarChart3,
    Users,
    Files,
    CheckCircle2,
    AlertCircle,
    Settings,
    ChevronRight,
    LogOut,
    Shield,
    User
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';

const adminNavItems = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Profile', href: '/admin/profile', icon: User },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'Manage Resources', href: '/admin/resources', icon: Files },
    { name: 'Approvals', href: '/admin/approvals', icon: CheckCircle2 },
    { name: 'Reports', href: '/admin/reports', icon: AlertCircle },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const isActive = (href: string) => {
        if (href === '/admin') return location.pathname === '/admin' || location.pathname.match(/^\/admin\/?$/);
        return location.pathname.startsWith(href);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            // Silently handle error
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
        w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col fixed left-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:top-0 lg:h-screen
        top-16 h-[calc(100vh-64px)] md:top-16 md:h-[calc(100vh-64px)] lg:top-0 lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center px-4 sm:px-6 border-b border-slate-700">
                    <div className="flex items-center space-x-2 w-full">
                        <div className="bg-indigo-600 p-1.5 rounded-lg flex-shrink-0">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-bold truncate">Studiy Admin</h1>
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
                                    onClick={onClose}
                                    className={`
                    flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${active
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                        }
                  `}
                                >
                                    <div className="flex items-center">
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </div>
                                    {active && <ChevronRight className="h-4 w-4" />}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Admin Info & Logout */}
                <div className="border-t border-slate-700 p-4 space-y-4">
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-sm font-medium text-white">{user?.username || 'Admin'}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@studiy.com'}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <Shield className="h-3 w-3 text-indigo-400" />
                            <span className="text-xs text-indigo-400 font-semibold">Administrator</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}

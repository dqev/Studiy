import * as React from 'react';
import {
    LayoutDashboard,
    BookOpen,
    Bookmark,
    Upload,
    User,
    Bell,
    Settings,
    ClipboardList,
    ChevronRight,
    LogOut,
    Users,
    BarChart3,
    Award
} from 'lucide-react';
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';

const teacherNavItems = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: TbLayoutDashboardFilled },
    { name: 'Course Materials', href: '/teacher/materials', icon: BookOpen },
    { name: 'My Classes', href: '/teacher/my-classes', icon: Award },
    { name: 'Upload Material', href: '/teacher/upload', icon: Upload },
    { name: 'Student Progress', href: '/teacher/student-progress', icon: BarChart3 },
    { name: 'Pending Approval', href: '/teacher/pending', icon: ClipboardList },
    { name: 'Notifications', href: '/teacher/notifications', icon: Bell },
    { name: 'Settings', href: '/teacher/settings', icon: Settings },
];

interface TeacherSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function TeacherSidebar({ isOpen, onClose }: TeacherSidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Prevent body scroll when sidebar is open on mobile
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const isActive = (href: string) => {
        if (href === '/teacher') return location.pathname === '/teacher' || location.pathname.match(/^\/teacher\/?$/);
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
        w-64 bg-white border-r border-slate-200 flex flex-col fixed left-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:top-0 lg:h-screen overflow-hidden rounded-r-3xl
        top-16 h-[calc(100vh-64px)] md:top-16 md:h-[calc(100vh-64px)] lg:top-0 lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center px-4 sm:px-6 border-b border-slate-200">
                    <div className="flex items-center space-x-2 w-full">
                        <div className="bg-amber-600 p-1.5 rounded-lg flex-shrink-0">
                            <Award className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Teacher</h1>
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
                                    onClick={onClose}
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
                                    {active && <ChevronRight className="h-4 w-4" />}
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
        </>
    );
}

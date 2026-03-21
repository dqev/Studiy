import * as React from 'react';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';

interface TeacherHeaderProps {
    onMenuClick?: () => void;
}

export function TeacherHeader({ onMenuClick }: TeacherHeaderProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
    const profileMenuRef = React.useRef<HTMLDivElement>(null);

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

    const handleProfileMenuClick = (path: string) => {
        navigate(path);
        setIsProfileMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/', { replace: true });
        } catch (error) {
            // Silently handle error
        }
    };

    return (
        <header className="bg-white sticky top-0 z-40">
            <div className="h-16 px-4 sm:px-8 flex items-center justify-between gap-2">
                {/* Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
                >
                    <svg viewBox="0 0 16 16" fill="#000000" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600">
                        <path d="M2 2.6666666666666665h12v1.3333333333333333H2V2.6666666666665Zm0 4.666666666666666h8v1.3333333333333333H2v-1.3333333333333333Zm0 4.666666666666666h12v1.3333333333333333H2v-1.3333333333333333Z" strokeWidth="0.6667"></path>
                    </svg>
                </button>

                {/* Branding - Mobile only */}
                <div className="p-1 lg:hidden">
                    <div className="flex items-center space-x-1">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Studiy</h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 lg:flex-none" />

                {/* Left Section - Notification and Avatar */}
                <div className="flex items-center gap-0">
                    {/* Notification Button */}
                    <button
                        onClick={() => navigate('/teacher/notifications')}
                        className="h-10 w-10 rounded-full flex items-center justify-center border border-slate-200 hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900 hover:ring-2 hover:ring-amber-500"
                        title="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                    </button>

                    {/* User Profile with Dropdown */}
                    <div
                        className="relative ml-2"
                        ref={profileMenuRef}
                    >
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="h-10 w-10 rounded-full border border-slate-200 overflow-hidden hover:ring-2 hover:ring-amber-500 transition-all"
                        >
                            <img
                                src={user?.profile_picture || 'favicon/favicon.svg'}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-slate-200 shadow-lg py-2">
                                {/* Profile Info */}
                                <div className="px-4 py-3 border-b border-slate-200">
                                    <p className="text-sm font-semibold text-slate-900">{user?.displayName || user?.username}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                </div>

                                {/* Menu Items */}
                                <button
                                    onClick={() => handleProfileMenuClick('/teacher/profile')}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                                >
                                    <User className="h-4 w-4 text-amber-600" />
                                    Profile
                                </button>

                                <button
                                    onClick={() => handleProfileMenuClick('/teacher/settings')}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                                >
                                    <Settings className="h-4 w-4 text-amber-600" />
                                    Settings
                                </button>

                                {/* Divider */}
                                <div className="border-t border-slate-200 my-2" />

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

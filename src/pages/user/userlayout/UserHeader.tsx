import * as React from 'react';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';

interface UserHeaderProps {
    onMenuClick?: () => void;
}

export function UserHeader({ onMenuClick }: UserHeaderProps) {
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
        <header className="bg-white sticky top-0 z-40 shadow-sm">
            <div className="h-16 px-4 sm:px-8 flex items-center justify-between gap-2">
                {/* Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
                >
                    <svg viewBox="0 0 16 16" fill="#000000" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600">
                        <path d="M2 2.6666666666666665h12v1.3333333333333333H2V2.6666666666665Zm0 4.666666666666666h8v1.3333333333333333H2v-1.3333333333333333Zm0 4.666666666666666h12v1.3333333333333333H2v-1.3333333333333333Z" stroke-width="0.6667"></path>
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

                {/* Left Section - Search Icon and Avatar */}
                <div className="flex items-center gap-0">
                    {/* Search Icon Button */}
                    <button
                        onClick={() => navigate('/user/search')}
                        className="h-10 w-10 rounded-full flex items-center justify-center border border-slate-200 hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900 hover:ring-2 hover:ring-indigo-500"
                        title="Search users"
                    >
                        <Search className="h-5 w-5" />
                    </button>

                    {/* User Profile with Dropdown */}
                    <div className="flex items-center gap-2 sm:gap-3 relative" ref={profileMenuRef}>
                        {/* Avatar Button */}
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="hover:opacity-80 transition-opacity"
                        >
                            {user?.profile_picture ? (
                                <img
                                    src={user.profile_picture}
                                    alt={user.username}
                                    className="h-10 w-10 rounded-full border border-slate-200 object-cover cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all">
                                    <span className="text-white font-medium text-sm">
                                        {(user?.username || 'U')[0].toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </button>

                        {/* User Info - Shown on all screens */}
                        <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">{user?.displayName || user?.username || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate max-w-xs">{user?.email || user?.role || 'user'}</p>
                        </div>

                        {/* Dropdown Menu */}
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 top-14 mt-3 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                {/* Profile Option */}
                                <button
                                    onClick={() => handleProfileMenuClick('/user/profile')}
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

                {/* Right Section - Notifications */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Notifications */}
                    <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Bell className="h-5 w-5 text-slate-600" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                    </button>
                </div>
            </div>
        </header>
    );
}

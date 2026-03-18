import * as React from 'react';
import { Bell, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

interface AdminHeaderProps {
    onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { user } = useAuth();

    return (
        <header className="bg-white sticky top-0 z-40">
            <div className="h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
                {/* Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
                >
                    <svg viewBox="0 0 16 16" fill="#000000" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600">
                        <path d="M10.666666666666666 12v1.3333333333333333H3.333333333333333v-1.3333333333333333h7.333333333333333Zm3.333333333333333 -4.666666666666666v1.3333333333333333H2v-1.3333333333333333h12Zm-1.3333333333333333 -4.666666666666666v1.3333333333333333H5.333333333333333V2.6666666666666665h7.333333333333333Z" strokeWidth="0.6667"></path>
                    </svg>
                </button>

                {/* Title */}
                <h2 className="text-lg font-semibold text-slate-900 hidden sm:block">
                    Admin Dashboard
                </h2>

                <div className="flex-1" />

                {/* Right Section */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Settings */}
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <SettingsIcon className="h-5 w-5 text-slate-600" />
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Bell className="h-5 w-5 text-slate-600" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-900">{user?.displayName || user?.username || 'Admin'}</p>
                            <p className="text-xs text-slate-500 truncate max-w-xs">{user?.email || 'admin@example.com'}</p>
                        </div>
                        {user?.profile_picture ? (
                            <img
                                src={user.profile_picture}
                                alt={user.username}
                                className="h-10 w-10 rounded-full border-2 border-indigo-600 object-cover"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-indigo-700">
                                <span className="text-white font-bold text-sm">
                                    {(user?.username || 'A')[0].toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, X } from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
}

interface UserNavbarProps {
    items?: NavItem[];
    isOpen?: boolean;
    onClose?: () => void;
}

const defaultItems: NavItem[] = [
    { name: 'Home', href: '/user' },
    { name: 'Resources', href: '/user/resources' },
    { name: 'Upload', href: '/user/upload' },
    { name: 'Saved', href: '/user/saved' },
    { name: 'Search Users', href: '/user/search' },
];

export function UserNavbar({ items = defaultItems, isOpen, onClose }: UserNavbarProps) {
    const location = useLocation();

    const isActive = (href: string) => {
        if (href === '/user') return location.pathname === '/user' || location.pathname.match(/^\/user\/?$/);
        return location.pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Mobile Navbar */}
            <nav className={`
        fixed top-0 right-0 h-screen w-64 bg-white z-40 transition-transform duration-300 lg:hidden
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
                <div className="p-4 flex items-center justify-between border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-indigo-600" />
                        <span className="font-bold text-slate-900">Studiy</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-2">
                    {items.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={onClose}
                            className={`
                block px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive(item.href)
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }
              `}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Desktop Navbar */}
            <nav className="hidden lg:flex items-center space-x-1 bg-white border-b border-slate-200 px-8">
                {items.map((item) => (
                    <Link
                        key={item.name}
                        to={item.href}
                        className={`
              px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${isActive(item.href)
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                            }
            `}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
        </>
    );
}

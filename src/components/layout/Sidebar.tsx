import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { useAuth } from '@/src/context/AuthContext';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  children?: NavItem[];
}

interface SidebarProps {
  items: NavItem[];
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ items, title = 'Studiy', isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
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

      <aside className={cn(
        "w-64 bg-white border-r border-slate-200 flex flex-col fixed left-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:top-0 lg:h-screen",
        "top-16 h-[calc(100vh-64px)] md:top-16 md:h-[calc(100vh-64px)] lg:top-0 lg:h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-4 sm:px-6 border-b border-slate-200 lg:border-b">
          <Link to="/" className="flex items-center space-x-2 w-full">
            <div className="bg-indigo-600 p-1.5 rounded-lg flex-shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">{title}</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Menu
          </p>
          {items.map((item) => {
            const active = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.name);

            return (
              <div key={item.name} className="space-y-1">
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                      active
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className={cn('mr-3 h-5 w-5', active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500')} />
                      {item.name}
                    </div>
                    <ChevronRight className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')} />
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                      active
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className={cn('mr-3 h-5 w-5', active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500')} />
                      {item.name}
                    </div>
                    {item.badge && (
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}

                {hasChildren && isExpanded && (
                  <div className="pl-10 space-y-1">
                    {item.children!.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        onClick={onClose}
                        className={cn(
                          'block px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                          isActive(child.href)
                            ? 'text-indigo-600'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors group"
          >
            <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-600" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}

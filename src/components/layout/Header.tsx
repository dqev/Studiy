import { Bell, Search, User, Moon, Sun, Menu } from 'lucide-react';
import { Input } from '@/src/components/ui/Input';
import { Avatar } from '@/src/components/ui/Avatar';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onMenuClick?: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
      <div className="flex items-center space-x-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors sm:hidden">
          <Search className="h-5 w-5" />
        </button>

        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors hidden xs:block">
          <Moon className="h-5 w-5" />
        </button>

        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1 sm:mx-2"></div>

        <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">{user.name}</p>
            <p className="text-[10px] text-slate-500 mt-1">{user.email}</p>
          </div>
          <Avatar src={user.avatar} fallback={user.name} size="sm" className="sm:h-10 sm:w-10" />
        </div>
      </div>
    </header>
  );
}

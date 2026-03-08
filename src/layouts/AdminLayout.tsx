import * as React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Files,
  CheckCircle2,
  AlertCircle,
  Settings,
  UserCircle
} from 'lucide-react';
import { Sidebar, NavItem } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { useAuth } from '@/src/context/AuthContext';
import { UserRole } from '@/src/types';

const adminNavItems: NavItem[] = [
  { name: 'Admin Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Manage Users', href: '/admin/users', icon: Users },
  { name: 'Manage Resources', href: '/admin/resources', icon: Files },
  { name: 'Approvals', href: '/admin/approvals', icon: CheckCircle2, badge: '5' },
  { name: 'Reports', href: '/admin/reports', icon: AlertCircle },
  { name: 'System Settings', href: '/admin/settings', icon: Settings },
  { name: 'Admin Profile', href: '/admin/profile', icon: UserCircle },
];

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return <Navigate to="/user" replace />;
  }

  const admin = {
    name: user?.displayName || user?.username || 'Admin',
    email: user?.email || 'admin@studiy.com',
    avatar: user?.profile_picture,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        items={adminNavItems}
        title="Studiy Admin"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <Header user={admin} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-4 sm:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

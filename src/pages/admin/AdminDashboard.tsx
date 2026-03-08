import * as React from 'react';
import {
  Users,
  Files,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/utils/cn';
import { useAuth } from '@/src/context/AuthContext';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getPendingMaterials, getApprovedMaterials } from '@/src/firebase/materials';
import { UserRole } from '@/src/types';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const db = getFirestore();

  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalResources: 0,
    pendingApprovals: 0,
    totalDownloads: 0,
  });
  const [recentActivities, setRecentActivities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      fetchAdminStats();
    }
  }, [user?.role]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Get total users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Get pending and approved materials
      const pending = await getPendingMaterials();
      const approved = await getApprovedMaterials();

      const totalResources = approved.length;
      const pendingApprovals = pending.length;
      const totalDownloads = approved.reduce((sum, m) => sum + m.downloads, 0);

      setStats({
        totalUsers,
        totalResources,
        pendingApprovals,
        totalDownloads,
      });

      // Get recent activities
      const recentApproved = approved
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(m => ({
          type: 'approved',
          title: m.title,
          uploader: m.uploader_username,
          date: m.created_at,
          icon: CheckCircle2,
          color: 'text-green-600',
        }));

      setRecentActivities(recentApproved);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toString(),
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Total Resources',
      value: stats.totalResources.toString(),
      change: '+18%',
      trend: 'up' as const,
      icon: Files,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingApprovals.toString(),
      change: stats.pendingApprovals > 0 ? '+' + stats.pendingApprovals : '0',
      trend: 'up' as const,
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      label: 'Total Downloads',
      value: stats.totalDownloads.toString(),
      change: '+25%',
      trend: 'up' as const,
      icon: Download,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
  ];

  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-slate-500">System-wide performance and moderation metrics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsData.map((stat) => (
          <Card
            key={stat.label}
            className="border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              if (stat.label === 'Pending Approvals') navigate('/admin/approvals');
              if (stat.label === 'Total Users') navigate('/admin/users');
              if (stat.label === 'Total Resources') navigate('/admin/resources');
            }}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className={`${stat.bg} p-1.5 sm:p-2 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
                <div className={cn(
                  'flex items-center text-[10px] sm:text-xs font-medium',
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                )}>
                  {stat.change}
                  {stat.trend === 'up' ? <ArrowUpRight className="ml-0.5 sm:ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <ArrowDownRight className="ml-0.5 sm:ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                </div>
              </div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500 leading-tight">{stat.label}</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <CardContent className="p-6 space-y-3">
            <Button
              onClick={() => navigate('/admin/approvals')}
              className="w-full justify-start text-left"
              variant="outline"
            >
              <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
              Review Pending Approvals ({stats.pendingApprovals})
            </Button>
            <Button
              onClick={() => navigate('/admin/users')}
              className="w-full justify-start text-left"
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              Manage Users ({stats.totalUsers})
            </Button>
            <Button
              onClick={() => navigate('/admin/resources')}
              className="w-full justify-start text-left"
              variant="outline"
            >
              <Files className="h-4 w-4 mr-2 text-indigo-600" />
              View All Resources ({stats.totalResources})
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">System Status</h2>
          </div>
          <CardContent className="p-6 space-y-4">
            {[
              { label: 'Database', status: 'Operational', color: 'bg-green-500' },
              { label: 'Authentication', status: 'Operational', color: 'bg-green-500' },
              { label: 'File Storage', status: 'Operational', color: 'bg-green-500' },
              { label: 'Email Service', status: 'Operational', color: 'bg-green-500' },
            ].map((service) => (
              <div key={service.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${service.color}`} />
                  <span className="text-sm font-medium text-slate-700">{service.label}</span>
                </div>
                <Badge className="bg-green-100 text-green-800">{service.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Approvals */}
      {recentActivities.length > 0 && (
        <Card className="border-none shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recently Approved Resources</h2>
          </div>
          <CardContent className="p-6">
            <div className="space-y-3">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-500">by {activity.uploader}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

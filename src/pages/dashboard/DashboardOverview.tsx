import { useEffect, useState } from 'react';
import {
  BookOpen,
  Eye,
  Star,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { getMaterialsByUploader, getMaterialsByUploaderEmail } from '@/src/firebase/materials';
import { Material } from '@/src/types';

export function DashboardOverview() {
  const { user } = useAuth();
  const [userMaterials, setUserMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserMaterials = async () => {
      if (user?.id) {
        try {
          // Try to fetch by ID first, then by email
          let materials = await getMaterialsByUploader(user.id);

          if (materials.length === 0 && user.email) {
            // Fallback to email-based query
            materials = await getMaterialsByUploaderEmail(user.email);
          }

          setUserMaterials(materials.slice(0, 3)); // Show last 3
        } catch (error) {
          // Silently handle error
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserMaterials();
  }, [user?.id, user?.email]);

  const totalDownloads = userMaterials.reduce((sum, m) => sum + (m.downloads || 0), 0);
  const avgRating = userMaterials.length > 0
    ? (userMaterials.reduce((sum, m) => sum + (m.rating || 0), 0) / userMaterials.length).toFixed(1)
    : '0';
  const totalViews = userMaterials.reduce((sum, m) => sum + (m.views || 0), 0);

  const stats = [
    { label: 'Resources', value: userMaterials.length.toString(), icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Views', value: totalViews > 1000 ? (totalViews / 1000).toFixed(1) + 'k' : totalViews.toString(), icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Rating', value: avgRating, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Downloads', value: totalDownloads.toString(), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Hi, {user?.username || 'there'}!</h1>
          <p className="text-sm text-slate-500">Here's your update for today.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Report</Button>
          <Button size="sm" className="flex-1 sm:flex-none">Upload</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-4">
              <div className={`${stat.bg} p-2 sm:p-3 rounded-xl`}>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] sm:text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your most recently uploaded and updated resources.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-indigo-600">View All</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading your resources...</div>
            ) : userMaterials.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No resources uploaded yet.</p>
                <Button variant="outline" size="sm" className="mt-4">Upload your first resource</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userMaterials.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <BookOpen className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{resource.title}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-slate-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> {new Date(resource.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center">
                            <Eye className="h-3 w-3 mr-1" /> {resource.views || 0}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center">
                            <Star className="h-3 w-3 mr-1 text-amber-500 fill-amber-500" /> {(resource.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{resource.file_type || 'PDF'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Don't miss these important dates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { title: 'Math Assignment', date: 'Tomorrow, 11:59 PM', color: 'bg-red-500' },
              { title: 'Physics Lab Report', date: 'Aug 15, 2025', color: 'bg-amber-500' },
              { title: 'History Essay', date: 'Aug 20, 2025', color: 'bg-blue-500' },
            ].map((deadline, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className={`mt-1.5 h-2 w-2 rounded-full ${deadline.color}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{deadline.title}</p>
                  <p className="text-xs text-slate-500">{deadline.date}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View Calendar <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

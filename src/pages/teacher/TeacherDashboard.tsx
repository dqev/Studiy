import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Eye,
    Star,
    TrendingUp,
    Clock,
    ArrowRight,
    Upload,
    Download,
    Notebook,
    Trophy,
    CheckCircle2,
    Users,
    BarChart3,
} from 'lucide-react';
import { IoNotifications } from "react-icons/io5";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { getMaterialsByUploader, getMaterialsByUploaderEmail } from '@/src/firebase/materials';
import { Material } from '@/src/types';

export function TeacherDashboard() {
    const navigate = useNavigate();
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
                    console.error('Error fetching materials:', error);
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
        { label: 'Course Materials', value: userMaterials.length.toString(), icon: Notebook, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Views', value: totalViews > 1000 ? (totalViews / 1000).toFixed(1) + 'k' : totalViews.toString(), icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Rating', value: avgRating, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Downloads', value: totalDownloads.toString(), icon: Download, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome, {user?.username || 'Teacher'}!</h1>
                    <p className="text-sm text-slate-500">Manage your courses and track student engagement.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none gap-1"
                        onClick={() => navigate('/teacher/notifications')}
                    >
                        <IoNotifications size={20} />
                        Notifications
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => navigate('/teacher/upload')}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Material
                    </Button>
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
                            <CardTitle>Recent Course Materials</CardTitle>
                            <CardDescription>Your most recently uploaded course materials.</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600"
                            onClick={() => navigate('/teacher/materials')}
                        >
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">Loading your materials...</div>
                        ) : userMaterials.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <p>No course materials uploaded yet.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => navigate('/teacher/upload')}
                                >
                                    Create your first course
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {userMaterials.map((resource) => (
                                    <div key={resource.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-slate-100 p-2 rounded-lg">
                                                <Notebook className="h-5 w-5 text-slate-600" />
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
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">{resource.status || 'PENDING'}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                        <CardDescription>Your teaching progress overview.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-900">Material Upload Progress</span>
                                <span className="text-sm text-slate-500">{userMaterials.length} of 20</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-300"
                                    style={{ width: `${Math.min((userMaterials.length / 20) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => navigate('/teacher/upload')}
                        >
                            Upload Material <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <div className="border-t pt-4 space-y-3">
                            <button
                                onClick={() => navigate('/teacher/my-classes')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <Notebook className="h-4 w-4" />
                                View My Classes
                            </button>
                            <button
                                onClick={() => navigate('/teacher/student-progress')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <BarChart3 className="h-4 w-4" />
                                Student Progress
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import * as React from 'react';
import { BarChart3, TrendingUp, Calendar, Download, Star } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { getApprovedMaterials } from '@/src/firebase/materials';
import { UserRole } from '@/src/types';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export function AdminReports() {
    const { user } = useAuth();
    const db = getFirestore();

    const [reportData, setReportData] = React.useState({
        totalViews: 0,
        totalDownloads: 0,
        averageRating: 0,
        userGrowth: 0,
        resourceStats: [] as any[],
        topResources: [] as any[],
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (user?.role === UserRole.ADMIN) {
            fetchReportData();
        }
    }, [user?.role]);

    const fetchReportData = async () => {
        try {
            setLoading(true);

            // Fetch materials data
            const materials = await getApprovedMaterials();

            const totalViews = materials.reduce((sum, m) => sum + m.views, 0);
            const totalDownloads = materials.reduce((sum, m) => sum + m.downloads, 0);
            const averageRating = materials.length > 0
                ? (materials.reduce((sum, m) => sum + m.rating, 0) / materials.length).toFixed(1)
                : '0';

            // Category distribution
            const categoryMap = new Map();
            materials.forEach(m => {
                const count = categoryMap.get(m.category) || 0;
                categoryMap.set(m.category, count + 1);
            });

            const resourceStats = Array.from(categoryMap).map(([category, count]) => ({
                category,
                count,
                percentage: ((count / materials.length) * 100).toFixed(1),
            }));

            // Top resources
            const topResources = materials
                .sort((a, b) => b.downloads - a.downloads)
                .slice(0, 5)
                .map(m => ({
                    title: m.title,
                    downloads: m.downloads,
                    rating: m.rating.toFixed(1),
                    views: m.views,
                }));

            // User count
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const userGrowth = usersSnapshot.size;

            setReportData({
                totalViews,
                totalDownloads,
                averageRating: parseFloat(averageRating),
                userGrowth,
                resourceStats,
                topResources,
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== UserRole.ADMIN) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">Access denied. Admin role required.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
                <p className="text-sm text-slate-500 mt-1">Platform-wide statistics and performance metrics</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <BarChart3 className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 uppercase">Total Views</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{reportData.totalViews.toLocaleString()}</p>
                </Card>

                <Card className="p-4 bg-green-50 border-green-200">
                    <Download className="h-5 w-5 text-green-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 uppercase">Total Downloads</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{reportData.totalDownloads.toLocaleString()}</p>
                </Card>

                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <TrendingUp className="h-5 w-5 text-yellow-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 uppercase">Avg Rating</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{reportData.averageRating.toFixed(1)}/5.0</p>
                </Card>

                <Card className="p-4 bg-purple-50 border-purple-200">
                    <TrendingUp className="h-5 w-5 text-purple-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 uppercase">Total Users</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{reportData.userGrowth.toLocaleString()}</p>
                </Card>
            </div>

            {/* Category Distribution */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Resource Distribution by Category</h2>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                        <p className="text-slate-500">Loading data...</p>
                    </div>
                ) : reportData.resourceStats.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No data available</p>
                ) : (
                    <div className="space-y-3">
                        {reportData.resourceStats.map((stat) => (
                            <div key={stat.category}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-slate-900">{stat.category}</span>
                                    <span className="text-sm text-slate-600">
                                        {stat.count} resources ({stat.percentage}%)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full rounded-full"
                                        style={{ width: `${stat.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Top Resources */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Resources by Downloads</h2>
                {reportData.topResources.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No resources available</p>
                ) : (
                    <div className="space-y-3">
                        {reportData.topResources.map((resource, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-medium text-slate-900">{idx + 1}. {resource.title}</h3>
                                    <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        {resource.rating}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">Downloads</p>
                                        <p className="font-semibold text-slate-900">{resource.downloads}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">Views</p>
                                        <p className="font-semibold text-slate-900">{resource.views}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">Engagement</p>
                                        <p className="font-semibold text-slate-900">
                                            {resource.downloads > 0 ? ((resource.downloads / resource.views) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Export Options */}
            <Card className="p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-900">Export Reports</h3>
                        <p className="text-sm text-slate-600">Download detailed analytics and reports</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            CSV
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { useEffect, useState } from 'react';
import { getMaterialsByUploader, getMaterialsByUploaderEmail } from '@/src/firebase/materials';
import { Material } from '@/src/types';
import { Notebook, Clock, Eye, Download } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';

export function TeacherMaterials() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterials = async () => {
            if (user?.id) {
                try {
                    let items = await getMaterialsByUploader(user.id);
                    if (items.length === 0 && user.email) {
                        items = await getMaterialsByUploaderEmail(user.email);
                    }
                    setMaterials(items);
                } catch (error) {
                    console.error('Error fetching materials:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchMaterials();
    }, [user?.id, user?.email]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Course Materials</h1>
                    <p className="text-slate-500">Manage all your uploaded course materials and resources</p>
                </div>
                <Button onClick={() => navigate('/teacher/upload')}>Upload New Material</Button>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Your Materials ({materials.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Loading materials...</div>
                    ) : materials.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>No materials uploaded yet</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/teacher/upload')}>
                                Upload your first material
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {materials.map((material) => (
                                <div key={material.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="bg-indigo-50 p-2 rounded-lg">
                                                <Notebook className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-slate-900">{material.title}</h3>
                                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{material.description}</p>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {new Date(material.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" /> {material.views || 0} views
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Download className="h-3 w-3" /> {material.downloads || 0} downloads
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge>{material.status}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

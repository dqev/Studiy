import * as React from 'react';
import { AlertCircle, Clock, Eye } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { getUserPendingUploads } from '@/src/firebase/materials';
import { Material, MaterialStatus } from '@/src/types';

export function UserPendingMaterial() {
    const { user } = useAuth();

    const [pendingMaterials, setPendingMaterials] = React.useState<Material[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (user?.email) {
            fetchPendingMaterials();
        }
    }, [user?.email]);

    const fetchPendingMaterials = async () => {
        try {
            setLoading(true);
            if (!user?.email) return;

            const { onUserPendingUploadsChange } = await import('@/src/firebase/materials');

            // Set up real-time listener
            const unsubscribe = onUserPendingUploadsChange(user.email, (materials) => {
                setPendingMaterials(materials as unknown as Material[]);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error('Error fetching pending materials:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Please log in to view your pending materials</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pending Reviews</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Resources waiting for admin approval ({pendingMaterials.length})
                </p>
            </div>

            {/* Info Alert */}
            <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Approval Process</p>
                        <p>Your resources are reviewed by our team to ensure quality and compliance. This usually takes 24 hours.</p>
                    </div>
                </div>
            </Card>

            {/* Pending Materials List */}
            {loading ? (
                <Card className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading pending materials...</p>
                </Card>
            ) : pendingMaterials.length === 0 ? (
                <Card className="p-8 text-center">
                    <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-2">No pending materials</p>
                    <p className="text-sm text-slate-400">All your resources have been reviewed</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pendingMaterials.map((material) => (
                        <Card
                            key={material.id}
                            className="p-4 border-yellow-200 bg-yellow-50 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    {/* Title and Badge */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-base font-semibold text-slate-900 truncate">
                                            {material.title}
                                        </h3>
                                        <Badge className="bg-yellow-100 text-yellow-800 flex-shrink-0">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {material.status}
                                        </Badge>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                        {material.description}
                                    </p>

                                    {/* Meta Info */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-500 uppercase">Category</span>
                                            <span className="text-sm font-semibold text-slate-900">{material.category}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-500 uppercase">Subject</span>
                                            <span className="text-sm font-semibold text-slate-900">{material.subject || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-500 uppercase">Submitted</span>
                                            <span className="text-sm font-semibold text-slate-900">
                                                {new Date(material.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-500 uppercase">Tags</span>
                                            <span className="text-sm font-semibold text-slate-900">
                                                {material.tags.length > 0 ? material.tags.length : '0'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {material.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {material.tags.slice(0, 3).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {material.tags.length > 3 && (
                                                <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                                    +{material.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(material.file_url, '_blank')}
                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                </div>
                            </div>

                            {/* Timeline Info */}
                            <div className="mt-3 pt-3 border-t border-yellow-200">
                                <p className="text-xs text-yellow-800">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    Your resource is under review. We'll notify you once a decision is made.
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Stats Card */}
            {pendingMaterials.length > 0 && (
                <Card className="p-4 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs font-medium text-slate-600 uppercase mb-1">Pending Review</p>
                            <p className="text-2xl font-bold text-slate-900">{pendingMaterials.length}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-600 uppercase mb-1">Average Wait Time</p>
                            <p className="text-2xl font-bold text-slate-900">24 hrs</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-600 uppercase mb-1">Total Submitted</p>
                            <p className="text-2xl font-bold text-slate-900">{pendingMaterials.length}</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

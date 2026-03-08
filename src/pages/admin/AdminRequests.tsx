import * as React from 'react';
import { CheckCircle, XCircle, Eye, User, Calendar, Tag } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { getPendingMaterials, approveMaterial, rejectMaterial, sendApprovalNotification, sendRejectionNotification } from '@/src/firebase/materials';
import { Material, MaterialStatus, UserRole } from '@/src/types';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

interface MaterialWithEmail extends Material {
    uploader_email?: string;
    firebaseId?: string;
    uploader_profile_picture?: string;
}

interface UserWithStats {
    profile_picture?: string;
    displayName?: string;
}

export function AdminRequests() {
    const { user } = useAuth();
    const db = getFirestore();
    const [pendingMaterials, setPendingMaterials] = React.useState<MaterialWithEmail[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [processingId, setProcessingId] = React.useState<string | null>(null);
    const [selectedMaterial, setSelectedMaterial] = React.useState<MaterialWithEmail | null>(null);
    const [rejectReason, setRejectReason] = React.useState('');
    const [usersMap, setUsersMap] = React.useState<Map<string, UserWithStats>>(new Map());

    React.useEffect(() => {
        if (user?.role === UserRole.ADMIN) {
            fetchDetails();
            fetchPendingMaterials();
        }
    }, [user?.role]);

    const fetchPendingMaterials = async () => {
        try {
            setLoading(true);
            const materials = await getPendingMaterials();

            // Enrich materials with profile pictures from usersMap
            const materialsWithProfiles = materials.map(material => {
                const userDetails = usersMap.get(material.uploader_username);
                return {
                    ...material,
                    uploader_profile_picture: userDetails?.profile_picture || undefined
                };
            });

            setPendingMaterials(materialsWithProfiles);
        } finally {
            setLoading(false);
        }
    };
    const fetchDetails = async () => {
        try {
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersRef);

            const usersMapData = new Map<string, UserWithStats>();
            for (const doc of querySnapshot.docs) {
                const userData = doc.data();
                usersMapData.set(userData.username, {
                    profile_picture: userData.profile_picture,
                    displayName: userData.displayName,
                });
            }
            setUsersMap(usersMapData);
        } catch (error) {
            // Silently handle errors
        }
    };

    const handleApproveMaterial = async (materialId: string) => {
        try {
            setProcessingId(materialId);

            // Find the material to get uploader info
            const material = pendingMaterials.find(m => m.id === materialId);
            if (!material) {
                alert('Material not found');
                return;
            }

            // Approve the material
            await approveMaterial(materialId);

            // Send notification to user if they have an email
            if (material.uploader_email) {
                await sendApprovalNotification(materialId, material.uploader_email, material.title);
            }

            setPendingMaterials(prev => prev.filter(m => m.id !== materialId));
        } catch (error) {
            alert('Failed to approve material');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectMaterial = async (materialId: string) => {
        try {
            setProcessingId(materialId);

            // Find the material to get uploader info
            const material = pendingMaterials.find(m => m.id === materialId);
            if (!material) {
                alert('Material not found');
                return;
            }

            // Reject the material
            await rejectMaterial(materialId);

            // Send notification to user if they have an email
            if (material.uploader_email) {
                await sendRejectionNotification(materialId, material.uploader_email, material.title, rejectReason);
            }

            setPendingMaterials(prev => prev.filter(m => m.id !== materialId));
            setSelectedMaterial(null);
            setRejectReason('');
        } catch (error) {
            alert('Failed to reject material');
        } finally {
            setProcessingId(null);
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
                <h1 className="text-2xl font-bold text-slate-900">Pending Approvals</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Review and approve/reject user-submitted resources ({pendingMaterials.length})
                </p>
            </div>

            {/* Stats */}
            <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Pending Review</p>
                        <p className="text-3xl font-bold text-yellow-600">{pendingMaterials.length}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Avg Review Time</p>
                        <p className="text-3xl font-bold text-slate-900">24h</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Action Required</p>
                        <p className="text-3xl font-bold text-orange-600">{pendingMaterials.length}</p>
                    </div>
                </div>
            </Card>

            {/* Materials List */}
            {loading ? (
                <Card className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading pending materials...</p>
                </Card>
            ) : pendingMaterials.length === 0 ? (
                <Card className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-slate-500 mb-2">All caught up!</p>
                    <p className="text-sm text-slate-400">There are no pending materials to review</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pendingMaterials.map((material) => (
                        <Card key={material.id} className="p-3 sm:p-5 border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
                            <div className="flex flex-col gap-4">
                                {/* Content */}
                                <div className="min-w-0">
                                    {/* Title and ID */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex-1 break-words">
                                            {material.title}
                                        </h3>
                                        <Badge className="bg-yellow-100 text-yellow-800 flex-shrink-0 w-fit">
                                            Pending
                                        </Badge>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs sm:text-sm text-slate-600 mb-3 line-clamp-2">
                                        {material.description}
                                    </p>

                                    {/* Metadata Grid - Stack on mobile, 2 cols on sm, 4 cols on md */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2 md:col-span-1">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {material.uploader_profile_picture ? (
                                                    <img
                                                        src={material.uploader_profile_picture}
                                                        alt={material.uploader_username}
                                                        className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                                                        {material.uploader_username?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-900 truncate">{material.uploader_username}</p>
                                                    <p className="text-xs text-slate-500 truncate">{usersMap.get(material.uploader_username)?.displayName || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 text-xs sm:text-sm">
                                            <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500 uppercase">Submitted</p>
                                                <p className="font-medium text-slate-900">
                                                    {new Date(material.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 text-xs sm:text-sm">
                                            <Tag className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500 uppercase">Category</p>
                                                <p className="font-medium text-slate-900 break-words">{material.category}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 text-xs sm:text-sm">
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500 uppercase">Subject</p>
                                                <p className="font-medium text-slate-900 break-words">{material.subject || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {material.tags && material.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {material.tags.slice(0, 3).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {material.tags.length > 3 && (
                                                <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                                                    +{material.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Uploader Email */}
                                    {material.uploader_email && (
                                        <p className="text-xs text-slate-500 break-all">
                                            Email: <span className="font-medium">{material.uploader_email}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Actions - Stack on mobile, flex on desktop */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs sm:text-sm"
                                        onClick={() => window.open(material.file_url, '_blank')}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                                        onClick={() => handleApproveMaterial(material.id)}
                                        disabled={processingId === material.id}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm"
                                        onClick={() => setSelectedMaterial(material)}
                                        disabled={processingId === material.id}
                                    >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {selectedMaterial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-3">
                            Reject: {selectedMaterial.title}
                        </h2>
                        <p className="text-sm text-slate-600 mb-4">
                            Provide a reason for rejection (optional):
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g., Content is not relevant, Low quality file, etc."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                            rows={4}
                        />
                        <div className="flex gap-3">
                            <Button
                                onClick={() => handleRejectMaterial(selectedMaterial.id)}
                                disabled={processingId === selectedMaterial.id}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                {processingId === selectedMaterial.id ? 'Rejecting...' : 'Confirm Rejection'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedMaterial(null);
                                    setRejectReason('');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

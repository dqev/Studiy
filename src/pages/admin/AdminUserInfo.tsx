import * as React from 'react';
import { X, Shield, Ban, UserCheck, Mail, Calendar, Download, FileText, MessageSquare, Copy } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { UserRole } from '@/src/types';

interface UserWithStats {
    id: string;
    google_id: string;
    username: string;
    email: string;
    displayName?: string;
    profile_picture?: string;
    role: UserRole;
    created_at: string;
    uploads: number;
    downloads: number;
    isBanned?: boolean;
}

interface UserDetailInfo extends UserWithStats {
    totalComments?: number;
    totalMaterials?: number;
    materials?: Array<{
        id: string;
        title: string;
        category: string;
        created_at: string;
        status: string;
    }>;
}

interface AdminUserInfoProps {
    user: UserWithStats;
    isOpen: boolean;
    onClose: () => void;
    onToggleAdmin: (userId: string, currentRole: UserRole) => Promise<void>;
    onBanUser: (userId: string) => Promise<void>;
    onUnbanUser: (userId: string) => Promise<void>;
    processingId: string | null;
}

export function AdminUserInfo({
    user,
    isOpen,
    onClose,
    onToggleAdmin,
    onBanUser,
    onUnbanUser,
    processingId,
}: AdminUserInfoProps) {
    const db = getFirestore();
    const [userDetails, setUserDetails] = React.useState<UserDetailInfo | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [materials, setMaterials] = React.useState<any[]>([]);
    const [comments, setComments] = React.useState<any[]>([]);
    const [activeTab, setActiveTab] = React.useState<'overview' | 'materials' | 'activity'>('overview');

    React.useEffect(() => {
        if (isOpen && user) {
            fetchUserDetails();
        }
    }, [isOpen, user]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);

            // Fetch materials
            const materialsRef = collection(db, 'materials');
            const materialsQuery = query(materialsRef, where('uploader_email', '==', user.email));
            const materialsSnapshot = await getDocs(materialsQuery);
            const materialsData = materialsSnapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().title,
                category: doc.data().category,
                created_at: doc.data().created_at,
                status: doc.data().status,
                views: doc.data().views || 0,
                downloads: doc.data().downloads || 0,
            }));
            setMaterials(materialsData);

            // Fetch comments from all materials' subcollections
            let commentsData: any[] = [];
            try {
                for (const material of materialsSnapshot.docs) {
                    const materialId = material.id;
                    const materialTitle = material.data().title;

                    // Query comments subcollection for this material
                    const commentsRef = collection(db, 'materials', materialId, 'comments');
                    const commentsQuery = query(commentsRef, where('author_email', '==', user.email));
                    const commentsSnapshot = await getDocs(commentsQuery);

                    commentsSnapshot.docs.forEach(doc => {
                        commentsData.push({
                            id: doc.id,
                            content: doc.data().content,
                            created_at: doc.data().created_at,
                            materialTitle: materialTitle,
                            materialId: materialId,
                        });
                    });
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
                // Continue without comments if query fails
                commentsData = [];
            }
            setComments(commentsData);

            setUserDetails({
                ...user,
                totalMaterials: materialsData.length,
                totalComments: commentsData.length,
                materials: materialsData,
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {user.profile_picture ? (
                            <img
                                src={user.profile_picture}
                                alt={user.username}
                                className="h-12 w-12 rounded-full object-cover border-2 border-white"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold">{user.displayName || user.username}</h2>
                            <p className="text-indigo-100">@{user.username}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : userDetails ? (
                        <>
                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 border-b border-slate-200">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'overview'
                                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('materials')}
                                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'materials'
                                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Materials ({materials.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('activity')}
                                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'activity'
                                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Activity ({comments.length})
                                </button>
                            </div>

                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* User Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <Card className="p-4 bg-blue-50 border-blue-200">
                                            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Materials</p>
                                            <p className="text-2xl font-bold text-blue-600">{materials.length}</p>
                                        </Card>
                                        <Card className="p-4 bg-purple-50 border-purple-200">
                                            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Downloads</p>
                                            <p className="text-2xl font-bold text-purple-600">{user.downloads}</p>
                                        </Card>
                                        <Card className="p-4 bg-green-50 border-green-200">
                                            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Comments</p>
                                            <p className="text-2xl font-bold text-green-600">{comments.length}</p>
                                        </Card>
                                        <Card className="p-4 bg-orange-50 border-orange-200">
                                            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Member Since</p>
                                            <p className="text-sm font-bold text-orange-600">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </p>
                                        </Card>
                                    </div>

                                    {/* User Information */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg text-slate-900">User Information</h3>

                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-slate-500" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-600 uppercase">Email</p>
                                                        <p className="text-sm text-slate-900">{user.email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(user.email)}
                                                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                                                    title="Copy to clipboard"
                                                >
                                                    <Copy className="h-4 w-4 text-slate-600" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-slate-500" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-600 uppercase">Role</p>
                                                        <p className="text-sm text-slate-900">{user.role}</p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={
                                                        user.role === UserRole.ADMIN
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-slate-100 text-slate-800'
                                                    }
                                                >
                                                    {user.role}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-slate-500" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-600 uppercase">Joined</p>
                                                        <p className="text-sm text-slate-900">
                                                            {new Date(user.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-slate-500" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-600 uppercase">Status</p>
                                                        <p className="text-sm text-slate-900">
                                                            {user.isBanned ? 'Banned' : 'Active'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={
                                                        user.isBanned
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }
                                                >
                                                    {user.isBanned ? 'Banned' : 'Active'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-3 pt-4 border-t border-slate-200">
                                        <h3 className="font-semibold text-lg text-slate-900">Actions</h3>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={user.role === UserRole.ADMIN ? 'outline' : 'default'}
                                                onClick={() => onToggleAdmin(user.id, user.role)}
                                                disabled={processingId === user.id}
                                                className={
                                                    user.role === UserRole.ADMIN
                                                        ? 'border-purple-600 text-purple-600 hover:bg-purple-50'
                                                        : ''
                                                }
                                            >
                                                <Shield className="h-4 w-4 mr-2" />
                                                {user.role === UserRole.ADMIN ? 'Demote to User' : 'Promote to Admin'}
                                            </Button>

                                            {user.isBanned ? (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => onUnbanUser(user.id)}
                                                    disabled={processingId === user.id}
                                                    className="border-green-600 text-green-600 hover:bg-green-50"
                                                >
                                                    <UserCheck className="h-4 w-4 mr-2" />
                                                    Unban User
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => onBanUser(user.id)}
                                                    disabled={processingId === user.id}
                                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                                >
                                                    <Ban className="h-4 w-4 mr-2" />
                                                    Ban User
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Materials Tab */}
                            {activeTab === 'materials' && (
                                <div className="space-y-4">
                                    {materials.length === 0 ? (
                                        <Card className="p-8 text-center bg-slate-50">
                                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500">No materials uploaded yet</p>
                                        </Card>
                                    ) : (
                                        <div className="space-y-3">
                                            {materials.map(material => (
                                                <Card key={material.id} className="p-4 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-slate-900">{material.title}</h4>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Badge variant="secondary">{material.category}</Badge>
                                                                <Badge
                                                                    className={`${material.status === 'approved'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : material.status === 'pending'
                                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                                : 'bg-red-100 text-red-800'
                                                                        }`}
                                                                >
                                                                    {material.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-2">
                                                                {new Date(material.created_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Download className="h-4 w-4 text-slate-600" />
                                                                <span className="text-slate-900">{material.downloads}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Activity Tab */}
                            {activeTab === 'activity' && (
                                <div className="space-y-4">
                                    {comments.length === 0 ? (
                                        <Card className="p-8 text-center bg-slate-50">
                                            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500">No comments yet</p>
                                        </Card>
                                    ) : (
                                        <div className="space-y-3">
                                            {comments.map(comment => (
                                                <Card key={comment.id} className="p-4 bg-slate-50">
                                                    <div className="flex items-start gap-3">
                                                        <MessageSquare className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-slate-900 break-words">{comment.content}</p>
                                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                                                                <p className="text-xs text-slate-500">
                                                                    On: <span className="font-medium">{comment.materialTitle}</span>
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {new Date(comment.created_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </Card>
        </div>
    );
}

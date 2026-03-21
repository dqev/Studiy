import * as React from 'react';
import { Users, Search, Shield, UserCheck, Trash2, Award, Mail } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { User as AppUser, UserRole } from '@/src/types';

interface TeacherUser extends AppUser {
    totalMaterials?: number;
    totalStudents?: number;
    joinedDate?: string;
}

export function AdminTeachers() {
    const { user } = useAuth();
    const db = getFirestore();

    const [allUsers, setAllUsers] = React.useState<TeacherUser[]>([]);
    const [teachers, setTeachers] = React.useState<TeacherUser[]>([]);
    const [filteredTeachers, setFilteredTeachers] = React.useState<TeacherUser[]>([]);
    const [allUsersForPromotion, setAllUsersForPromotion] = React.useState<TeacherUser[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [processingId, setProcessingId] = React.useState<string | null>(null);
    const [showPromoteModal, setShowPromoteModal] = React.useState(false);

    React.useEffect(() => {
        if (user?.role === UserRole.ADMIN) {
            fetchAllUsers();
        }
    }, [user?.role]);

    React.useEffect(() => {
        filterTeachers();
    }, [teachers, searchTerm]);

    const fetchAllUsers = async () => {
        try {
            setLoading(true);
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersRef);

            const users: TeacherUser[] = [];
            for (const docSnapshot of querySnapshot.docs) {
                const userData = docSnapshot.data();
                users.push({
                    id: docSnapshot.id,
                    google_id: userData.google_id || '',
                    username: userData.username || '',
                    email: userData.email || '',
                    role: userData.role || UserRole.USER,
                    created_at: userData.created_at || new Date().toISOString(),
                    profile_picture: userData.profile_picture,
                    displayName: userData.displayName,
                    totalMaterials: userData.totalMaterials || 0,
                    totalStudents: userData.totalStudents || 0,
                });
            }

            setAllUsers(users);

            // Filter teachers only
            const teachersOnly = users.filter(u => u.role === UserRole.TEACHER);
            teachersOnly.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setTeachers(teachersOnly);

            // Filter users who can be promoted to teachers (not already teachers or admins)
            const promotionCandidates = users.filter(u => u.role === UserRole.USER);
            promotionCandidates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setAllUsersForPromotion(promotionCandidates);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTeachers = () => {
        let filtered = teachers;

        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                t.username.toLowerCase().includes(search) ||
                t.email.toLowerCase().includes(search) ||
                t.displayName?.toLowerCase().includes(search)
            );
        }

        setFilteredTeachers(filtered);
    };

    const handlePromoteToTeacher = async (userId: string) => {
        try {
            setProcessingId(userId);
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { role: UserRole.TEACHER });

            // Update local state
            setAllUsers(prev =>
                prev.map(u => u.id === userId ? { ...u, role: UserRole.TEACHER } : u)
            );

            const promotedUser = allUsersForPromotion.find(u => u.id === userId);
            if (promotedUser) {
                setTeachers(prev => [{ ...promotedUser, role: UserRole.TEACHER }, ...prev]);
                setAllUsersForPromotion(prev => prev.filter(u => u.id !== userId));
            }

            alert('User promoted to teacher successfully!');
        } catch (error) {
            console.error('Error promoting user to teacher:', error);
            alert('Failed to promote user to teacher');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDemoteTeacher = async (userId: string) => {
        if (!confirm('Are you sure you want to demote this teacher back to user?')) return;

        try {
            setProcessingId(userId);
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { role: UserRole.USER });

            const demotedTeacher = teachers.find(t => t.id === userId);
            if (demotedTeacher) {
                setTeachers(prev => prev.filter(t => t.id !== userId));
                setAllUsersForPromotion(prev => [{ ...demotedTeacher, role: UserRole.USER }, ...prev]);
            }

            alert('Teacher demoted to user successfully!');
        } catch (error) {
            console.error('Error demoting teacher:', error);
            alert('Failed to demote teacher');
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Teacher Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage teachers and promote users to teacher role
                    </p>
                </div>
                <Button onClick={() => setShowPromoteModal(true)} className="gap-2">
                    <UserCheck className="h-4 w-4" />
                    Promote to Teacher
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-indigo-50 border-indigo-200">
                    <Award className="h-5 w-5 text-indigo-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 uppercase">Total Teachers</p>
                    <p className="text-2xl font-bold text-indigo-600">{teachers.length}</p>
                </Card>

                <Card className="p-4 bg-blue-50 border-blue-200">
                    <Users className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 uppercase">Eligible for Promotion</p>
                    <p className="text-2xl font-bold text-blue-600">{allUsersForPromotion.length}</p>
                </Card>

                <Card className="p-4 bg-emerald-50 border-emerald-200">
                    <Shield className="h-5 w-5 text-emerald-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 uppercase">Admin Users</p>
                    <p className="text-2xl font-bold text-emerald-600">{allUsers.filter(u => u.role === UserRole.ADMIN).length}</p>
                </Card>
            </div>

            {/* Current Teachers */}
            <Card className="border-none shadow-sm">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Current Teachers ({teachers.length})</h2>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Loading teachers...</div>
                    ) : teachers.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>No teachers yet. Promote users to create teachers.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="mb-4">
                                <Input
                                    placeholder="Search teachers by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="max-w-md"
                                />
                            </div>

                            {/* Teachers List */}
                            <div className="grid gap-4">
                                {filteredTeachers.length === 0 ? (
                                    <p className="text-sm text-slate-500 py-4">No teachers match your search.</p>
                                ) : (
                                    filteredTeachers.map((teacher) => (
                                        <div
                                            key={teacher.id}
                                            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={teacher.profile_picture || 'favicon/favicon.svg'}
                                                    alt={teacher.username}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="font-semibold text-slate-900">{teacher.displayName || teacher.username}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Mail className="h-3 w-3 text-slate-400" />
                                                        <p className="text-xs text-slate-500">{teacher.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-indigo-100 text-indigo-700">Teacher</Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDemoteTeacher(teacher.id)}
                                                    disabled={processingId === teacher.id}
                                                    className="text-amber-600 hover:bg-amber-50"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Demote
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Promote Modal */}
            {showPromoteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto border-none shadow-xl">
                        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">Promote Users to Teacher</h2>
                                <button
                                    onClick={() => setShowPromoteModal(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {allUsersForPromotion.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No users available for promotion.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {allUsersForPromotion.map((candidateUser) => (
                                        <div
                                            key={candidateUser.id}
                                            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={candidateUser.profile_picture || 'favicon/favicon.svg'}
                                                    alt={candidateUser.username}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="font-semibold text-slate-900">{candidateUser.displayName || candidateUser.username}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Mail className="h-3 w-3 text-slate-400" />
                                                        <p className="text-xs text-slate-500">{candidateUser.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                onClick={() => handlePromoteToTeacher(candidateUser.id)}
                                                disabled={processingId === candidateUser.id}
                                                className="gap-1"
                                            >
                                                <UserCheck className="h-4 w-4" />
                                                Promote
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

import * as React from 'react';
import { Users, Search, Shield, Ban, Edit, UserCheck } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { User as AppUser, UserRole } from '@/src/types';

interface UserWithStats extends AppUser {
    uploads: number;
    downloads: number;
    isBanned?: boolean;
}

export function AdminUsers() {
    const { user } = useAuth();
    const db = getFirestore();

    const [allUsers, setAllUsers] = React.useState<UserWithStats[]>([]);
    const [filteredUsers, setFilteredUsers] = React.useState<UserWithStats[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [roleFilter, setRoleFilter] = React.useState<'all' | 'admin' | 'user'>('all');
    const [processingId, setProcessingId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (user?.role === UserRole.ADMIN) {
            fetchAllUsers();
        }
    }, [user?.role]);

    React.useEffect(() => {
        filterUsers();
    }, [allUsers, searchTerm, roleFilter]);

    const fetchAllUsers = async () => {
        try {
            setLoading(true);
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersRef);

            const users: UserWithStats[] = [];
            for (const doc of querySnapshot.docs) {
                const userData = doc.data();
                users.push({
                    id: doc.id,
                    google_id: userData.google_id || '',
                    username: userData.username || '',
                    email: userData.email || '',
                    role: userData.role || UserRole.USER,
                    created_at: userData.created_at || new Date().toISOString(),
                    profile_picture: userData.profile_picture,
                    displayName: userData.displayName,
                    uploads: userData.uploads || 0,
                    downloads: userData.downloads || 0,
                    isBanned: userData.isBanned || false,
                });
            }

            // Sort by creation date (newest first)
            users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setAllUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };
    

    const filterUsers = () => {
        let filtered = allUsers;

        // Filter by search term
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                u.username.toLowerCase().includes(search) ||
                u.email.toLowerCase().includes(search) ||
                u.displayName?.toLowerCase().includes(search)
            );
        }

        // Filter by role
        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        setFilteredUsers(filtered);
    };

    const handleToggleAdmin = async (userId: string, currentRole: UserRole) => {
        try {
            setProcessingId(userId);
            const newRole = currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;

            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { role: newRole });

            setAllUsers(prev =>
                prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
            );
        } catch (error) {
            console.error('Error toggling admin role:', error);
            alert('Failed to update user role');
        } finally {
            setProcessingId(null);
        }
    };

    const handleBanUser = async (userId: string) => {
        if (!confirm('Are you sure you want to ban this user?')) return;

        try {
            setProcessingId(userId);
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                isBanned: true,
                bannedAt: new Date().toISOString(),
            });

            setAllUsers(prev =>
                prev.map(u => u.id === userId ? { ...u, isBanned: true } : u)
            );
        } catch (error) {
            console.error('Error banning user:', error);
            alert('Failed to ban user');
        } finally {
            setProcessingId(null);
        }
    };

    const handleUnbanUser = async (userId: string) => {
        try {
            setProcessingId(userId);
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                isBanned: false,
            });

            setAllUsers(prev =>
                prev.map(u => u.id === userId ? { ...u, isBanned: false } : u)
            );
        } catch (error) {
            console.error('Error unbanning user:', error);
            alert('Failed to unban user');
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
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Manage users and assign admin roles ({allUsers.length} total)
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <Users className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 uppercase">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{allUsers.length}</p>
                </Card>

                <Card className="p-4 bg-purple-50 border-purple-200">
                    <Shield className="h-5 w-5 text-purple-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 uppercase">Admins</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {allUsers.filter(u => u.role === UserRole.ADMIN).length}
                    </p>
                </Card>

                <Card className="p-4 bg-green-50 border-green-200">
                    <UserCheck className="h-5 w-5 text-green-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 uppercase">Regular Users</p>
                    <p className="text-2xl font-bold text-green-600">
                        {allUsers.filter(u => u.role === UserRole.USER).length}
                    </p>
                </Card>

                <Card className="p-4 bg-red-50 border-red-200">
                    <Ban className="h-5 w-5 text-red-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 uppercase">Banned Users</p>
                    <p className="text-2xl font-bold text-red-600">
                        {allUsers.filter(u => u.isBanned).length}
                    </p>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Search className="h-4 w-4 inline mr-1" />
                            Search Users
                        </label>
                        <Input
                            placeholder="Search by name, email, or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Role</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Users</option>
                            <option value="admin">Admins Only</option>
                            <option value="user">Regular Users</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Users Table */}
            {loading ? (
                <Card className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading users...</p>
                </Card>
            ) : filteredUsers.length === 0 ? (
                <Card className="p-8 text-center">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No users found</p>
                </Card>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">User</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Joined</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((appUser) => (
                                <tr key={appUser.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {appUser.profile_picture ? (
                                                <img src={appUser.profile_picture} alt={appUser.username} className="h-8 w-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                                    {appUser.username.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-slate-900">{appUser.username}</p>
                                                <p className="text-xs text-slate-500">{appUser.displayName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{appUser.email}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={appUser.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}>
                                            {appUser.role}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={appUser.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                            {appUser.isBanned ? 'Banned' : 'Active'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {new Date(appUser.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleAdmin(appUser.id, appUser.role)}
                                                disabled={processingId === appUser.id || appUser.isBanned}
                                                title={appUser.role === UserRole.ADMIN ? 'Demote to User' : 'Promote to Admin'}
                                            >
                                                <Shield className="h-4 w-4" />
                                            </Button>
                                            {appUser.isBanned ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleUnbanUser(appUser.id)}
                                                    disabled={processingId === appUser.id}
                                                    className="text-green-600"
                                                >
                                                    <UserCheck className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleBanUser(appUser.id)}
                                                    disabled={processingId === appUser.id}
                                                    className="text-red-600"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

import * as React from 'react';
import { Mail, User, Calendar, Shield, LogOut, Check, RotateCcw, Phone, Key } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, updateDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { UserRole } from '@/src/types';
import { MaterialStatus } from '@/src/types';

// DiceBear avatar styles
const AVATAR_STYLES = [
    { id: 'avataaars', label: 'Avataaars' },
    { id: 'lorelei', label: 'Lorelei' },
    { id: 'bottts', label: 'Bottts' },
    { id: 'notionists', label: 'Notionists' },
    { id: 'micah', label: 'Micah' },
    { id: 'pixel-art', label: 'Pixel Art' },
    { id: 'adventurer', label: 'Adventurer' },
    { id: 'big-ears', label: 'Big Ears' },
];

// Generate DiceBear avatar URL
const generateAvatarUrl = (style: string, seed: string) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&scale=80`;
};

export function AdminProfile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const db = getFirestore();

    const [isEditing, setIsEditing] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(user?.profile_picture);
    const [selectedAvatarStyle, setSelectedAvatarStyle] = React.useState<string>('avataaars');
    const [avatarSeed, setAvatarSeed] = React.useState<string>(user?.username || 'default');
    const [previewAvatarUrl, setPreviewAvatarUrl] = React.useState<string>('');
    const [formData, setFormData] = React.useState({
        username: user?.username || '',
        displayName: user?.displayName || '',
        bio: '',
        phone: '',
    });
    const [adminStats, setAdminStats] = React.useState({
        totalUsers: 0,
        totalResources: 0,
        pendingApprovals: 0,
    });

    React.useEffect(() => {
        if (user?.id) {
            fetchAdminData();
        }
    }, [user?.id]);

    const fetchAdminData = async () => {
        try {
            if (!user?.id) return;

            const userRef = doc(db, 'users', user.id);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                setFormData(prev => ({
                    ...prev,
                    username: data.username || prev.username,
                    displayName: data.displayName || prev.displayName,
                    bio: data.bio || '',
                    phone: data.phone || '',
                }));
                // Set avatar from database
                if (data.profile_picture) {
                    setAvatarUrl(data.profile_picture);
                }
                if (data.avatarStyle) {
                    setSelectedAvatarStyle(data.avatarStyle);
                }
                if (data.avatarSeed) {
                    setAvatarSeed(data.avatarSeed);
                }
            }

            // Fetch real statistics from collections
            try {
                // Count total users
                const usersRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersRef);
                const totalUsers = usersSnapshot.size;

                // Count total approved resources (materials)
                const materialsRef = collection(db, 'materials');
                const approvedQuery = query(
                    materialsRef,
                    where('status', '==', MaterialStatus.APPROVED)
                );
                const approvedSnapshot = await getDocs(approvedQuery);
                const totalResources = approvedSnapshot.size;

                // Count pending approvals
                const pendingQuery = query(
                    materialsRef,
                    where('status', '==', MaterialStatus.PENDING)
                );
                const pendingSnapshot = await getDocs(pendingQuery);
                const pendingApprovals = pendingSnapshot.size;

                setAdminStats({
                    totalUsers,
                    totalResources,
                    pendingApprovals,
                });
            } catch (statsError) {
                console.warn('Error fetching statistics:', statsError);
                // Stats will remain with default values
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveChanges = async () => {
        try {
            setLoading(true);
            if (!user?.id) return;

            const userRef = doc(db, 'users', user.id);
            const updateData: any = {
                username: formData.username,
                displayName: formData.displayName,
                bio: formData.bio,
                phone: formData.phone,
                updated_at: new Date().toISOString(),
            };

            // Update avatar if style selected
            if (selectedAvatarStyle) {
                const newAvatarUrl = generateAvatarUrl(selectedAvatarStyle, avatarSeed);
                updateData.profile_picture = newAvatarUrl;
                updateData.avatarStyle = selectedAvatarStyle;
                updateData.avatarSeed = avatarSeed;
                setAvatarUrl(newAvatarUrl);
            }

            await updateDoc(userRef, updateData);
            console.log('✅ Admin profile updated successfully');

            setIsEditing(false);
            // Refresh data
            await fetchAdminData();
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user || user.role !== UserRole.ADMIN) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Access denied. Admin role required.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Profile Header */}
            <Card className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={user.username}
                                className="h-16 sm:h-20 w-16 sm:w-20 rounded-full object-cover flex-shrink-0 border-2 border-indigo-200"
                            />
                        ) : (
                            <div className="h-16 sm:h-20 w-16 sm:w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <Shield className="h-8 sm:h-10 w-8 sm:w-10 text-white" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">{formData.displayName || user.username}</h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">@{user.username}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Shield className="h-4 w-4 text-indigo-600" />
                                <span className="text-xs sm:text-sm font-semibold text-indigo-600 uppercase">Admin Account</span>
                            </div>
                            {formData.bio && (
                                <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2">{formData.bio}</p>
                            )}
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="w-full sm:w-auto text-xs sm:text-sm flex-shrink-0">
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                </div>
            </Card>

            {/* Admin Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-600">Total Users</p>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">{adminStats.totalUsers}</p>
                    </div>
                </Card>
                <Card className="p-4 bg-green-50 border-green-200">
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-600">Total Resources</p>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{adminStats.totalResources}</p>
                    </div>
                </Card>
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
                        <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-2">{adminStats.pendingApprovals}</p>
                    </div>
                </Card>
            </div>

            {/* Profile Information */}
            <Card className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6">Profile Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Email */}
                    <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</p>
                            <p className="text-sm font-medium text-slate-900 break-all mt-1">{user.email}</p>
                        </div>
                    </div>

                    {/* Display Name */}
                    {formData.displayName && (
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Display Name</p>
                                <p className="text-sm font-medium text-slate-900 break-all mt-1">{formData.displayName}</p>
                            </div>
                        </div>
                    )}

                    {/* Phone */}
                    {formData.phone && (
                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Phone</p>
                                <p className="text-sm font-medium text-slate-900 break-all mt-1">{formData.phone}</p>
                            </div>
                        </div>
                    )}

                    {/* Member Since */}
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Member Since</p>
                            <p className="text-sm font-medium text-slate-900 mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Edit Profile Form */}
            {isEditing && (
                <Card className="p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Edit Admin Profile</h2>
                    <div className="space-y-3 sm:space-y-4">
                        {/* Avatar Selection */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-3 sm:mb-4">Choose Avatar Style</label>

                            {/* Avatar Preview */}
                            {previewAvatarUrl && (
                                <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-center">
                                    <img
                                        src={previewAvatarUrl}
                                        alt="Avatar preview"
                                        className="h-24 w-24 rounded-full object-cover border-2 border-indigo-300"
                                    />
                                </div>
                            )}

                            {/* Style Selection Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                                {AVATAR_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => {
                                            setSelectedAvatarStyle(style.id);
                                            const url = generateAvatarUrl(style.id, avatarSeed);
                                            setPreviewAvatarUrl(url);
                                        }}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${selectedAvatarStyle === style.id
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-slate-200 bg-white hover:border-indigo-300'
                                            }`}
                                        title={style.label}
                                    >
                                        <div className="relative">
                                            <img
                                                src={generateAvatarUrl(style.id, avatarSeed)}
                                                alt={style.label}
                                                className="h-20 w-20 rounded-full object-cover"
                                            />
                                            {selectedAvatarStyle === style.id && (
                                                <div className="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-1 border-2 border-white">
                                                    <Check className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[11px] sm:text-xs font-medium text-slate-700 text-center">{style.label}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Randomize Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    const randomSeed = Math.random().toString(36).substring(2, 15);
                                    setAvatarSeed(randomSeed);
                                    const url = generateAvatarUrl(selectedAvatarStyle, randomSeed);
                                    setPreviewAvatarUrl(url);
                                }}
                                className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-4"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Randomize Avatar
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Username</label>
                            <Input
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Your username"
                                className="text-xs sm:text-sm"
                                disabled
                            />
                            <p className="text-xs text-slate-500 mt-1">Username cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Display Name</label>
                            <Input
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleInputChange}
                                placeholder="Your display name"
                                className="text-xs sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Phone</label>
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Your phone number"
                                className="text-xs sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Tell us about yourself"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                                rows={4}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                            <Button
                                onClick={handleSaveChanges}
                                disabled={loading}
                                className="flex-1 text-xs sm:text-sm"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Security Section */}
            <Card className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Key className="h-5 w-5 text-indigo-600" />
                    Security
                </h2>
                <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start text-left">
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left">
                        <Shield className="h-4 w-4 mr-2" />
                        View Login History
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left">
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Sessions
                    </Button>
                </div>
            </Card>

            {/* Logout Button */}
            <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </div>
    );
}

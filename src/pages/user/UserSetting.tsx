import * as React from 'react';
import { Settings, Bell, Shield, Trash2, AlertCircle, LogOut } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useAuth } from '@/src/context/AuthContext';
import {
    getFirestore,
    doc,
    updateDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    writeBatch
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface UserSettings {
    notificationsEmail: boolean;
    notificationsApproval: boolean;
    notificationsDownloads: boolean;
    privateProfile: boolean;
}

export function UserSetting() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const db = getFirestore();

    const [settings, setSettings] = React.useState<UserSettings>({
        notificationsEmail: true,
        notificationsApproval: true,
        notificationsDownloads: true,
        privateProfile: false,
    });

    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

    React.useEffect(() => {
        if (user?.id) {
            fetchSettings();
        }
    }, [user?.id]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            if (!user?.id) return;

            const userRef = doc(db, 'users', user.id);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                setSettings({
                    notificationsEmail: userData.notificationsEmail ?? true,
                    notificationsApproval: userData.notificationsApproval ?? true,
                    notificationsDownloads: userData.notificationsDownloads ?? true,
                    privateProfile: userData.privateProfile ?? false,
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSetting = (key: keyof UserSettings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            if (!user?.id) return;

            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, settings);

            setMessage({ type: 'success', text: 'Settings saved successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        try {
            setSaving(true);
            if (!user?.id) return;

            const userId = user.id;
            const userEmail = user.email;

            // Use batch writes for atomic operations
            const batch = writeBatch(db);

            // 1. Get all materials uploaded by this user and delete them
            const materialsRef = collection(db, 'materials');
            const materialsQuery = query(
                materialsRef,
                where('uploader_id', '==', userId)
            );
            const materialsSnapshot = await getDocs(materialsQuery);

            // If no materials found by ID, try by email (fallback)
            let materialsToDelete = materialsSnapshot.docs;
            if (materialsToDelete.length === 0 && userEmail) {
                const materialsQueryByEmail = query(
                    materialsRef,
                    where('uploader_email', '==', userEmail)
                );
                materialsToDelete = (await getDocs(materialsQueryByEmail)).docs;
            }

            // Delete all materials and their related data
            for (const materialDoc of materialsToDelete) {
                const materialId = materialDoc.id;

                // Delete material comments
                const commentsRef = collection(db, `materials/${materialId}/comments`);
                const commentsSnapshot = await getDocs(commentsRef);
                commentsSnapshot.forEach(commentDoc => {
                    batch.delete(commentDoc.ref);
                });

                // Delete material views
                const viewsRef = collection(db, 'material_views');
                const viewsQuery = query(viewsRef, where('materialId', '==', materialId));
                const viewsSnapshot = await getDocs(viewsQuery);
                viewsSnapshot.forEach(viewDoc => {
                    batch.delete(viewDoc.ref);
                });

                // Delete the material itself
                batch.delete(materialDoc.ref);
            }

            // 2. Delete all user comments
            const commentsRef = collection(db, 'comments');
            const userCommentsQuery = query(
                commentsRef,
                where('author_id', '==', userId)
            );
            const userCommentsSnapshot = await getDocs(userCommentsQuery);
            userCommentsSnapshot.forEach(commentDoc => {
                batch.delete(commentDoc.ref);
            });

            // 3. Delete all user custom resources
            const userResourcesRef = collection(db, 'user_resources');
            const userResourcesQuery = query(
                userResourcesRef,
                where('userId', '==', userId)
            );
            const userResourcesSnapshot = await getDocs(userResourcesQuery);
            userResourcesSnapshot.forEach(resourceDoc => {
                batch.delete(resourceDoc.ref);
            });

            // 4. Delete all user requests
            const requestsRef = collection(db, 'requests');
            const userRequestsQuery = query(
                requestsRef,
                where('userId', '==', userId)
            );
            const userRequestsSnapshot = await getDocs(userRequestsQuery);
            userRequestsSnapshot.forEach(requestDoc => {
                batch.delete(requestDoc.ref);
            });

            // 5. Delete material views for this user
            const userViewsRef = collection(db, 'material_views');
            const userViewsQuery = query(
                userViewsRef,
                where('userId', '==', userId)
            );
            const userViewsSnapshot = await getDocs(userViewsQuery);
            userViewsSnapshot.forEach(viewDoc => {
                batch.delete(viewDoc.ref);
            });

            // 6. Delete user settings/profile data
            const userRef = doc(db, 'users', userId);
            batch.delete(userRef);

            // Commit all deletions at once
            await batch.commit();

            // Logout user
            await logout();
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error deleting account:', error);
            setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
        } finally {
            setSaving(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error logging out:', error);
            setMessage({ type: 'error', text: 'Failed to logout' });
        }
    };

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Please log in to access settings</p>
            </div>
        );
    }

    if (loading) {
        return (
            <Card className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-slate-500">Loading settings...</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage your account preferences and notifications</p>
            </div>

            {/* Message */}
            {message && (
                <Card className={`p-3 sm:p-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className={`text-xs sm:text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                        {message.text}
                    </p>
                </Card>
            )}

            {/* Notification Settings */}
            <Card className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                    <span>Notifications</span>
                </h2>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-slate-900">Email Notifications</p>
                            <p className="text-xs sm:text-sm text-slate-600">Receive email updates about your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-2 flex-shrink-0">
                            <input
                                type="checkbox"
                                checked={settings.notificationsEmail}
                                onChange={() => handleToggleSetting('notificationsEmail')}
                                className="sr-only peer"
                            />
                            <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-slate-900">Resource Approvals</p>
                            <p className="text-xs sm:text-sm text-slate-600">Get notified when your uploads are approved</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-2 flex-shrink-0">
                            <input
                                type="checkbox"
                                checked={settings.notificationsApproval}
                                onChange={() => handleToggleSetting('notificationsApproval')}
                                className="sr-only peer"
                            />
                            <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-slate-900">Resource Downloads</p>
                            <p className="text-xs sm:text-sm text-slate-600">Get notified when your resources are downloaded</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-2 flex-shrink-0">
                            <input
                                type="checkbox"
                                checked={settings.notificationsDownloads}
                                onChange={() => handleToggleSetting('notificationsDownloads')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Privacy Settings */}
            <Card className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                    <span>Privacy & Security</span>
                </h2>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-slate-900">Private Profile</p>
                            <p className="text-xs sm:text-sm text-slate-600">Hide your profile from other users</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-2 flex-shrink-0">
                            <input
                                type="checkbox"
                                checked={settings.privateProfile}
                                onChange={() => handleToggleSetting('privateProfile')}
                                className="sr-only peer"
                            />
                            <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Account Actions */}
            <Card className="p-4 sm:p-6 border-red-200 bg-red-50">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <span>Danger Zone</span>
                </h2>

                {showDeleteConfirm && (
                    <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-red-900 font-medium mb-2 text-sm sm:text-base">
                            ⚠️ Are you sure you want to delete your account?
                        </p>
                        <p className="text-red-800 text-xs sm:text-sm mb-3">
                            This action cannot be undone. All your data and uploads will be permanently deleted.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                onClick={handleDeleteAccount}
                                disabled={saving}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
                            >
                                {saving ? 'Deleting...' : 'Delete Account'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="text-xs sm:text-sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {!showDeleteConfirm && (
                    <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto text-xs sm:text-sm"
                    >
                        <Trash2 className="mr-2 h-4 w-4 flex-shrink-0" />
                        Delete My Account
                    </Button>
                )}
            </Card>

            {/* Save Settings Button */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex-1 text-xs sm:text-sm"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
                <Button
                    variant="outline"
                    onClick={() => fetchSettings()}
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                    Reset
                </Button>
            </div>
        </div>
    );
}

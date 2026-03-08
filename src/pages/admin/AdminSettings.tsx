import * as React from 'react';
import { Settings, Bell, Shield, Database, AlertTriangle, Save, Mail, Users, FileText, Clock, HardDrive, Lock, Eye } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/context/AuthContext';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { UserRole } from '@/src/types';

interface AdminSettings {
    // General
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;

    // Upload Settings
    autoApproveResources: boolean;
    maxFileSize: number;
    approvalWaitTime: number;
    allowedFileTypes: string[];

    // User Settings
    requireEmailVerification: boolean;
    enableUserRegistration: boolean;
    defaultUserRole: string;
    autoSuspendAfterReports: number;

    // Security
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;

    // Notifications
    enableEmailNotifications: boolean;
    enableResourceApprovalNotifs: boolean;
    enableUserReportNotifs: boolean;
    notificationEmail: string;

    // Database
    enableAutoBackup: boolean;
    backupFrequency: string;
    retentionDays: number;
}

export function AdminSettings() {
    const { user } = useAuth();
    const db = getFirestore();

    const [settings, setSettings] = React.useState<AdminSettings>({
        // General
        siteName: 'Eduflow',
        siteDescription: 'Educational Resource Sharing Platform',
        supportEmail: 'support@eduflow.com',
        maintenanceMode: false,
        maintenanceMessage: 'Platform under maintenance. Please try again later.',

        // Upload Settings
        autoApproveResources: false,
        maxFileSize: 50,
        approvalWaitTime: 48,
        allowedFileTypes: ['pdf', 'docx', 'pptx', 'xlsx', 'txt', 'jpg', 'png'],

        // User Settings
        requireEmailVerification: true,
        enableUserRegistration: true,
        defaultUserRole: 'user',
        autoSuspendAfterReports: 5,

        // Security
        enableTwoFactor: false,
        sessionTimeout: 1440,
        maxLoginAttempts: 5,

        // Notifications
        enableEmailNotifications: true,
        enableResourceApprovalNotifs: true,
        enableUserReportNotifs: true,
        notificationEmail: 'admin@eduflow.com',

        // Database
        enableAutoBackup: true,
        backupFrequency: 'daily',
        retentionDays: 90,
    });

    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

    React.useEffect(() => {
        if (user?.role === UserRole.ADMIN) {
            fetchSettings();
        }
    }, [user?.role]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            // Fetch from admin settings document
            const settingsRef = doc(db, 'admin', 'settings');
            const settingsDoc = await getDoc(settingsRef);

            if (settingsDoc.exists()) {
                setSettings(settingsDoc.data() as AdminSettings);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target;
        const name = target.name;
        const type = (target as HTMLInputElement).type;
        const value = (target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
        const checked = (target as HTMLInputElement).checked;

        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
        }));
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            const settingsRef = doc(db, 'admin', 'settings');
            await updateDoc(settingsRef, settings);

            setMessage({ type: 'success', text: 'Settings saved successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    if (user?.role !== UserRole.ADMIN) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">Access denied. Admin role required.</p>
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
        <div className="max-w-4xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                <p className="text-sm text-slate-500 mt-1">Configure platform-wide settings and preferences</p>
            </div>

            {/* Message */}
            {message && (
                <Card className={`p-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className={`font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                        {message.text}
                    </p>
                </Card>
            )}

            {/* General Settings */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-600" />
                    General Settings
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Site Name</label>
                        <Input
                            name="siteName"
                            value={settings.siteName}
                            onChange={handleInputChange}
                            placeholder="Your platform name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Site Description</label>
                        <textarea
                            name="siteDescription"
                            value={settings.siteDescription}
                            onChange={handleInputChange}
                            placeholder="Brief description of your platform"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Support Email</label>
                        <Input
                            type="email"
                            name="supportEmail"
                            value={settings.supportEmail}
                            onChange={handleInputChange}
                            placeholder="support@eduflow.com"
                        />
                    </div>
                </div>
            </Card>

            {/* Upload Settings */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Upload Settings
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Max File Size (MB)</label>
                        <Input
                            type="number"
                            name="maxFileSize"
                            value={settings.maxFileSize}
                            onChange={handleInputChange}
                            min="1"
                            max="500"
                        />
                        <p className="text-xs text-slate-500 mt-1">Maximum file size users can upload</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Approval Wait Time (hours)</label>
                        <Input
                            type="number"
                            name="approvalWaitTime"
                            value={settings.approvalWaitTime}
                            onChange={handleInputChange}
                            min="1"
                            max="168"
                        />
                        <p className="text-xs text-slate-500 mt-1">Expected time for resource approval</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">Auto-Approve Resources</p>
                            <p className="text-sm text-slate-600">Automatically approve uploaded resources</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="autoApproveResources"
                                checked={settings.autoApproveResources}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* User Management Settings */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    User Management
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">Email Verification Required</p>
                            <p className="text-sm text-slate-600">Require users to verify email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="requireEmailVerification"
                                checked={settings.requireEmailVerification}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">Enable User Registration</p>
                            <p className="text-sm text-slate-600">Allow new users to register</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="enableUserRegistration"
                                checked={settings.enableUserRegistration}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Auto-Suspend After Reports (count)</label>
                        <Input
                            type="number"
                            name="autoSuspendAfterReports"
                            value={settings.autoSuspendAfterReports}
                            onChange={handleInputChange}
                            min="1"
                            max="20"
                        />
                        <p className="text-xs text-slate-500 mt-1">Auto-suspend user after N reports</p>
                    </div>
                </div>
            </Card>

            {/* Security Settings */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-indigo-600" />
                    Security Settings
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                            <p className="text-sm text-slate-600">Require 2FA for admin accounts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="enableTwoFactor"
                                checked={settings.enableTwoFactor}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                        <Input
                            type="number"
                            name="sessionTimeout"
                            value={settings.sessionTimeout}
                            onChange={handleInputChange}
                            min="5"
                            max="10080"
                        />
                        <p className="text-xs text-slate-500 mt-1">Auto-logout users after inactivity</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Max Login Attempts</label>
                        <Input
                            type="number"
                            name="maxLoginAttempts"
                            value={settings.maxLoginAttempts}
                            onChange={handleInputChange}
                            min="1"
                            max="20"
                        />
                        <p className="text-xs text-slate-500 mt-1">Lock account after failed attempts</p>
                    </div>
                </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-indigo-600" />
                    Notification Settings
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Admin Notification Email</label>
                        <Input
                            type="email"
                            name="notificationEmail"
                            value={settings.notificationEmail}
                            onChange={handleInputChange}
                            placeholder="admin@eduflow.com"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">Email Notifications</p>
                            <p className="text-sm text-slate-600">Send email notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="enableEmailNotifications"
                                checked={settings.enableEmailNotifications}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">Resource Approval Notifications</p>
                            <p className="text-sm text-slate-600">Notify on resource approvals</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="enableResourceApprovalNotifs"
                                checked={settings.enableResourceApprovalNotifs}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">User Report Notifications</p>
                            <p className="text-sm text-slate-600">Notify on user reports</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="enableUserReportNotifs"
                                checked={settings.enableUserReportNotifs}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Maintenance Mode */}
            <Card className="p-6 border-yellow-200 bg-yellow-50">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Maintenance Mode
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-200">
                        <div>
                            <p className="font-medium text-slate-900">Enable Maintenance Mode</p>
                            <p className="text-sm text-slate-600">Put platform in maintenance (users can't access)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Maintenance Message</label>
                        <textarea
                            name="maintenanceMessage"
                            value={settings.maintenanceMessage}
                            onChange={handleInputChange}
                            placeholder="Message shown to users during maintenance"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                        />
                    </div>
                </div>
            </Card>

            {/* Database Management */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5 text-indigo-600" />
                    Database Management
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900">Enable Auto Backup</p>
                            <p className="text-sm text-slate-600">Automatically backup database</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="enableAutoBackup"
                                checked={settings.enableAutoBackup}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Backup Frequency</label>
                        <select
                            name="backupFrequency"
                            value={settings.backupFrequency}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Backup Retention (days)</label>
                        <Input
                            type="number"
                            name="retentionDays"
                            value={settings.retentionDays}
                            onChange={handleInputChange}
                            min="7"
                            max="365"
                        />
                        <p className="text-xs text-slate-500 mt-1">How long to keep backup files</p>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                        <Button variant="outline" className="w-full justify-start text-left">
                            <HardDrive className="h-4 w-4 mr-2" />
                            Manual Backup Now
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-left">
                            <Database className="h-4 w-4 mr-2" />
                            Restore from Backup
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-left">
                            <Eye className="h-4 w-4 mr-2" />
                            View Backup History
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex gap-3">
                <Button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex-1"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save All Settings'}
                </Button>
                <Button
                    variant="outline"
                    onClick={fetchSettings}
                >
                    Reset to Saved
                </Button>
            </div>
        </div>
    );
}

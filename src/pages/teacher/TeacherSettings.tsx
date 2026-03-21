import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Lock, Bell, Shield } from 'lucide-react';

export function TeacherSettings() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500">Manage your account preferences and security settings</p>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Settings
                    </CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                            <h3 className="font-medium text-slate-900">Change Password</h3>
                            <p className="text-sm text-slate-500">Update your password regularly to keep your account secure</p>
                        </div>
                        <Button variant="outline">Change</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                            <h3 className="font-medium text-slate-900">Two-Factor Authentication</h3>
                            <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                        </div>
                        <Badge variant="secondary">Not Enabled</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>Control how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <div>
                            <p className="font-medium text-slate-900">Student Activity</p>
                            <p className="text-sm text-slate-500">Get notified when students access your materials</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <div>
                            <p className="font-medium text-slate-900">Material Approvals</p>
                            <p className="text-sm text-slate-500">Get notified when your materials are approved/rejected</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <div>
                            <p className="font-medium text-slate-900">System Updates</p>
                            <p className="text-sm text-slate-500">Receive important system and feature updates</p>
                        </div>
                    </label>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700">
                        Delete Account
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

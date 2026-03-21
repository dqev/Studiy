import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { useAuth } from '@/src/context/AuthContext';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Save } from 'lucide-react';
import { useState } from 'react';

export function TeacherProfile() {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [bio, setBio] = useState('');

    const handleSave = () => {
        // Profile save logic here
        console.log('Saving profile...');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
                <p className="text-slate-500">Manage your teacher profile and information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your profile details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                                <Input type="text" value={user?.username || ''} disabled />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                <Input type="email" value={user?.email || ''} disabled />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
                                <Input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your display name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={4}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell students about yourself..."
                                />
                            </div>
                            <Button onClick={handleSave} className="w-full">
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <img
                                src={user?.profile_picture || 'favicon/favicon.svg'}
                                alt={user?.username}
                                className="w-full h-40 rounded-lg object-cover"
                            />
                            <Button variant="outline" className="w-full">
                                Change Picture
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

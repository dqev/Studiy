import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Bell } from 'lucide-react';

export function TeacherNotifications() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                <p className="text-slate-500">Stay updated with activity notifications</p>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Notification Center</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No new notifications</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

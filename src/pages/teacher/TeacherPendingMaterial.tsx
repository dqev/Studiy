import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { Clock } from 'lucide-react';

export function TeacherPendingMaterial() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pending Approvals</h1>
                <p className="text-slate-500">Materials awaiting admin approval</p>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Pending Materials</CardTitle>
                    <CardDescription>Your materials under review</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">All your materials have been approved</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

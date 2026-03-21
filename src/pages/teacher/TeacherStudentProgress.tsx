import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { BarChart3 } from 'lucide-react';

export function TeacherStudentProgress() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Student Progress</h1>
                <p className="text-slate-500">Track and analyze your student learning progress</p>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Progress Analytics</CardTitle>
                    <CardDescription>Student engagement and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Progress data will appear once students start accessing your materials</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

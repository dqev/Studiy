import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Users, Plus } from 'lucide-react';

export function TeacherMyClasses() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Classes</h1>
                    <p className="text-slate-500">Manage your classes and student enrollment</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Class
                </Button>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Classes (0)</CardTitle>
                    <CardDescription>You haven't created any classes yet</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 mb-4">Create a class to start organizing your students</p>
                        <Button>Create Your First Class</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

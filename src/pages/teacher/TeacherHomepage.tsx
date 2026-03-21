import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Notebook, Users, BarChart3, Upload, ArrowRight } from 'lucide-react';

export function TeacherHomepage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username}!</h1>
                <p className="text-indigo-100 mb-6">Manage your courses, track student progress, and create engaging learning materials.</p>
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={() => navigate('/teacher/upload')}
                        className="bg-white text-indigo-600 hover:bg-indigo-50"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Material
                    </Button>
                    <Button
                        onClick={() => navigate('/teacher/my-classes')}
                        variant="outline"
                        className="border-white text-white hover:bg-indigo-700"
                    >
                        View My Classes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/teacher/materials')}>
                    <CardContent className="p-6 text-center">
                        <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Notebook className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">Course Materials</h3>
                        <p className="text-sm text-slate-500">Create and manage your course materials and resources</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/teacher/student-progress')}>
                    <CardContent className="p-6 text-center">
                        <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">Student Progress</h3>
                        <p className="text-sm text-slate-500">Track and analyze your student learning progress</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/teacher/my-classes')}>
                    <CardContent className="p-6 text-center">
                        <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Users className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">My Classes</h3>
                        <p className="text-sm text-slate-500">Manage your classes and engage with students</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">1</div>
                        <div>
                            <h3 className="font-medium text-slate-900">Create Your First Course</h3>
                            <p className="text-sm text-slate-500 mt-1">Upload your first course material to get started</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">2</div>
                        <div>
                            <h3 className="font-medium text-slate-900">Organize Your Classes</h3>
                            <p className="text-sm text-slate-500 mt-1">Categorize your materials and organize classes</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">3</div>
                        <div>
                            <h3 className="font-medium text-slate-900">Track Student Progress</h3>
                            <p className="text-sm text-slate-500 mt-1">Monitor how your students are engaging with materials</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

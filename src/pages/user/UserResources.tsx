import * as React from 'react';
import { Trash2, Eye, Download, ExternalLink, BookOpen, Notebook, Upload, User as UserIcon } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { getMaterialsByUploader, getMaterialsByUploaderEmail } from '@/src/firebase/materials';
import { getFirestore, doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Material, MaterialStatus } from '@/src/types';
import { rawData } from '@/src/firebase/data';

export function UserResources() {
    const { user } = useAuth();
    const db = getFirestore();

    // Semester & Subject selection state
    const [selectedSemester, setSelectedSemester] = React.useState<string>('');
    const [selectedSubject, setSelectedSubject] = React.useState<string>('');

    // Custom user resources state
    const [customResources, setCustomResources] = React.useState<Material[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [deletingId, setDeletingId] = React.useState<string | null>(null);

    // Fetch custom resources on mount or when user changes
    React.useEffect(() => {
        if (user?.id || user?.email) {
            fetchUserResources();
        }
    }, [user?.id, user?.email]);

    const fetchUserResources = async () => {
        try {
            setLoading(true);
            let materials: Material[] = [];

            // Try fetching by user ID first
            if (user?.id) {
                materials = await getMaterialsByUploader(user.id);
            }

            // If no materials found, try by email
            if (materials.length === 0 && user?.email) {
                materials = await getMaterialsByUploaderEmail(user.email);
            }

            setCustomResources(materials);
        } catch (error) {
            // Silently handle error
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResource = async (resourceId: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;

        try {
            setDeletingId(resourceId);
            const materialRef = doc(db, 'materials', resourceId);
            await deleteDoc(materialRef);

            setCustomResources(prev => prev.filter(r => r.id !== resourceId));
        } catch (error) {
            // Silently handle error
            alert('Failed to delete resource');
        } finally {
            setDeletingId(null);
        }
    };

    // Get available semesters
    const semesters = React.useMemo(() => {
        return Object.keys(rawData.home || {});
    }, []);

    // Get subjects for selected semester
    const subjects = React.useMemo(() => {
        if (!selectedSemester) return [];
        const semesterData = (rawData.home as any)?.[selectedSemester];
        return semesterData ? Object.keys(semesterData) : [];
    }, [selectedSemester]);

    // Get default resources for selected subject
    const defaultResources = React.useMemo(() => {
        if (!selectedSemester || !selectedSubject) return {};
        const semesterData = (rawData.home as any)?.[selectedSemester];
        const subjectData = semesterData?.[selectedSubject];

        // Filter out metadata (credits, subjectcode)
        const resources: Record<string, Record<string, any>> = {};
        if (subjectData) {
            Object.entries(subjectData).forEach(([key, value]) => {
                if (key !== 'credits' && key !== 'subjectcode' && typeof value === 'object') {
                    resources[key] = value as Record<string, any>;
                }
            });
        }

        return resources;
    }, [selectedSemester, selectedSubject]);

    // Organize default resources for display
    const organizedDefaultResources = React.useMemo(() => {
        const organized: Record<string, Array<{ title: string; url: string }>> = {};

        Object.entries(defaultResources).forEach(([type, items]) => {
            if (!organized[type]) organized[type] = [];

            Object.entries(items as Record<string, any>).forEach(([title, value]) => {
                if (typeof value === 'string') {
                    organized[type].push({ title, url: value });
                } else if (typeof value === 'object') {
                    Object.entries(value).forEach(([itemTitle, itemUrl]) => {
                        organized[type].push({
                            title: `${title} - ${itemTitle}`,
                            url: itemUrl as string,
                        });
                    });
                }
            });
        });

        return organized;
    }, [defaultResources]);

    // Filter custom resources based on search
    const filteredCustomResources = React.useMemo(() => {
        if (!searchTerm.trim()) return customResources;

        const search = searchTerm.toLowerCase();
        return customResources.filter(resource =>
            resource.title.toLowerCase().includes(search) ||
            resource.description.toLowerCase().includes(search) ||
            resource.category.toLowerCase().includes(search)
        );
    }, [customResources, searchTerm]);

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Please log in to view resources</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-slate-900">Resources Library</h1>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Browse course materials and your uploaded resources</p>
                </div>
                <Button onClick={() => window.location.href = '/user/upload'}>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload
                </Button>
            </div>

            {/* Semester & Subject Selection */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Semester</label>
                        <select
                            value={selectedSemester}
                            onChange={(e) => {
                                setSelectedSemester(e.target.value);
                                setSelectedSubject(''); // Reset subject when semester changes
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Choose a semester...</option>
                            {semesters.map(sem => (
                                <option key={sem} value={sem}>{sem.charAt(0).toUpperCase() + sem.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Subject</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={!selectedSemester}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                        >
                            <option value="">Choose a subject...</option>
                            {subjects.map(subj => (
                                <option key={subj} value={subj}>{subj}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Default Course Materials */}
            {selectedSemester && selectedSubject && (
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Course Materials</h2>
                        {Object.keys(organizedDefaultResources).length === 0 ? (
                            <Card className="p-6 text-center text-slate-500">
                                No materials available for this subject
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(organizedDefaultResources).map(([type, items]) => (
                                    <div key={type}>
                                        <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase">{type}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {(items as Array<{ title: string; url: string }>).map((resource, idx) => (
                                                <a
                                                    key={idx}
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                                >
                                                    <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                    <span className="text-sm text-slate-700 truncate">{resource.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Your Uploaded Resources */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">

                        <h2 className="text-lg font-bold text-slate-900">Pending/Uploaded</h2>
                    </div>
                    <Badge variant="secondary">{customResources.length} uploaded</Badge>
                </div>

                {/* Search Filter */}
                <div>
                    <Input
                        placeholder="Search your resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                    />
                </div>

                {/* Resources List */}
                {loading ? (
                    <Card className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-slate-500">Loading your resources...</p>
                    </Card>
                ) : customResources.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-slate-500 mb-4">You haven't uploaded any resources yet</p>
                        <Button onClick={() => window.location.href = '/user/upload'}>
                            Upload Your First Resource
                        </Button>
                    </Card>
                ) : filteredCustomResources.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-slate-500">No resources match your search</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredCustomResources.map((resource) => (
                            <Card key={resource.id} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex flex-col gap-3">
                                    {/* Header with title and status */}
                                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between xs:gap-2 gap-1">
                                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                                            {resource.title}
                                        </h3>
                                        <Badge className={`inline-flex w-fit ${resource.status === MaterialStatus.APPROVED ? 'bg-green-100 text-green-800' :
                                            resource.status === MaterialStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {resource.status}
                                        </Badge>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                                        {resource.description}
                                    </p>

                                    {/* User Profile Section */}
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            {user?.profile_picture ? (
                                                <img
                                                    src={user.profile_picture}
                                                    alt={user.username}
                                                    className="h-10 w-10 rounded-full object-cover border-1 border-slate-200"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                                <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                                                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                                                    {user?.username || 'Unknown'}
                                                </p>
                                            </div>
                                            {user?.displayName && (
                                                <p className="text-xs text-slate-600 truncate">{user.displayName}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metadata and actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500">
                                            <span className="inline-flex items-center gap-1">
                                                <span className="font-medium">{resource.category}</span>
                                            </span>
                                            <span className="text-[11px] sm:text-xs">Created {new Date(resource.created_at).toLocaleDateString()}</span>
                                            {resource.downloads !== undefined && (
                                                <span className="flex items-center gap-1">
                                                    <Download className="h-3 w-3" />
                                                    {resource.downloads}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(resource.file_url, '_blank')}
                                                title="View resource"
                                                className="h-8 w-8 p-0"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                                onClick={() => handleDeleteResource(resource.id)}
                                                disabled={deletingId === resource.id}
                                                title="Delete resource"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import * as React from 'react';
import { FileText, Search, Trash2, Eye, Star, Download, ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { getApprovedMaterials, rejectMaterial } from '@/src/firebase/materials';
import { Material, MaterialStatus, UserRole } from '@/src/types';
import { rawData } from '@/src/firebase/data';

interface MaterialWithEmail extends Material {
    uploader_email?: string;
}

export function AdminResources() {
    const { user } = useAuth();

    const [allMaterials, setAllMaterials] = React.useState<MaterialWithEmail[]>([]);
    const [filteredMaterials, setFilteredMaterials] = React.useState<MaterialWithEmail[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
    const [sortBy, setSortBy] = React.useState<'newest' | 'popular' | 'downloads'>('newest');
    const [deletingId, setDeletingId] = React.useState<string | null>(null);

    // View toggle between uploaded resources and default materials
    const [viewMode, setViewMode] = React.useState<'uploaded' | 'default'>('uploaded');
    const [selectedSemester, setSelectedSemester] = React.useState<string>('');
    const [selectedSubject, setSelectedSubject] = React.useState<string>('');

    React.useEffect(() => {
        if (user?.role === UserRole.ADMIN) {
            fetchAllMaterials();
        }
    }, [user?.role]);

    React.useEffect(() => {
        filterMaterials();
    }, [allMaterials, searchTerm, categoryFilter, sortBy]);

    const fetchAllMaterials = async () => {
        try {
            setLoading(true);
            const materials = await getApprovedMaterials();
            setAllMaterials(materials as MaterialWithEmail[]);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterMaterials = () => {
        let filtered = allMaterials;

        // Filter by search
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(m =>
                m.title.toLowerCase().includes(search) ||
                m.description.toLowerCase().includes(search) ||
                m.uploader_username.toLowerCase().includes(search)
            );
        }

        // Filter by category
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(m => m.category === categoryFilter);
        }

        // Sort
        if (sortBy === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sortBy === 'popular') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'downloads') {
            filtered.sort((a, b) => b.downloads - a.downloads);
        }

        setFilteredMaterials(filtered);
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;

        try {
            setDeletingId(materialId);
            await rejectMaterial(materialId);
            setAllMaterials(prev => prev.filter(m => m.id !== materialId));
        } catch (error) {
            console.error('Error deleting material:', error);
            alert('Failed to delete resource');
        } finally {
            setDeletingId(null);
        }
    };

    const categories = React.useMemo(() => {
        return Array.from(new Set(allMaterials.map(m => m.category)));
    }, [allMaterials]);

    // Get available semesters for default resources view
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

    if (user?.role !== UserRole.ADMIN) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">Access denied. Admin role required.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-slate-900">Resource Management</h1>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                    Manage uploaded resources and course materials
                </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg inline-flex">
                <button
                    onClick={() => setViewMode('uploaded')}
                    className={`px-4 py-2 rounded font-medium transition-colors ${viewMode === 'uploaded'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Uploaded Resources
                </button>
                <button
                    onClick={() => setViewMode('default')}
                    className={`px-4 py-2 rounded font-medium transition-colors ${viewMode === 'default'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Course Materials
                </button>
            </div>

            {/* Uploaded Resources View */}
            {viewMode === 'uploaded' && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-4 bg-blue-50 border-blue-200">
                            <FileText className="h-5 w-5 text-blue-600 mb-2" />
                            <p className="text-xs font-semibold text-slate-600 uppercase">Total Resources</p>
                            <p className="text-2xl font-bold text-blue-600">{allMaterials.length}</p>
                        </Card>

                        <Card className="p-4 bg-green-50 border-green-200">
                            <Download className="h-5 w-5 text-green-600 mb-2" />
                            <p className="text-xs font-semibold text-slate-600 uppercase">Total Downloads</p>
                            <p className="text-2xl font-bold text-green-600">
                                {allMaterials.reduce((sum, m) => sum + m.downloads, 0)}
                            </p>
                        </Card>

                        <Card className="p-4 bg-yellow-50 border-yellow-200">
                            <Star className="h-5 w-5 text-yellow-600 mb-2" />
                            <p className="text-xs font-semibold text-slate-600 uppercase">Avg Rating</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {allMaterials.length === 0 ? '0.0' : (allMaterials.reduce((sum, m) => sum + (m.rating || 0), 0) / allMaterials.length).toFixed(1)}
                            </p>
                        </Card>

                        <Card className="p-4 bg-purple-50 border-purple-200">
                            <FileText className="h-5 w-5 text-purple-600 mb-2" />
                            <p className="text-xs font-semibold text-slate-600 uppercase">Categories</p>
                            <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Search className="h-4 w-4 inline mr-1" />
                                    Search
                                </label>
                                <Input
                                    placeholder="Search by title or uploader..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="downloads">Most Downloaded</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Resources List */}
                    {loading ? (
                        <Card className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-slate-500">Loading resources...</p>
                        </Card>
                    ) : filteredMaterials.length === 0 ? (
                        <Card className="p-8 text-center">
                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No resources found</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredMaterials.map((material) => (
                                <Card key={material.id} className="p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-base font-semibold text-slate-900 truncate">
                                                    {material.title}
                                                </h3>
                                                <Badge className="bg-green-100 text-green-800 flex-shrink-0">
                                                    Approved
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-slate-600 mb-2 line-clamp-1">
                                                {material.description}
                                            </p>

                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-slate-600">
                                                <div>
                                                    <p className="font-medium text-slate-900">{material.category}</p>
                                                    <p className="text-slate-500">Category</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{material.downloads || 0}</p>
                                                    <p className="text-slate-500">Downloads</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{(material.rating || 0).toFixed(1)}</p>
                                                    <p className="text-slate-500">Rating</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{material.uploader_username || 'Unknown'}</p>
                                                    <p className="text-slate-500">Uploader</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {new Date(material.created_at).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-slate-500">Added</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(material.file_url, '_blank')}
                                                title="View resource"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50"
                                                onClick={() => handleDeleteMaterial(material.id)}
                                                disabled={deletingId === material.id}
                                                title="Delete resource"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Course Materials View */}
            {viewMode === 'default' && (
                <>
                    {/* Semester & Subject Selection */}
                    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Semester</label>
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => {
                                        setSelectedSemester(e.target.value);
                                        setSelectedSubject('');
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
                    )}
                </>
            )}
        </div>
    );
}

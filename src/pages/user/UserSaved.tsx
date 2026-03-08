import * as React from 'react';
import { Bookmark, Search, Eye, Star } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { getApprovedMaterials } from '@/src/firebase/materials';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Material } from '@/src/types';

export function UserSaved() {
    const { user } = useAuth();
    const db = getFirestore();

    const [savedMaterials, setSavedMaterials] = React.useState<Material[]>([]);
    const [filteredMaterials, setFilteredMaterials] = React.useState<Material[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
    const [savingIds, setSavingIds] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        if (user?.id) {
            fetchSavedMaterials();
        }
    }, [user?.id]);

    React.useEffect(() => {
        filterMaterials();
    }, [savedMaterials, searchTerm, categoryFilter]);

    const fetchSavedMaterials = async () => {
        try {
            setLoading(true);
            if (!user?.id) return;

            // Get user's saved materials list
            const userRef = doc(db, 'users', user.id);
            const userDoc = await getDoc(userRef);
            const savedIds = userDoc.data()?.saved_materials || [];

            if (savedIds.length === 0) {
                setSavedMaterials([]);
                return;
            }

            // Fetch all approved materials
            const allMaterials = await getApprovedMaterials();

            // Filter to only saved materials
            const saved = allMaterials.filter(m => savedIds.includes(m.id));
            setSavedMaterials(saved as unknown as Material[]);
        } catch (error) {
            console.error('Error fetching saved materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterMaterials = () => {
        let filtered = savedMaterials;

        // Filter by search term
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(material =>
                material.title.toLowerCase().includes(search) ||
                material.description.toLowerCase().includes(search) ||
                material.subject?.toLowerCase().includes(search)
            );
        }

        // Filter by category
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(material => material.category === categoryFilter);
        }

        setFilteredMaterials(filtered);
    };

    const handleRemoveSaved = async (materialId: string) => {
        if (!user?.id) return;

        try {
            setSavingIds(prev => new Set([...prev, materialId]));
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                saved_materials: arrayRemove(materialId)
            });

            setSavedMaterials(prev => prev.filter(m => m.id !== materialId));
        } catch (error) {
            console.error('Error removing saved material:', error);
        } finally {
            setSavingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(materialId);
                return newSet;
            });
        }
    };

    const categories = React.useMemo(() => {
        return Array.from(new Set(savedMaterials.map(m => m.category)));
    }, [savedMaterials]);

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Please log in to view saved materials</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Saved Materials</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        <Bookmark className="h-4 w-4 inline mr-1" />
                        You have saved <span className="font-semibold">{savedMaterials.length}</span> materials
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Search className="h-4 w-4 inline mr-1" />
                            Search
                        </label>
                        <Input
                            placeholder="Search by title, subject, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Materials Grid */}
            {loading ? (
                <Card className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading saved materials...</p>
                </Card>
            ) : filteredMaterials.length === 0 ? (
                <Card className="p-8 text-center">
                    <Bookmark className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-2">
                        {savedMaterials.length === 0 ? 'No saved materials yet' : 'No materials match your search'}
                    </p>
                    <p className="text-sm text-slate-400 mb-4">
                        {savedMaterials.length === 0
                            ? 'Start exploring resources and save them for later'
                            : 'Try adjusting your filters'}
                    </p>
                    {savedMaterials.length === 0 && (
                        <Button onClick={() => window.location.href = '/user'}>
                            Explore Resources
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMaterials.map((material) => (
                        <Card
                            key={material.id}
                            className="p-4 hover:shadow-lg transition-shadow flex flex-col"
                        >
                            {/* Header */}
                            <div className="mb-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-semibold text-slate-900 line-clamp-2">
                                        {material.title}
                                    </h3>
                                    <button
                                        onClick={() => handleRemoveSaved(material.id)}
                                        disabled={savingIds.has(material.id)}
                                        className="text-red-500 hover:text-red-600 flex-shrink-0"
                                    >
                                        <Bookmark className="h-5 w-5 fill-current" />
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-1">
                                {material.description}
                            </p>

                            {/* Category Badge */}
                            <div className="mb-3">
                                <Badge className="bg-indigo-100 text-indigo-800">
                                    {material.category}
                                </Badge>
                            </div>

                            {/* Subject and other info */}
                            {material.subject && (
                                <p className="text-xs text-slate-500 mb-2">
                                    <span className="font-medium">{material.subject}</span>
                                </p>
                            )}

                            {/* Tags */}
                            {material.tags && material.tags.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-1">
                                    {material.tags.slice(0, 2).map(tag => (
                                        <span
                                            key={tag}
                                            className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {material.tags.length > 2 && (
                                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                            +{material.tags.length - 2}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-slate-200">
                                <div className="text-center">
                                    <p className="text-xs text-slate-500">Views</p>
                                    <p className="text-sm font-semibold text-slate-900">{material.views || 0}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500">Rating</p>
                                    <div className="flex items-center justify-center gap-0.5">
                                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                        <p className="text-sm font-semibold text-slate-900">{material.rating.toFixed(1)}</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500">Downloads</p>
                                    <p className="text-sm font-semibold text-slate-900">{material.downloads}</p>
                                </div>
                            </div>

                            {/* Uploader Info */}
                            <div className="mb-3 pb-3 border-t border-slate-200 text-xs text-slate-600">
                                <p>By <span className="font-medium">{material.uploader_username}</span></p>
                                <p>{new Date(material.created_at).toLocaleDateString()}</p>
                            </div>

                            {/* Views Display */}
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                {material.views || 0} views
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

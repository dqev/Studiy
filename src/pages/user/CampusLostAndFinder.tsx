import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, MapPin, Clock, Phone, AlertCircle, Search as SearchIcon, MessageCircle, X } from 'lucide-react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { LostAndFinderItem, getAllLostAndFinderItems, getLostAndFinderItemsByType, incrementLostAndFinderItemView } from '@/src/firebase/lostAndFinder';

interface Comment {
    id: string;
    authorId: string;
    authorEmail: string;
    authorUsername: string;
    authorDisplayName: string;
    authorProfilePicture?: string;
    content: string;
    createdAt: string;
}

interface ItemWithComments extends LostAndFinderItem {
    comments?: Comment[];
}

export function CampusLostAndFinder() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const db = getFirestore();

    const [items, setItems] = useState<ItemWithComments[]>([]);
    const [filteredItems, setFilteredItems] = useState<ItemWithComments[]>([]);
    const [activeFilter, setActiveFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
    const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
    const [newComments, setNewComments] = useState<{ [key: string]: string }>({});

    const categories = [
        'Electronics',
        'Documents',
        'Accessories',
        'Clothing',
        'Valuables',
        'Books',
        'Sports Equipment',
        'Other'
    ];

    useEffect(() => {
        setLoading(true);

        // Use onSnapshot for real-time updates
        const q = query(collection(db, 'lostAndFinder'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            try {
                // Fetch all items and their comments in parallel
                const itemsWithComments = await Promise.all(
                    querySnapshot.docs.map(async (doc) => {
                        const itemData = doc.data() as LostAndFinderItem;

                        // Fetch comments for this item
                        const commentsRef = collection(db, 'lostAndFinder', doc.id, 'comments');
                        const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
                        const commentsSnapshot = await getDocs(commentsQuery);

                        const comments: Comment[] = [];
                        commentsSnapshot.forEach((commentDoc) => {
                            comments.push({
                                id: commentDoc.id,
                                ...commentDoc.data() as Omit<Comment, 'id'>
                            });
                        });

                        return {
                            ...itemData,
                            id: doc.id,
                            comments
                        } as ItemWithComments;
                    })
                );

                setItems(itemsWithComments);
                filterItems(itemsWithComments, activeFilter, searchQuery, selectedCategory);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [db]);

    const filterItems = (
        itemsToFilter: ItemWithComments[],
        filter: 'all' | 'lost' | 'found',
        search: string,
        category: string
    ) => {
        let filtered = itemsToFilter;

        // Filter by type
        if (filter !== 'all') {
            filtered = filtered.filter(item => item.type === filter);
        }

        // Filter by category
        if (category !== 'all') {
            filtered = filtered.filter(item => item.category === category);
        }

        // Filter by search query
        if (search.trim()) {
            const query = search.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.location.toLowerCase().includes(query)
            );
        }

        setFilteredItems(filtered);
    };

    const handleFilterChange = (filter: 'all' | 'lost' | 'found') => {
        setActiveFilter(filter);
        filterItems(items, filter, searchQuery, selectedCategory);
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        filterItems(items, activeFilter, query, selectedCategory);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        filterItems(items, activeFilter, searchQuery, category);
    };

    const handleViewItem = async (itemId: string) => {
        try {
            await incrementLostAndFinderItemView(itemId);
            // View count will update automatically via real-time listener
        } catch (error) {
            // Silently handle error
        }
    };

    const toggleSaveItem = (itemId: string) => {
        const newSaved = new Set(savedItems);
        if (newSaved.has(itemId)) {
            newSaved.delete(itemId);
        } else {
            newSaved.add(itemId);
        }
        setSavedItems(newSaved);
    };

    const loadComments = async (itemId: string) => {
        try {
            const commentsRef = collection(db, 'lostAndFinder', itemId, 'comments');
            const q = query(commentsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            const comments: Comment[] = [];
            querySnapshot.forEach((doc) => {
                comments.push({
                    id: doc.id,
                    ...doc.data() as Omit<Comment, 'id'>
                });
            });

            // Update the item's comments in the items state
            const updatedItems = items.map(item =>
                item.id === itemId
                    ? { ...item, comments }
                    : item
            );

            setItems(updatedItems);

            // Also update filtered items to reflect comment count
            setFilteredItems(prev =>
                prev.map(item =>
                    item.id === itemId
                        ? { ...item, comments }
                        : item
                )
            );
        } catch (error) {
            // Silently handle error
        }
    };

    const handleToggleComments = async (itemId: string) => {
        const isExpanding = !expandedComments[itemId];
        setExpandedComments(prev => ({ ...prev, [itemId]: isExpanding }));

        if (isExpanding) {
            await loadComments(itemId);
        }
    };

    const handleAddComment = async (itemId: string) => {
        if (!user || !newComments[itemId]?.trim()) return;

        const commentText = newComments[itemId];

        try {
            // Clear input immediately
            setNewComments(prev => ({ ...prev, [itemId]: '' }));

            const commentsRef = collection(db, 'lostAndFinder', itemId, 'comments');
            await addDoc(commentsRef, {
                authorId: user.id,
                authorEmail: user.email || '',
                authorUsername: user.username || 'Anonymous',
                authorDisplayName: user.displayName || user.username || 'User',
                authorProfilePicture: user.profile_picture || '',
                content: commentText,
                createdAt: new Date().toISOString()
            });

            // Update items state immediately
            const updatedItems = items.map(item => {
                if (item.id === itemId) {
                    const newComment = {
                        id: `temp-${Date.now()}`,
                        authorId: user.id,
                        authorEmail: user.email || '',
                        authorUsername: user.username || 'Anonymous',
                        authorDisplayName: user.displayName || user.username || 'User',
                        authorProfilePicture: user.profile_picture || '',
                        content: commentText,
                        createdAt: new Date().toISOString()
                    };
                    return {
                        ...item,
                        comments: [...(item.comments || []), newComment]
                    };
                }
                return item;
            });

            setItems(updatedItems);

            // Also update filtered items to reflect the new comment count
            setFilteredItems(prev =>
                prev.map(item => {
                    if (item.id === itemId) {
                        const newComment = {
                            id: `temp-${Date.now()}`,
                            authorId: user.id,
                            authorEmail: user.email || '',
                            authorUsername: user.username || 'Anonymous',
                            authorDisplayName: user.displayName || user.username || 'User',
                            authorProfilePicture: user.profile_picture || '',
                            content: commentText,
                            createdAt: new Date().toISOString()
                        };
                        return {
                            ...item,
                            comments: [...(item.comments || []), newComment]
                        };
                    }
                    return item;
                })
            );
        } catch (error) {
            // Restore the comment text if there's an error
            setNewComments(prev => ({ ...prev, [itemId]: commentText }));
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Skeleton Loading Card Component
    const SkeletonCard = () => (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Card Header Skeleton */}
            <div className="p-3 sm:p-4">
                <Skeleton height={18} width="70%" className="mb-1" />
                <Skeleton height={16} width="90%" className="mb-2" />
                <div className="pb-3 border-b border-slate-200">
                    <Skeleton height={14} width="80%" className="mb-1" />
                    <Skeleton height={14} width="75%" />
                </div>
            </div>

            {/* Card Content Skeleton */}
            <div className="px-3 sm:px-4 pt-3 pb-3 sm:pb-4 space-y-3">
                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[...Array(4)].map((_, j) => (
                        <div key={j}>
                            <Skeleton height={16} width="70%" />
                            <Skeleton height={12} width="60%" className="mt-1" />
                        </div>
                    ))}
                </div>

                {/* Tags Skeleton */}
                <div className="flex flex-wrap gap-1">
                    {[...Array(2)].map((_, j) => (
                        <div key={j}>
                            <Skeleton height={16} width={60} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Card Footer Skeleton */}
            <div className="px-3 sm:px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <Skeleton circle height={32} width={32} />
                    <div className="flex-1">
                        <Skeleton height={14} width="35%" className="mb-1" />
                        <Skeleton height={11} width="25%" />
                    </div>
                </div>
                <Skeleton height={16} width={40} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Campus Lost & Finder</h1>
                <p className="text-slate-600 mb-6">Help lost and found items get back to their owners</p>

                {/* Action Button */}
                <Button
                    onClick={() => navigate('/user/lost-and-finder/create')}
                    variant="primary"
                >
                    + Report Lost/Found Item
                </Button>
            </div>

            {/* Filters Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Item Type
                        </label>
                        <div className="flex gap-2">
                            {(['all', 'lost', 'found'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleFilterChange(type)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${activeFilter === type
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Search
                        </label>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title, description, or location..."
                                value={searchQuery}
                                onChange={e => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Category
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['all', ...categories].map(category => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Items Grid */}
            {loading ? (
                <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
                    <div className="space-y-3">
                        {[...Array(Math.max(filteredItems.length, 3))].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </SkeletonTheme>
            ) : filteredItems.length === 0 ? (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                            No items found
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Try adjusting your filters or search terms
                        </p>
                        <Button
                            onClick={() => navigate('/user/lost-and-finder/create')}
                            variant="primary"
                        >
                            Report an Item
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col cursor-pointer"
                            onClick={() => {
                                handleViewItem(item.id || '');
                                navigate(`/user/lost-and-finder/${item.id}`);
                            }}
                        >
                            {/* Card Header with Title */}
                            <div className="p-3 sm:p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2 flex-1">
                                        {item.title}
                                    </h3>
                                    <Badge
                                        className={`flex-shrink-0 ${item.type === 'lost'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-green-500 text-white'
                                            }`}
                                    >
                                        {item.type.toUpperCase()}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-2 pb-3 border-b border-slate-200">
                                    {item.description}
                                </p>
                            </div>

                            {/* Image Preview */}
                            <div className="relative h-40 bg-slate-200 overflow-hidden">
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Card Content - Middle Section */}
                            <div className="px-3 sm:px-4 pt-3 pb-3 sm:pb-4 space-y-3 flex-1">
                                {/* Details Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <div>
                                        <p className="text-sm sm:text-base font-semibold text-indigo-600 truncate">
                                            {item.category}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">Category</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 sm:h-4 w-3 sm:w-4 text-slate-500" />
                                            <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                                                {item.location}
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">Location</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 sm:h-4 w-3 sm:w-4 text-slate-500" />
                                            <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                                                {formatDate(item.dateTime)}
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">Date/Time</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-3 sm:h-4 w-3 sm:w-4 text-slate-500" />
                                            <p className="text-sm sm:text-base font-bold text-slate-900">
                                                {item.views}
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">Views</p>
                                    </div>
                                </div>

                                {/* Category Badge */}
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-indigo-50 text-indigo-700 text-xs">
                                        {item.uploaderPhone && (
                                            <Phone className="w-3 h-3 mr-1 inline" />
                                        )}
                                        {item.uploaderPhone || 'Contact Available'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Card Footer - Uploader Info */}
                            <div className="px-3 sm:px-4 py-3 flex items-center justify-between border-t border-slate-200">
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    {item.uploaderProfilePicture && (
                                        <img
                                            src={item.uploaderProfilePicture}
                                            alt={item.uploaderName}
                                            className="h-8 w-8 rounded-full flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                                            {item.uploaderName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {formatDate(item.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleComments(item.id || '');
                                        }}
                                        className="ml-3 flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        <span className="text-xs sm:text-sm font-medium">
                                            {item.comments?.length || 0}
                                        </span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSaveItem(item.id || '');
                                        }}
                                        className="flex-shrink-0 ml-2"
                                    >
                                        <Heart
                                            className={`w-5 h-5 sm:w-6 sm:h-6 ${savedItems.has(item.id || '')
                                                ? 'fill-red-500 text-red-500'
                                                : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Expandable Comments Section */}
                            {expandedComments[item.id || ''] && (
                                <div
                                    className="px-3 sm:px-4 py-3 bg-slate-50 border-t border-slate-200 space-y-3"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Comments List */}
                                    {item.comments && item.comments.length > 0 ? (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {item.comments.map(comment => (
                                                <div key={comment.id} className="flex gap-2">
                                                    {comment.authorProfilePicture ? (
                                                        <img
                                                            src={comment.authorProfilePicture}
                                                            alt={comment.authorUsername}
                                                            className="h-5 w-5 rounded-full object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-gradient-to-br from-indigo-400 to-indigo-600">
                                                            {comment.authorUsername?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-slate-900 truncate">
                                                            {comment.authorDisplayName || comment.authorUsername}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate">
                                                            @{comment.authorUsername}
                                                        </p>
                                                        <p className="text-xs text-slate-600 mt-0.5">
                                                            {comment.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 text-center py-2">No comments yet. Be the first!</p>
                                    )}

                                    {/* Add Comment Input */}
                                    {user && (
                                        <div className="flex gap-2 pt-2">
                                            <input
                                                type="text"
                                                placeholder="Add a comment..."
                                                value={newComments[item.id || ''] || ''}
                                                onChange={(e) => setNewComments(prev => ({ ...prev, [item.id || '']: e.target.value }))}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <Button
                                                size="sm"
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1.5"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddComment(item.id || '');
                                                }}
                                            >
                                                Post
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

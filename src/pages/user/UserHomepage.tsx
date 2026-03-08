import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Download, Eye, Search, Filter, X, ChevronDown } from 'lucide-react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { getFirestore, collection, getDocs, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc, getDoc, Unsubscribe } from 'firebase/firestore';
import { Material, MaterialStatus, UserRole } from '@/src/types';

interface MaterialWithUploader extends Material {
    uploader_profile_picture?: string;
    uploader_displayName?: string;
}

interface Comment {
    id: string;
    author_id: string;
    author_username: string;
    author_profile_picture?: string;
    author_displayName?: string;
    content: string;
    created_at: string;
}

interface MaterialWithComments extends MaterialWithUploader {
    comments?: Comment[];
    likes?: number;
    liked_by?: string[];
}

export function UserHomepage() {
    const { user } = useAuth();
    const db = getFirestore();

    const [materials, setMaterials] = useState<MaterialWithComments[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
    const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
    const [usersCache, setUsersCache] = useState<Map<string, any>>(new Map());
    const [unsubscribeFunctions, setUnsubscribeFunctions] = useState<Unsubscribe[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Fetch all users for profile data
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, 'users');
                const querySnapshot = await getDocs(usersRef);
                const userMap = new Map();

                querySnapshot.forEach(doc => {
                    const userData = doc.data();
                    userMap.set(userData.username, {
                        profile_picture: userData.profile_picture,
                        displayName: userData.displayName,
                        email: userData.email,
                        id: doc.id,
                        bio: userData.bio,
                        phone: userData.phone,
                        location: userData.location,
                        website: userData.website,
                        role: userData.role,
                        created_at: userData.created_at
                    });
                });

                setUsersCache(userMap);
            } catch (error) {
                // Silently handle error
            }
        };

        fetchUsers();
    }, [db]);

    // Handle dropdown closing on scroll and outside clicks
    useEffect(() => {
        const handleScroll = () => {
            if (isDropdownOpen) {
                setIsDropdownOpen(false);
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (isDropdownOpen && !target.closest('[data-dropdown-trigger]') && !target.closest('[data-dropdown-menu]')) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            window.addEventListener('scroll', handleScroll, true);
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Fetch all materials with real-time updates
    useEffect(() => {
        // Only fetch materials if user is authenticated
        if (!user) {
            setLoading(false);
            return;
        }

        // Fetch ALL materials (simplified query to avoid permission issues)
        const q = query(collection(db, 'materials'));

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            try {
                const materialsData: MaterialWithComments[] = [];

                // Fetch all comments and likes in parallel for better performance
                const materialPromises = querySnapshot.docs.map(async (doc) => {
                    const materialData = doc.data() as Material;

                    const uploaderInfo = usersCache.get(materialData.uploader_username);

                    // Get uploader profile picture and display name
                    const uploader_profile_picture = materialData.uploader_profile_picture || uploaderInfo?.profile_picture;
                    const uploader_displayName = uploaderInfo?.displayName || 'Student';

                    // Fetch comments and likes in parallel
                    const [commentsSnapshot, likesSnapshot] = await Promise.all([
                        getDocs(collection(db, 'materials', doc.id, 'comments')),
                        getDocs(collection(db, 'materials', doc.id, 'likes'))
                    ]);

                    const comments: Comment[] = [];
                    commentsSnapshot.forEach(commentDoc => {
                        const commentData = commentDoc.data();
                        // Use stored username, but fetch latest user info from cache
                        const commentAuthor = usersCache.get(commentData.author_username);

                        // If author not found by old username, try to find by author_id
                        let authorInfo = commentAuthor;
                        if (!authorInfo && commentData.author_id) {
                            // Find user by ID in the cache
                            for (const userInfo of usersCache.values()) {
                                if (userInfo.id === commentData.author_id) {
                                    authorInfo = userInfo;
                                    break;
                                }
                            }
                        }

                        comments.push({
                            id: commentDoc.id,
                            author_id: commentData.author_id,
                            // Use stored username as fallback, but it should match the user's current username
                            author_username: commentData.author_username,
                            author_profile_picture: authorInfo?.profile_picture,
                            author_displayName: authorInfo?.displayName,
                            content: commentData.content,
                            created_at: commentData.created_at
                        });
                    });

                    const likedByUsers = likesSnapshot.docs.map(d => d.data().user_id);

                    return {
                        ...materialData,
                        id: doc.id,
                        uploader_profile_picture: uploader_profile_picture,
                        uploader_displayName: uploader_displayName,
                        comments: comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
                        likes: likedByUsers.length,
                        liked_by: likedByUsers
                    };
                });

                // Wait for all materials to be processed
                const allMaterials = await Promise.all(materialPromises);

                // Sort by creation date (newest first)
                allMaterials.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setMaterials(allMaterials);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        }, (error) => {
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, usersCache, user]);

    const handleAddComment = async (materialId: string) => {
        if (!user || !newComments[materialId]?.trim()) return;

        const commentText = newComments[materialId];

        try {
            // Clear input immediately for better UX
            setNewComments(prev => ({ ...prev, [materialId]: '' }));

            const commentsRef = collection(db, 'materials', materialId, 'comments');
            await addDoc(commentsRef, {
                author_id: user.id,
                author_username: user.username,
                content: commentText,
                created_at: new Date().toISOString()
            });

            // Update materials state immediately to show the comment
            setMaterials(prevMaterials =>
                prevMaterials.map(material => {
                    if (material.id === materialId) {
                        const newComment = {
                            id: `temp-${Date.now()}`,
                            author_id: user.id,
                            author_username: user.username,
                            author_displayName: user.displayName,
                            author_profile_picture: user.profile_picture,
                            content: commentText,
                            created_at: new Date().toISOString()
                        };
                        return {
                            ...material,
                            comments: [...(material.comments || []), newComment]
                        };
                    }
                    return material;
                })
            );
        } catch (error) {
            // Restore the comment text if there's an error
            setNewComments(prev => ({ ...prev, [materialId]: commentText }));
        }
    };

    const handleDeleteComment = async (materialId: string, commentId: string) => {
        if (!user) return;

        try {
            const commentRef = doc(db, 'materials', materialId, 'comments', commentId);
            await deleteDoc(commentRef);
        } catch (error) {
            // Silently handle error
        }
    };

    const handleToggleLike = async (materialId: string) => {
        if (!user) return;

        try {
            const likesRef = collection(db, 'materials', materialId, 'likes');
            const q = query(likesRef, where('user_id', '==', user.id));
            const likeSnapshot = await getDocs(q);

            if (!likeSnapshot.empty) {
                // Unlike
                await deleteDoc(likeSnapshot.docs[0].ref);
            } else {
                // Like
                await addDoc(likesRef, {
                    user_id: user.id,
                    created_at: new Date().toISOString()
                });
            }
        } catch (error) {
            // Silently handle error
        }
    };

    const handleDownload = async (materialId: string, fileUrl?: string) => {
        if (!fileUrl) return;

        try {
            // Update download count
            const materialRef = doc(db, 'materials', materialId);
            const materialDoc = await getDoc(materialRef);
            const currentDownloads = materialDoc.data()?.downloads || 0;

            await updateDoc(materialRef, {
                downloads: currentDownloads + 1
            });

            // Open file in new tab
            window.open(fileUrl, '_blank');
        } catch (error) {
            // Silently handle error
        }
    };

    // Cleanup subscriptions on component unmount
    useEffect(() => {
        return () => {
            unsubscribeFunctions.forEach(unsub => {
                if (unsub && typeof unsub === 'function') {
                    unsub();
                }
            });
        };
    }, [unsubscribeFunctions]);

    const filteredMaterials = materials.filter(material => {
        const matchesSearch =
            (material.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (material.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (material.uploader_username?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(materials.map(m => m.category).filter(Boolean)));

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Please login to view resources</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Page Header */}
            <div className="px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Discover Resources</h1>
                    <p className="text-slate-600 mt-2 text-sm sm:text-base">Search and explore learning materials from your community</p>
                </div>
            </div>

            {/* Search Bar Section */}
            <div className="sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                    {/* Search and Filter Row */}
                    <div className="flex gap-2 sm:gap-4 items-center">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                            {/* Clear Button */}
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Category Dropdown */}
                        <div className="flex-shrink-0 relative" data-dropdown-trigger>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="px-2 sm:px-4 py-2.5 pr-8 sm:pr-10 bg-white rounded-md border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                            >
                                {selectedCategory === 'all' ? 'Category' : selectedCategory}
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Custom Dropdown Menu */}
                            {isDropdownOpen && (
                                <div
                                    data-dropdown-menu
                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-md shadow-lg z-50"
                                >
                                    <div className="max-h-48 overflow-y-auto">
                                        <button
                                            onClick={() => {
                                                setSelectedCategory('all');
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm transition-colors ${selectedCategory === 'all'
                                                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                                : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                        >
                                            All Categories
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    setSelectedCategory(cat);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm transition-colors ${selectedCategory === cat
                                                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Filters Row - Only show when filters are active */}
                    {(searchTerm || selectedCategory !== 'all') && (
                        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                            {searchTerm && (
                                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded text-xs sm:text-sm font-medium border border-indigo-200">
                                    {searchTerm}
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="hover:text-indigo-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {selectedCategory !== 'all' && (
                                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded text-xs sm:text- font-medium border border-indigo-200">
                                    {selectedCategory}
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className="hover:text-indigo-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                                className="text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm font-medium ml-2"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Materials Section */}
                {loading ? (
                    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                                            {[...Array(5)].map((_, j) => (
                                                <div key={j}>
                                                    <Skeleton height={16} width="70%" />
                                                    <Skeleton height={12} width="60%" className="mt-1" />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Tags Skeleton */}
                                        <div className="flex flex-wrap gap-1">
                                            {[...Array(3)].map((_, j) => (
                                                <div key={j}>
                                                    <Skeleton height={16} width={50} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* View File Link Skeleton */}
                                        <Skeleton height={14} width="80px" />
                                    </div>

                                    {/* Card Footer Skeleton */}
                                    <div className="px-3 sm:px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                            <Skeleton circle={true} height={28} width={28} />
                                            <div className="flex-1">
                                                <Skeleton height={14} width="35%" className="mb-1" />
                                                <Skeleton height={11} width="25%" />
                                            </div>
                                        </div>
                                        <Skeleton height={16} width={35} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SkeletonTheme>
                ) : filteredMaterials.length === 0 ? (
                    <div className="bg-white rounded-lg border border-slate-200 py-12 text-center">
                        <Eye className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-700 font-semibold mb-2">No resources found</p>
                        <p className="text-slate-500">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredMaterials.map(material => (
                            <div key={material.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                                {/* Card Header with Title */}
                                <div className="p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2 mb-2">
                                        {material.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 line-clamp-2 pb-3 border-b border-slate-200">
                                        {material.description}
                                    </p>
                                </div>

                                {/* Card Content - Middle Section */}
                                <div className="px-3 sm:px-4 pt-3 pb-3 sm:pb-4 space-y-3 flex-1">
                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                                        <div>
                                            <p className="text-sm sm:text-lg font-bold text-indigo-600">{material.category}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Category</p>
                                        </div>
                                        {material.subject && (
                                            <div>
                                                <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">{material.subject}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Subject</p>
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 sm:h-4 w-3 sm:w-4 text-slate-500" />
                                                <p className="text-sm sm:text-lg font-bold text-slate-900">{material.views || 0}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">Views</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-3 sm:h-4 w-3 sm:w-4 text-pink-500" />
                                                <p className="text-sm sm:text-lg font-bold text-slate-900">{material.likes || 0}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">Likes</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <Download className="h-3 sm:h-4 w-3 sm:w-4 text-green-500" />
                                                <p className="text-sm sm:text-lg font-bold text-slate-900">{material.downloads || 0}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">Downloads</p>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {material.tags && material.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {material.tags.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* View File Link */}
                                    {material.file_url && (
                                        <div>
                                            <a
                                                href={material.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-xs sm:text-sm"
                                            >
                                                View File →
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer - Profile Left, Comment Icon Right */}
                                <div className="px-3 sm:px-4 py-3 flex items-center justify-between">
                                    {/* Profile Info Left */}
                                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                        {material.uploader_profile_picture ? (
                                            <img
                                                src={material.uploader_profile_picture}
                                                alt={material.uploader_username}
                                                className="h-7 sm:h-8 w-7 sm:w-8 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className={`h-7 sm:h-8 w-7 sm:w-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${!usersCache.has(material.uploader_username) ? 'bg-slate-400' : 'bg-gradient-to-br from-indigo-400 to-indigo-600'}`}>
                                                {material.uploader_username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold text-xs sm:text-sm truncate ${!usersCache.has(material.uploader_username) ? 'text-slate-400' : 'text-slate-900'}`}>
                                                {!usersCache.has(material.uploader_username) ? 'Deleted User' : (material.uploader_displayName || material.uploader_username)}
                                            </p>
                                            {usersCache.has(material.uploader_username) && (
                                                <p className="text-xs text-slate-500 truncate">
                                                    @{material.uploader_username}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comment Icon Right */}
                                    <button
                                        onClick={() => setExpandedComments(prev => ({ ...prev, [material.id]: !prev[material.id] }))}
                                        className="ml-3 flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors flex-shrink-0"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        <span className="text-xs sm:text-sm font-medium">{material.comments?.length || 0}</span>
                                    </button>
                                </div>

                                {/* Expandable Comments Section */}
                                {expandedComments[material.id] && (
                                    <div className="px-3 sm:px-4 py-3 bg-slate-50 border-t border-slate-200 space-y-3">
                                        {/* Existing Comments */}
                                        {material.comments && material.comments.length > 0 ? (
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {material.comments.map(comment => {
                                                    // Get the most recent user info by looking up in usersCache
                                                    let currentUserInfo = usersCache.get(comment.author_username);

                                                    // If not found by username, try to find by author_id
                                                    if (!currentUserInfo && comment.author_id) {
                                                        for (const userInfo of usersCache.values()) {
                                                            if ((userInfo as any).id === comment.author_id) {
                                                                currentUserInfo = userInfo;
                                                                break;
                                                            }
                                                        }
                                                    }

                                                    // Check if user is deleted (no userInfo found)
                                                    const isDeletedUser = !currentUserInfo;
                                                    const displayName = (currentUserInfo as any)?.displayName || comment.author_displayName || comment.author_username;
                                                    const username = isDeletedUser ? 'Deleted User' : comment.author_username;

                                                    return (
                                                        <div key={comment.id} className="flex gap-2">
                                                            {(currentUserInfo as any)?.profile_picture || comment.author_profile_picture ? (
                                                                <img
                                                                    src={(currentUserInfo as any)?.profile_picture || comment.author_profile_picture}
                                                                    alt={username}
                                                                    className="h-5 w-5 rounded-full object-cover flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isDeletedUser ? 'bg-slate-400' : 'bg-gradient-to-br from-indigo-400 to-indigo-600'}`}>
                                                                    {(comment.author_username?.charAt(0) || 'D').toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-xs font-semibold truncate ${isDeletedUser ? 'text-slate-400' : 'text-slate-900'}`}>
                                                                    {isDeletedUser ? 'Deleted User' : displayName}
                                                                </p>
                                                                {!isDeletedUser && (
                                                                    <p className="text-xs text-slate-500 truncate">
                                                                        @{comment.author_username}
                                                                    </p>
                                                                )}
                                                                <p className={`text-xs mt-0.5 ${isDeletedUser ? 'text-slate-400 italic' : 'text-slate-600'}`}>
                                                                    {isDeletedUser ? '[This comment is from a deleted account]' : comment.content}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-500 text-center py-2">No comments yet. Be the first!</p>
                                        )}

                                        {/* Add Comment Input */}
                                        <div className="flex gap-2 pt-2">
                                            <input
                                                type="text"
                                                placeholder="Add a comment..."
                                                value={newComments[material.id] || ''}
                                                onChange={(e) => setNewComments(prev => ({ ...prev, [material.id]: e.target.value }))}
                                                className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <Button
                                                size="sm"
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1.5"
                                                onClick={() => handleAddComment(material.id)}
                                            >
                                                Post
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

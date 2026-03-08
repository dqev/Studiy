import React, { useState, useEffect } from 'react';
import { Search, User, BookOpen, ExternalLink, Notebook } from 'lucide-react';
import { IoMdArrowRoundBack } from "react-icons/io";
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

interface UserProfile {
    id: string;
    username: string;
    displayName: string;
    profile_picture?: string;
    bio?: string;
    email: string;
    role?: string;
}

interface UserMaterial {
    id: string;
    title: string;
    description?: string;
    category: string;
    subject?: string;
    file_url?: string;
    created_at: string;
}

export function SearchUser() {
    const { user } = useAuth();
    const db = getFirestore();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [userMaterials, setUserMaterials] = useState<UserMaterial[]>([]);
    const [loading, setLoading] = useState(false);
    const [materialsLoading, setMaterialsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Please login to search users</p>
            </div>
        );
    }

    // Live search effect
    useEffect(() => {
        const performSearch = async () => {
            if (!searchTerm.trim()) {
                setSearchResults([]);
                setSelectedUser(null);
                setError('');
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            setError('');

            try {
                const usersRef = collection(db, 'users');
                // Search for usernames that start with the search term
                const q = query(usersRef, where('username', '>=', searchTerm.toLowerCase().trim()), where('username', '<=', searchTerm.toLowerCase().trim() + '\uf8ff'));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setSearchResults([]);
                } else {
                    const users: UserProfile[] = [];
                    querySnapshot.forEach(doc => {
                        const data = doc.data();
                        // Filter out admin users
                        if (data.role !== 'admin') {
                            users.push({
                                id: doc.id,
                                username: data.username,
                                displayName: data.displayName || 'Unknown',
                                profile_picture: data.profile_picture,
                                bio: data.bio || '',
                                email: data.email,
                                role: data.role
                            });
                        }
                    });
                    setSearchResults(users);
                }
            } catch (err) {
                console.error('Search error:', err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        // Debounce the search
        const timer = setTimeout(performSearch, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, db]);

    const handleUserSelect = async (selectedUserData: UserProfile) => {
        setSelectedUser(selectedUserData);
        setMaterialsLoading(true);

        try {
            const materialsRef = collection(db, 'materials');
            const q = query(materialsRef, where('uploader_username', '==', selectedUserData.username));
            const querySnapshot = await getDocs(q);

            const materials: UserMaterial[] = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                materials.push({
                    id: doc.id,
                    title: data.title,
                    description: data.description || '',
                    category: data.category,
                    subject: data.subject,
                    file_url: data.file_url,
                    created_at: data.created_at
                });
            });

            // Sort by creation date (newest first)
            materials.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setUserMaterials(materials);
        } catch (err) {
            console.error('Error fetching user materials:', err);
            setUserMaterials([]);
        } finally {
            setMaterialsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Search Users</h1>
                <p className="text-sm text-slate-500 mt-1">Find and view profiles of other users</p>
            </div>

            {/* Search Form */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search by username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 py-2.5 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all w-full"
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Search Results */}
            {searchTerm && searchResults.length > 0 && !selectedUser && (
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-900">Search Results</h2>
                    {searchResults.map(resultUser => (
                        <div
                            key={resultUser.id}
                            className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleUserSelect(resultUser)}
                        >
                            <div className="flex items-center gap-4">
                                {resultUser.profile_picture ? (
                                    <img
                                        src={resultUser.profile_picture}
                                        alt={resultUser.username}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                        {resultUser.username[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900">{resultUser.displayName}</p>
                                    <p className="text-sm text-slate-500">@{resultUser.username}</p>
                                    {resultUser.bio && (
                                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{resultUser.bio}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No Results Found */}
            {searchTerm && searchResults.length === 0 && !isSearching && !selectedUser && (
                <div className="bg-white rounded-lg border border-slate-200 py-12 text-center">
                    <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-700 font-semibold mb-1">No users found</p>
                    <p className="text-slate-500">Try searching with a different username</p>
                </div>
            )}

            {/* User Profile View */}
            {selectedUser && (
                <div className="space-y-6">
                    {/* Back Button */}
                    <button
                        onClick={() => {
                            setSelectedUser(null);
                            setUserMaterials([]);
                        }}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                        <IoMdArrowRoundBack size={16} />
                        Back to results
                    </button>

                    {/* Profile Card */}
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {selectedUser.profile_picture ? (
                                <img
                                    src={selectedUser.profile_picture}
                                    alt={selectedUser.username}
                                    className="h-24 w-24 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-3xl">
                                    {selectedUser.username[0].toUpperCase()}
                                </div>
                            )}

                            <div className="flex-1">
                                <p className="text-2xl font-bold text-slate-900">{selectedUser.displayName}</p>
                                <p className="text-slate-600 font-medium">@{selectedUser.username}</p>

                                {selectedUser.bio && (
                                    <p className="text-slate-700 mt-3">{selectedUser.bio}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resources Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Notebook className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-slate-900">
                                Resources ({userMaterials.length})
                            </h2>
                        </div>

                        {materialsLoading ? (
                            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-slate-500">Loading resources...</p>
                            </div>
                        ) : userMaterials.length === 0 ? (
                            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                                <Notebook className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">This user hasn't uploaded any resources yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {userMaterials.map(material => (
                                    <div
                                        key={material.id}
                                        className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
                                    >
                                        {/* Title and Description */}
                                        <div className="mb-3 pb-3 border-b border-slate-200">
                                            <p className="font-semibold text-slate-900 line-clamp-2 text-base">{material.title}</p>
                                            {material.description && (
                                                <p className="text-sm text-slate-600 line-clamp-2 mt-1">{material.description}</p>
                                            )}
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            {/* Category */}
                                            <div>
                                                <p className="text-sm font-bold text-indigo-600">{material.category}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Category</p>
                                            </div>

                                            {/* Subject */}
                                            {material.subject && (
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{material.subject}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Subject</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* File URL Section */}
                                        {material.file_url && (
                                            <div className="mb-3 pb-3 border-b border-slate-100">
                                                <a
                                                    href={material.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    View Material
                                                </a>
                                            </div>
                                        )}

                                        {/* Footer with Date */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <span className="text-xs text-slate-500">
                                                {new Date(material.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

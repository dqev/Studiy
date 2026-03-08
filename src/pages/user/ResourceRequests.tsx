import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Trash2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/context/AuthContext';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

interface Message {
    id: string;
    sender_id: string;
    sender_username: string;
    sender_displayName: string;
    sender_profile_picture?: string;
    content: string;
    created_at: string;
}

interface ResourceRequest {
    id: string;
    requester_id: string;
    requester_username: string;
    requester_displayName: string;
    requester_profile_picture?: string;
    title: string;
    description: string;
    category?: string;
    subject?: string;
    created_at: string;
    status: 'open' | 'fulfilled';
    messages?: Message[];
}

interface User {
    id: string;
    username: string;
    displayName: string;
    profile_picture?: string;
    email: string;
}

export function ResourceRequests() {
    const { user } = useAuth();
    const db = getFirestore();

    const [requests, setRequests] = useState<ResourceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [usersCache, setUsersCache] = useState<Map<string, User>>(new Map());
    const [expandedMessages, setExpandedMessages] = useState<{ [key: string]: boolean }>({});
    const [newMessages, setNewMessages] = useState<{ [key: string]: string }>({});

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, 'users');
                const querySnapshot = await getDocs(usersRef);
                const userMap = new Map();

                querySnapshot.forEach(doc => {
                    const userData = doc.data();
                    userMap.set(userData.username, {
                        id: doc.id,
                        username: userData.username,
                        displayName: userData.displayName,
                        profile_picture: userData.profile_picture,
                        email: userData.email
                    });
                });

                setUsersCache(userMap);
            } catch (error) {
                // Silently handle error
            }
        };

        fetchUsers();
    }, [db]);

    // Fetch all requests with real-time updates
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'requests'), orderBy('created_at', 'desc'));

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            try {
                // Fetch messages for each request in parallel
                const requestPromises = querySnapshot.docs.map(async (doc) => {
                    const requestData = doc.data();

                    let messages: Message[] = [];
                    try {
                        // Fetch messages for this request
                        const messagesSnapshot = await getDocs(collection(db, 'requests', doc.id, 'messages'));

                        messagesSnapshot.forEach(messageDoc => {
                            const messageData = messageDoc.data();
                            // Get sender info from cache
                            const senderInfo = usersCache.get(messageData.sender_username);

                            messages.push({
                                id: messageDoc.id,
                                sender_id: messageData.sender_id,
                                sender_username: messageData.sender_username,
                                sender_displayName: senderInfo?.displayName || messageData.sender_displayName,
                                sender_profile_picture: senderInfo?.profile_picture || messageData.sender_profile_picture,
                                content: messageData.content,
                                created_at: messageData.created_at
                            });
                        });
                    } catch (msgError) {
                        // Continue without messages if there's an error
                    }

                    return {
                        id: doc.id,
                        requester_id: requestData.requester_id,
                        requester_username: requestData.requester_username,
                        requester_displayName: requestData.requester_displayName,
                        requester_profile_picture: requestData.requester_profile_picture,
                        title: requestData.title,
                        description: requestData.description,
                        category: requestData.category,
                        subject: requestData.subject,
                        created_at: requestData.created_at,
                        status: requestData.status || 'open',
                        messages: messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    };
                });

                const allRequests = await Promise.all(requestPromises);
                setRequests(allRequests);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        }, (error) => {
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, user, usersCache]);

    const handleDeleteRequest = async (requestId: string) => {
        if (!user) return;

        try {
            const request = requests.find(r => r.id === requestId);
            if (request && request.requester_id !== user.id) {
                alert('You can only delete your own requests');
                return;
            }

            const requestRef = doc(db, 'requests', requestId);
            await deleteDoc(requestRef);
        } catch (error) {
            // Silently handle error
        }
    };

    const handleAddMessage = async (requestId: string) => {
        if (!user || !newMessages[requestId]?.trim()) return;

        const messageText = newMessages[requestId];

        try {
            // Clear input immediately for better UX
            setNewMessages(prev => ({ ...prev, [requestId]: '' }));

            const messagesRef = collection(db, 'requests', requestId, 'messages');
            const docRef = await addDoc(messagesRef, {
                sender_id: user.id || '',
                sender_username: user.username || '',
                sender_displayName: user.displayName || user.username || 'Student',
                sender_profile_picture: user.profile_picture || null,
                content: messageText,
                created_at: new Date().toISOString()
            });

            // Update requests state immediately to show the message
            setRequests(prevRequests =>
                prevRequests.map(request => {
                    if (request.id === requestId) {
                        const newMessage = {
                            id: docRef.id,
                            sender_id: user.id || '',
                            sender_username: user.username || '',
                            sender_displayName: user.displayName || user.username || 'Student',
                            sender_profile_picture: user.profile_picture,
                            content: messageText,
                            created_at: new Date().toISOString()
                        };
                        return {
                            ...request,
                            messages: [...(request.messages || []), newMessage]
                        };
                    }
                    return request;
                })
            );
        } catch (error) {
            // Restore the message text if there's an error
            setNewMessages(prev => ({ ...prev, [requestId]: messageText }));
        }
    };

    const handleDeleteMessage = async (requestId: string, messageId: string) => {
        if (!user) return;

        try {
            const messageRef = doc(db, 'requests', requestId, 'messages', messageId);
            await deleteDoc(messageRef);
        } catch (error) {
            // Silently handle error
        }
    };

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Please login to view resource requests</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Page Header */}
            <div className="px-3 sm:px-4 lg:px-6 py-6 border-b border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Resource Requests</h1>
                    <p className="text-slate-600 mt-2 text-sm sm:text-base">See what resources others are looking for and help fulfill their requests</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-slate-500 text-lg">Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-lg border border-slate-200 py-12 text-center">
                        <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-700 font-semibold mb-2">No resource requests yet</p>
                        <p className="text-slate-500">Be the first to request a resource</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(request => (
                            <div key={request.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                {/* Request Header */}
                                <div className="p-5 sm:p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                                                {request.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 mb-4">
                                                {request.description}
                                            </p>

                                            {/* Request Details */}
                                            <div className="flex flex-wrap gap-5 sm:gap-6 text-xs sm:text-sm">
                                                {request.category && (
                                                    <div>
                                                        <p className="font-semibold text-indigo-600">{request.category}</p>
                                                        <p className="text-slate-500">Category</p>
                                                    </div>
                                                )}
                                                {request.subject && (
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{request.subject}</p>
                                                        <p className="text-slate-500">Subject</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className={`font-semibold ${request.status === 'open' ? 'text-green-600' : 'text-slate-500'}`}>
                                                        {request.status === 'open' ? 'Open' : 'Fulfilled'}
                                                    </p>
                                                    <p className="text-slate-500">Status</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Request Actions */}
                                        {request.requester_id === user.id && (
                                            <button
                                                onClick={() => handleDeleteRequest(request.id)}
                                                className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 transition-colors"
                                                title="Delete request"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Request Footer - Requester Info */}
                                <div className="px-5 sm:px-6 py-4 sm:py-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                                    {/* Requester Profile */}
                                    <div className="flex items-center gap-3 flex-1">
                                        {request.requester_profile_picture ? (
                                            <img
                                                src={request.requester_profile_picture}
                                                alt={request.requester_username}
                                                className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {request.requester_username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 text-sm truncate">
                                                {request.requester_displayName || request.requester_username}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                @{request.requester_username}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Message Button */}
                                    <button
                                        onClick={() => setExpandedMessages(prev => ({ ...prev, [request.id]: !prev[request.id] }))}
                                        className="ml-3 flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors flex-shrink-0"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        <span className="text-xs sm:text-sm font-medium">{request.messages?.length || 0}</span>
                                    </button>
                                </div>

                                {/* Expandable Messages Section */}
                                {expandedMessages[request.id] && (
                                    <div className="px-5 sm:px-6 py-4 bg-white space-y-4 border-t border-slate-200">
                                        {/* Existing Messages */}
                                        {request.messages && request.messages.length > 0 ? (
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {request.messages.map(message => {
                                                    // Get the most recent user info by looking up in usersCache
                                                    let currentUserInfo = usersCache.get(message.sender_username);

                                                    return (
                                                        <div key={message.id} className="flex gap-2">
                                                            {currentUserInfo?.profile_picture || message.sender_profile_picture ? (
                                                                <img
                                                                    src={currentUserInfo?.profile_picture || message.sender_profile_picture}
                                                                    alt={message.sender_username}
                                                                    className="h-5 w-5 rounded-full object-cover flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                                    {message.sender_username?.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-slate-900 truncate">
                                                                    {currentUserInfo?.displayName || message.sender_displayName || message.sender_username}
                                                                </p>
                                                                <p className="text-xs text-slate-500 truncate">
                                                                    @{message.sender_username}
                                                                </p>
                                                                <p className="text-xs text-slate-600 mt-0.5">{message.content}</p>
                                                            </div>
                                                            {message.sender_id === user.id && (
                                                                <button
                                                                    onClick={() => handleDeleteMessage(request.id, message.id)}
                                                                    className="flex-shrink-0 p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-500 text-center py-2">No messages yet. Be the first!</p>
                                        )}

                                        {/* Add Message Input */}
                                        <div className="flex gap-2 pt-2">
                                            <input
                                                type="text"
                                                placeholder="Send a message..."
                                                value={newMessages[request.id] || ''}
                                                onChange={(e) => setNewMessages(prev => ({ ...prev, [request.id]: e.target.value }))}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddMessage(request.id);
                                                    }
                                                }}
                                                className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <Button
                                                size="sm"
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1.5"
                                                onClick={() => handleAddMessage(request.id)}
                                            >
                                                Send
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

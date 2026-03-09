import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Phone, Mail, Heart, Share2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { LostAndFinderItem, getLostAndFinderItem, updateLostAndFinderItemStatus, incrementLostAndFinderItemView } from '@/src/firebase/lostAndFinder';

export function LostAndFinderDetail() {
    const { itemId } = useParams<{ itemId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [item, setItem] = useState<LostAndFinderItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    useEffect(() => {
        if (!itemId) return;

        const loadItem = async () => {
            try {
                const fetchedItem = await getLostAndFinderItem(itemId);
                if (!fetchedItem) {
                    setError('Item not found');
                } else {
                    setItem(fetchedItem);

                    // Increment view count only once per session
                    const sessionKey = `viewed_item_${itemId}`;
                    if (!sessionStorage.getItem(sessionKey)) {
                        await incrementLostAndFinderItemView(itemId);
                        sessionStorage.setItem(sessionKey, 'true');

                        // Update local item state with incremented views
                        setItem(prev => prev ? { ...prev, views: prev.views + 1 } : null);
                    }
                }
            } catch (err) {
                setError('Failed to load item');
            } finally {
                setLoading(false);
            }
        };

        loadItem();
    }, [itemId]);

    const handleResolveItem = async () => {
        if (!item || !itemId) return;

        setIsUpdatingStatus(true);
        try {
            await updateLostAndFinderItemStatus(itemId, 'resolved');
            setItem({ ...item, status: 'resolved' });
        } catch (err) {
            setError('Failed to resolve item');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: item?.title,
                    text: item?.description,
                    url: window.location.href
                });
            } catch (err) {
                // Silently handle error
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-slate-600">Loading item details...</div>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-red-900">Error</h4>
                                <p className="text-sm text-red-800">{error || 'Item not found'}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate('/user/lost-and-finder')}
                            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
                        >
                            Back to List
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isOwner = user?.email === item.uploaderEmail;

    return (
        <div className="w-full max-w-7xl mx-auto px-2 py-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/user/lost-and-finder')}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to List
            </button>

            {/* Status Banner */}
            {item.status === 'resolved' && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-medium text-emerald-900">Item Found/Returned</h4>
                        <p className="text-sm text-emerald-700">
                            This item has been marked as resolved
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ alignItems: 'start' }}>
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* Image */}
                    <Card className="overflow-hidden mb-6">
                        <div className="relative bg-slate-200 flex items-center justify-center">
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full object-contain"
                            />
                            <div className="absolute top-4 left-4 flex gap-2">
                                <Badge
                                    className={`${item.type === 'lost'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-green-500 text-white'
                                        }`}
                                >
                                    {item.type.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Details */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-3xl">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Description */}
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                                <p className="text-slate-700 whitespace-pre-line">
                                    {item.description}
                                </p>
                            </div>

                            {/* Key Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-600 mb-1">
                                        Category
                                    </h4>
                                    <p className="text-slate-900">{item.category}</p>
                                </div>

                                {item.colors && item.colors.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-600 mb-1">
                                            Colors
                                        </h4>
                                        <div className="flex gap-2 flex-wrap">
                                            {item.colors.map((color, idx) => (
                                                <div key={`${color}-${idx}`}>
                                                    <Badge className="bg-slate-200 text-slate-900">
                                                        {color}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {item.size && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-600 mb-1">
                                            Size
                                        </h4>
                                        <p className="text-slate-900">{item.size}</p>
                                    </div>
                                )}
                            </div>

                            {/* Location & Time */}
                            <div className="border-t border-slate-200 pt-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-slate-600">Location</p>
                                            <p className="text-slate-900 font-medium">{item.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-slate-600">Date & Time</p>
                                            <p className="text-slate-900 font-medium">
                                                {formatDate(item.dateTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            {item.additionalInfo && (
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-indigo-900 mb-2">
                                        Additional Information
                                    </h4>
                                    <p className="text-indigo-800 text-sm">
                                        {item.additionalInfo}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    {/* Contact Card */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {item.uploaderProfilePicture && (
                                <img
                                    src={item.uploaderProfilePicture}
                                    alt={item.uploaderName}
                                    className="w-16 h-16 rounded-full mx-auto"
                                />
                            )}

                            <div className="text-center">
                                <h4 className="font-semibold text-slate-900">
                                    {item.uploaderName}
                                </h4>
                                <p className="text-sm text-slate-600">
                                    Posted {formatDate(item.createdAt)}
                                </p>
                            </div>

                            <div className="border-t border-slate-200 pt-4 space-y-3">
                                {item.uploaderPhone && (
                                    <a
                                        href={`tel:${item.uploaderPhone}`}
                                        className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        <Phone className="w-5 h-5 text-indigo-600" />
                                        <span className="text-sm font-medium text-slate-900">
                                            Call {item.uploaderPhone}
                                        </span>
                                    </a>
                                )}

                                {item.uploaderEmail && (
                                    <a
                                        href={`mailto:${item.uploaderEmail}`}
                                        className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        <Mail className="w-5 h-5 text-indigo-600" />
                                        <span className="text-sm font-medium text-slate-900 truncate">
                                            {item.uploaderEmail}
                                        </span>
                                    </a>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="border-t border-slate-200 pt-4 space-y-2">
                                <button
                                    onClick={handleShare}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg transition-colors"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>

                                <button
                                    onClick={() => setIsSaved(!isSaved)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg transition-colors"
                                >
                                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                                    Save
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Owner Actions */}
                    {isOwner && item.status === 'active' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Owner Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={handleResolveItem}
                                    disabled={isUpdatingStatus}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdatingStatus ? 'Resolving...' : 'Mark as Resolved'}
                                </Button>
                                <p className="text-xs text-slate-600 mt-3">
                                    Click this button once the item has been found/returned.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats */}
                    <Card className="mt-6">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-slate-900">
                                    {item.views}
                                </p>
                                <p className="text-sm text-slate-600">Total Views</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

import * as React from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Trash2, TriangleAlert, CircleX, ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useAuth } from '@/src/context/AuthContext';
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    relatedId?: string;
}

export function UserNotification() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const db = getFirestore();

    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

    React.useEffect(() => {
        if (user?.id) {
            // Set up real-time listener instead of just fetching once
            const userRef = doc(db, 'users', user.id);
            const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
                try {
                    setLoading(false);
                    const userNotifications = docSnapshot.data()?.notifications || [];

                    // Sort by timestamp (newest first)
                    const sorted = userNotifications.sort((a: Notification, b: Notification) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    );

                    setNotifications(sorted);
                    console.log('✅ Notifications updated:', sorted.length);
                } catch (error) {
                    console.error('Error processing notifications:', error);
                    setLoading(false);
                }
            }, (error) => {
                console.error('Error listening to notifications:', error);
                setLoading(false);
            });

            // Cleanup subscription on unmount
            return () => unsubscribe();
        }
    }, [user?.id, db]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            if (!user?.id) return;

            const updatedNotifications = notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            );

            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                notifications: updatedNotifications
            });

            setNotifications(updatedNotifications);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId: string) => {
        try {
            if (!user?.id) return;

            const updatedNotifications = notifications.filter(n => n.id !== notificationId);

            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                notifications: updatedNotifications
            });

            setNotifications(updatedNotifications);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            if (!user?.id) return;

            const updatedNotifications = notifications.map(n => ({ ...n, read: true }));

            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                notifications: updatedNotifications
            });

            setNotifications(updatedNotifications);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'warning':
                return <TriangleAlert className="h-5 w-5 text-yellow-600" />;
            case 'error':
                return <CircleX className="h-5 w-5 text-red-600" />;
            case 'info':
            default:
                return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getNotificationColor = (type: Notification['type'], title: string) => {
        // Special styling for material notifications
        if (title.includes('Material Approved')) {
            return 'bg-green-50 border-green-300 border-l-4';
        }
        if (title.includes('Material Not Approved')) {
            return 'bg-yellow-50 border-yellow-300 border-l-4';
        }

        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const displayedNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Please log in to view notifications</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={handleMarkAllAsRead}>
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    All Notifications ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${filter === 'unread'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    Unread
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Notifications List */}
            {loading ? (
                <Card className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading notifications...</p>
                </Card>
            ) : displayedNotifications.length === 0 ? (
                <Card className="p-8 text-center">
                    <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-2">
                        {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </p>
                    <p className="text-sm text-slate-400">
                        {filter === 'unread'
                            ? 'Keep exploring for updates'
                            : 'You\'ll see notifications about your uploads, downloads, and interactions here'}
                    </p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {displayedNotifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`p-4 border-l-4 transition-all ${getNotificationColor(notification.type, notification.title)
                                } ${!notification.read ? 'ring-1 ring-offset-2 ring-indigo-500' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className="flex-shrink-0 mt-0.5">
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-semibold text-slate-900">
                                            {notification.title}
                                        </h3>
                                        {!notification.read && (
                                            <span className="inline-block h-2 w-2 bg-indigo-600 rounded-full flex-shrink-0 mt-2"></span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-700 mb-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                                    {notification.title.includes('Material Approved') && notification.relatedId && (
                                        <Button
                                            size="sm"
                                            onClick={() => navigate('/user/resources')}
                                            className="text-xs"
                                        >
                                            <ArrowRight className="h-3 w-3 mr-1" />
                                            View Resources
                                        </Button>
                                    )}
                                    {!notification.read && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="text-indigo-600 hover:bg-indigo-50 text-xs"
                                        >
                                            Mark as read
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteNotification(notification.id)}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Sample Notifications Info */}
            {notifications.length === 0 && (
                <Card className="p-4 bg-slate-50 border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-2">Notification Types</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span><strong>Success:</strong> Your resource was approved by admin</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <TriangleAlert className="h-4 w-4 text-yellow-600" />
                            <span><strong>Warning:</strong> Material was rejected - review reason for details</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CircleX className="h-4 w-4 text-red-600" />
                            <span><strong>Error:</strong> Critical update - action required</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-blue-600" />
                            <span><strong>Info:</strong> General updates and reminders</span>
                        </li>
                    </ul>
                </Card>
            )}
        </div>
    );
}

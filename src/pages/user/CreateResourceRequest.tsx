import React, { useState, useEffect } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/context/AuthContext';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

export function CreateResourceRequest() {
    const { user } = useAuth();
    const db = getFirestore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Fetch categories from materials
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const materialsRef = collection(db, 'materials');
                const querySnapshot = await getDocs(materialsRef);
                const uniqueCategories = new Set<string>();

                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.category) {
                        uniqueCategories.add(data.category);
                    }
                });

                setCategories(Array.from(uniqueCategories).sort());
            } catch (error) {
                // Silently handle error
            }
        };

        fetchCategories();
    }, [db]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!user) {
            setError('Please login to create a request');
            return;
        }

        if (!title.trim() || !description.trim()) {
            setError('Title and description are required');
            return;
        }

        setLoading(true);

        try {
            const requestsRef = collection(db, 'requests');
            const docRef = await addDoc(requestsRef, {
                requester_id: user.id || '',
                requester_username: user.username || '',
                requester_displayName: user.displayName || user.username || 'Student',
                requester_profile_picture: user.profile_picture || null,
                title: title.trim(),
                description: description.trim(),
                category: category || null,
                subject: subject.trim() || null,
                created_at: new Date().toISOString(),
                status: 'open'
            });

            // Reset form
            setTitle('');
            setDescription('');
            setCategory('');
            setSubject('');
            setSuccess(true);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error creating request:', err);
            setError('Failed to create request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Please login to create a resource request</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Page Header */}
            <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Request a Resource</h1>
                    <p className="text-slate-600 mt-2 text-sm sm:text-base">Tell the community what resource you're looking for</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-10">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 text-sm font-medium">✓ Your resource request has been posted successfully!</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-3">
                                What are you looking for? *
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g., Python Programming Tutorial, Data Science Notes"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                maxLength={100}
                            />
                            <p className="text-xs text-slate-500 mt-2">{title.length}/100 characters</p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-3">
                                Tell us more about what you need *
                            </label>
                            <textarea
                                placeholder="Describe the resource you're looking for in detail. What topics should it cover? What format would be helpful?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows={5}
                                maxLength={500}
                            />
                            <p className="text-xs text-slate-500 mt-2">{description.length}/500 characters</p>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-3">
                                Category (Optional)
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-3">
                                Subject (Optional)
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g., Mathematics, Biology, Web Development"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                maxLength={50}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors"
                            >
                                <Send className="h-4 w-4" />
                                {loading ? 'Posting...' : 'Post Request'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

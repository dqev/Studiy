import * as React from 'react';
import { Upload as UploadIcon, X, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/context/AuthContext';
import { uploadMaterial } from '@/src/firebase/materials';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

interface UploadFormData {
    title: string;
    description: string;
    category: string;
    file_url: string;
    subject: string;
    tags: string[];
}

const CATEGORIES = ['Notes', 'PYQ', 'Assignment', 'Video', 'Book', 'Tutorial', 'Other'];
const SUBJECTS = [
    'Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Biology', 'History',
    'Geography', 'English', 'Economics', 'Psychology', 'Programming', 'Web Development'
];

export function UserUpload() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const db = getFirestore();

    const [formData, setFormData] = React.useState<UploadFormData>({
        title: '',
        description: '',
        category: 'Notes',
        file_url: '',
        subject: '',
        tags: [],
    });

    const [currentTag, setCurrentTag] = React.useState('');
    const [uploading, setUploading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState(false);
    const [hasUnsavedDraft, setHasUnsavedDraft] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    // Load draft data on mount
    React.useEffect(() => {
        if (user?.id) {
            loadDraftData();
        }
    }, [user?.id]);

    // Save draft data whenever form changes
    React.useEffect(() => {
        if (user?.id && (formData.title || formData.description || formData.file_url || formData.subject)) {
            saveDraftData();
            setHasUnsavedDraft(true);
        }
    }, [formData]);

    const loadDraftData = async () => {
        try {
            setLoading(true);
            const draftRef = doc(db, 'user_drafts', user!.id);
            const draftDoc = await getDoc(draftRef);

            if (draftDoc.exists()) {
                const data = draftDoc.data();
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    category: data.category || 'Notes',
                    file_url: data.file_url || '',
                    subject: data.subject || '',
                    tags: data.tags || [],
                });
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveDraftData = async () => {
        try {
            const draftRef = doc(db, 'user_drafts', user!.id);
            await setDoc(draftRef, {
                ...formData,
                updatedAt: new Date().toISOString(),
                userId: user!.id,
            });
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    };

    const deleteDraftData = async () => {
        try {
            const draftRef = doc(db, 'user_drafts', user!.id);
            await deleteDoc(draftRef);
        } catch (error) {
            console.error('Error deleting draft:', error);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleAddTag = () => {
        if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, currentTag.trim()]
            }));
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            setError('Please enter a title');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Please enter a description');
            return false;
        }
        if (!formData.file_url.trim()) {
            setError('Please enter a file URL');
            return false;
        }
        if (!formData.subject) {
            setError('Please select a subject');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm() || !user?.email || !user?.username) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setUploading(true);

            const materialData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                file_url: formData.file_url,
                subject: formData.subject,
                tags: formData.tags,
                uploader_id: user.id,
                downloads: 0,
                rating: 0,
                ratings_count: 0,
                views: 0,
            };

            const documentId = await uploadMaterial(
                materialData,
                user.email,
                user.username,
                user.profile_picture
            );

            // Delete draft after successful upload
            await deleteDraftData();

            setSuccess(true);
            // Reset form
            setFormData({
                title: '',
                description: '',
                category: 'Notes',
                file_url: '',
                subject: '',
                tags: [],
            });
            setHasUnsavedDraft(false);

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/user/resources');
            }, 2000);
        } catch (err) {
            console.error('Error uploading material:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload resource');
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Please log in to upload resources</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-slate-500">Loading your draft...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Upload New Resource</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Share your study materials with the community. Your resource will be reviewed before publication.
                </p>
            </div>

            {/* Draft Notice */}
            {hasUnsavedDraft && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between">
                        <p className="text-blue-800 font-medium">
                            ℹ Your draft is automatically saved
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                if (confirm('Clear all form data?')) {
                                    await deleteDraftData();
                                    setFormData({
                                        title: '',
                                        description: '',
                                        category: 'Notes',
                                        file_url: '',
                                        subject: '',
                                        tags: [],
                                    });
                                    setHasUnsavedDraft(false);
                                }
                            }}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Clear Draft
                        </Button>
                    </div>
                </Card>
            )}

            {/* Success Message */}
            {success && (
                <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <p className="text-green-800 font-medium">
                            Resource uploaded successfully! Redirecting to your resources...
                        </p>
                    </div>
                </Card>
            )}

            {/* Error Message */}
            {error && (
                <Card className="p-4 bg-red-50 border-red-200">
                    <p className="text-red-800 font-medium">✗ {error}</p>
                </Card>
            )}

            {/* Upload Form */}
            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., Physics Unit 1 Complete Notes"
                        />
                    </div>

                    {/* Subject & Category Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select a subject</option>
                                {SUBJECTS.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {CATEGORIES.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe your resource - what it covers, who might find it useful, etc."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={4}
                        />
                    </div>

                    {/* File URL */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            File URL <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="file_url"
                            type="url"
                            value={formData.file_url}
                            onChange={handleInputChange}
                            placeholder="https://drive.google.com/... or your file hosting URL"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Paste a link to your file (Google Drive, Dropbox, etc.)
                        </p>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tags
                        </label>
                        <div className="flex gap-2 mb-3">
                            <Input
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                placeholder="Add tags to help others find your resource"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddTag}
                            >
                                Add Tag
                            </Button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map(tag => (
                                    <div
                                        key={tag}
                                        className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-indigo-900"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={uploading}
                            className="flex-1"
                        >
                            <UploadIcon className="mr-2 h-4 w-4" />
                            {uploading ? 'Uploading...' : 'Upload Resource'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/user/resources')}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Info Card */}
            <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Upload Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure your file is accessible and doesn't require special permissions</li>
                    <li>• Write clear, descriptive titles and descriptions</li>
                    <li>• Add relevant tags to improve discoverability</li>
                    <li>• Your resource will be reviewed by our team before appearing publicly</li>
                </ul>
            </Card>
        </div>
    );
}

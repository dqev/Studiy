import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { uploadLostAndFinderItem } from '@/src/firebase/lostAndFinder';
import { uploadToCloudinary, validateFileSize, formatFileSize } from '@/src/firebase/cloudinaryService';

type FormInputEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
type FormEventType = FormEvent<HTMLFormElement>;

export function CreateLostAndFinderItem() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'lost' as 'lost' | 'found',
        category: 'Electronics',
        location: '',
        dateTime: new Date().toISOString().slice(0, 16),
        phone: '',
        colors: '',
        size: '',
        additionalInfo: ''
    });

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [imageError, setImageError] = useState('');

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

    const handleInputChange = (e: FormInputEvent) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImageError('');

        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setImageError('Please select an image file');
            return;
        }

        // Validate file size
        if (!validateFileSize(file)) {
            setImageError(`File size must be less than 500KB. Current size: ${formatFileSize(file.size)}`);
            return;
        }

        setSelectedImage(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: FormEventType) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }

        if (!formData.description.trim()) {
            setError('Description is required');
            return;
        }

        if (!formData.location.trim()) {
            setError('Location is required');
            return;
        }

        if (!formData.phone.trim()) {
            setError('Phone number is required');
            return;
        }

        if (!selectedImage) {
            setError('Image is required');
            return;
        }

        if (!user) {
            setError('You must be logged in');
            return;
        }

        setUploading(true);

        try {
            // Upload image to Cloudinary
            setUploadingImage(true);
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

            if (!cloudName || !uploadPreset) {
                throw new Error('Cloudinary credentials not configured');
            }

            const uploadResponse = await uploadToCloudinary(
                selectedImage,
                cloudName,
                uploadPreset
            );
            setUploadingImage(false);

            // Create item in Firebase
            const itemId = await uploadLostAndFinderItem({
                title: formData.title,
                description: formData.description,
                type: formData.type,
                category: formData.category,
                imageUrl: uploadResponse.secure_url,
                location: formData.location,
                dateTime: formData.dateTime,
                uploaderEmail: user.email || '',
                uploaderName: user.username || user.displayName || 'Anonymous',
                uploaderPhone: formData.phone,
                uploaderProfilePicture: user.profile_picture,
                uploaderId: user.id,
                status: 'active',
                colors: formData.colors
                    .split(',')
                    .map(c => c.trim())
                    .filter(c => c),
                size: formData.size || undefined,
                additionalInfo: formData.additionalInfo || undefined
            });

            setSuccess(true);
            setFormData({
                title: '',
                description: '',
                type: 'lost',
                category: 'Electronics',
                location: '',
                dateTime: new Date().toISOString().slice(0, 16),
                phone: '',
                colors: '',
                size: '',
                additionalInfo: ''
            });
            setSelectedImage(null);
            setImagePreview('');

            // Redirect after success
            setTimeout(() => {
                navigate('/user/lost-and-finder');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload item');
            setUploading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Report Lost/Found Item</CardTitle>
                </CardHeader>
                <CardContent>
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-green-900">Success!</h4>
                                <p className="text-sm text-green-800">
                                    Your item has been reported. Redirecting...
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-red-900">Error</h4>
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {imageError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-red-900">Image Error</h4>
                                <p className="text-sm text-red-800">{imageError}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Item Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Is this a Lost or Found item?
                            </label>
                            <div className="flex gap-4">
                                {(['lost', 'found'] as const).map(type => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value={type}
                                            checked={formData.type === type}
                                            onChange={handleInputChange}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-slate-700">
                                            {type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Item Title *
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Blue Backpack, iPhone 14 Pro"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the item in detail (brand, features, condition, etc.)"
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Colors */}
                        <div>
                            <label htmlFor="colors" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Colors (comma-separated)
                            </label>
                            <input
                                id="colors"
                                name="colors"
                                type="text"
                                value={formData.colors}
                                onChange={handleInputChange}
                                placeholder="e.g., Blue, Black, Silver"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Size */}
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Size
                            </label>
                            <input
                                id="size"
                                name="size"
                                type="text"
                                value={formData.size}
                                onChange={handleInputChange}
                                placeholder="e.g., Medium, Large, 6 inches"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Location Found/Lost *
                            </label>
                            <input
                                id="location"
                                name="location"
                                type="text"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="e.g., Library Building, Main Gate, Canteen"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Date & Time */}
                        <div>
                            <label htmlFor="dateTime" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Date & Time *
                            </label>
                            <input
                                id="dateTime"
                                name="dateTime"
                                type="datetime-local"
                                value={formData.dateTime}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Contact Phone Number *
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="e.g., +91 98765 43210"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Additional Info */}
                        <div>
                            <label htmlFor="additionalInfo" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Additional Information
                            </label>
                            <textarea
                                id="additionalInfo"
                                name="additionalInfo"
                                value={formData.additionalInfo}
                                onChange={handleInputChange}
                                placeholder="Any other details that might help identify the item"
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Upload Image (Max 500KB) *
                            </label>
                            <p className="text-xs text-slate-500 mb-2">
                                Tip: Use <a href="https://imageraft.vercel.app" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 underline">imageraft.vercel.app</a> to reduce image size if needed
                            </p>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6">
                                {imagePreview ? (
                                    <div className="space-y-3">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                        <label className="block text-center">
                                            <span className="block text-xs text-slate-600 mb-2">Click to change image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedImage(null);
                                                setImagePreview('');
                                            }}
                                            className="w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer block">
                                        <div className="text-center">
                                            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                            <p className="text-slate-700 font-medium mb-1">Click to upload or drag and drop</p>
                                            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 500KB</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={uploading}
                                variant="primary"
                                className="flex-1"
                            >
                                {uploading ? (uploadingImage ? 'Uploading Image...' : 'Creating Report...') : 'Report Item'}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => navigate('/user/lost-and-finder')}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

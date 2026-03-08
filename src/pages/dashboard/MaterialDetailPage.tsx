import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { useAuth } from '@/src/context/AuthContext';
import { useMaterialView } from '@/src/hooks/useMaterialView';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { CheckCircle2, Clock, BookOpen } from 'lucide-react';

interface Material {
    id: string;
    title: string;
    subject: string;
    semester: number;
    description?: string;
    uploadedBy: string;
    approved: boolean;
    views: number;
    downloadUrl?: string;
    createdAt?: any;
}

/**
 * Material Detail Page Component
 * Displays a single material with:
 * - Material information (title, subject, semester, etc.)
 * - View count (updated in real-time)
 * - Download button
 * - Automatic view tracking when page loads
 */
export const MaterialDetailPage = () => {
    const { materialId } = useParams<{ materialId: string }>();
    const { user } = useAuth();
    const db = getFirestore();

    const [material, setMaterial] = useState<Material | null>(null);
    const [isLoadingMaterial, setIsLoadingMaterial] = useState(true);
    const [materialError, setMaterialError] = useState<string | null>(null);

    // Use the material view hook - automatically records view on mount
    const {
        views,
        isLoading: isLoadingView,
        error: viewError,
        recordView
    } = useMaterialView({
        materialId: materialId || '',
        userId: user?.uid,
        onError: (error) => {
            console.error('View tracking error:', error.message);
        }
    });

    // Fetch material details
    useEffect(() => {
        if (!materialId) {
            setMaterialError('Material ID is missing');
            setIsLoadingMaterial(false);
            return;
        }

        const fetchMaterial = async () => {
            try {
                setIsLoadingMaterial(true);
                setMaterialError(null);

                const materialRef = doc(db, 'materials', materialId);
                const materialDoc = await getDoc(materialRef);

                if (!materialDoc.exists()) {
                    setMaterialError('Material not found');
                    return;
                }

                const data = materialDoc.data();

                // Only show approved materials to non-admin users
                if (!data.approved && user?.role !== 'admin') {
                    setMaterialError('This material is not yet approved');
                    return;
                }

                setMaterial({
                    id: materialDoc.id,
                    ...data
                } as Material);
            } catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : 'Failed to fetch material';
                setMaterialError(errorMessage);
                console.error('❌ Error fetching material:', error);
            } finally {
                setIsLoadingMaterial(false);
            }
        };

        fetchMaterial();
    }, [materialId, db, user?.role]);

    // Loading state
    if (isLoadingMaterial) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Error state
    if (materialError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md w-full mx-4">
                    <div className="p-6 text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
                        <p className="text-gray-600 mb-4">{materialError}</p>
                        <Button
                            onClick={() => window.history.back()}
                            className="w-full"
                        >
                            Go Back
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Material not found
    if (!material) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md w-full mx-4">
                    <div className="p-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Not Found</h1>
                        <p className="text-gray-600 mb-4">The material you're looking for doesn't exist.</p>
                        <Button
                            onClick={() => window.history.back()}
                            className="w-full"
                        >
                            Go Back
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Material Header */}
                <Card className="mb-6">
                    <div className="p-6 sm:p-8">
                        <div className="mb-4">
                            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                                {material.subject}
                            </span>
                            {material.approved && (
                                <span className="ml-2 inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Approved
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                            {material.title}
                        </h1>

                        <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-5 w-5" />
                                <span className="font-semibold">Semester:</span>
                                {material.semester}
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold mr-2">👁️ Views:</span>
                                <span className="text-lg font-bold text-blue-600">
                                    {isLoadingView ? '...' : views}
                                </span>
                            </div>
                            {material.createdAt && (
                                <div className="flex items-center">
                                    <span className="font-semibold mr-2">📅 Uploaded:</span>
                                    {new Date(material.createdAt.toDate()).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        {material.description && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {material.description}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {material.downloadUrl && (
                                <a
                                    href={material.downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                >
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        📥 Download Material
                                    </Button>
                                </a>
                            )}

                            <Button
                                onClick={() => window.history.back()}
                                variant="outline"
                                className="flex-1"
                            >
                                ← Back to List
                            </Button>
                        </div>

                        {/* View Tracking Status */}
                        {viewError && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-700 text-sm">
                                    ⚠️ View tracking error: {viewError.message}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Upload Information */}
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Material Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-1">Uploaded By</p>
                                <p className="text-gray-900">{material.uploadedBy}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-1">Status</p>
                                <p className="text-gray-900">
                                    {material.approved ? (
                                        <span className="text-green-600 font-semibold flex items-center gap-1">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Approved
                                        </span>
                                    ) : (
                                        <span className="text-yellow-600 font-semibold flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            Pending Approval
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-1">Total Views</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {isLoadingView ? '...' : views}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-1">User Views</p>
                                <p className="text-gray-900">
                                    {user ? (views > 0 ? <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" />You viewed this</span> : 'Not yet viewed') : 'Sign in to track'}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MaterialDetailPage;

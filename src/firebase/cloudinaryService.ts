// Cloudinary configuration and upload service
// Note: You'll need to set up Cloudinary credentials in your Vercel environment variables

export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

// Maximum file size in bytes (500KB)
const MAX_FILE_SIZE = 500 * 1024;

// Validate file size
export const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Upload image to Cloudinary using unsigned upload
export const uploadToCloudinary = async (
  file: File,
  cloudName: string,
  uploadPreset: string
): Promise<CloudinaryUploadResponse> => {
  // Validate file size
  if (!validateFileSize(file)) {
    throw new Error(`File size must be less than 500KB. Current size: ${formatFileSize(file.size)}`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'studiy/lostandfinder');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload image');
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Delete image from Cloudinary (requires authentication)
export const deleteFromCloudinary = async (
  publicId: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string
): Promise<void> => {
  const timestamp = Math.floor(Date.now() / 1000);
  
  // This requires backend implementation for security
  // Frontend should call a backend endpoint that handles deletion
  // Example: await fetch('/api/cloudinary/delete', { method: 'POST', body: { publicId } })
  
  console.warn('Cloudinary deletion should be handled from backend for security');
};

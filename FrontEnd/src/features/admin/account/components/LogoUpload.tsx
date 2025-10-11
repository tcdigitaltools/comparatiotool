'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import AuthenticatedImage from '@/shared/components/AuthenticatedImage';

interface LogoUploadProps {
  currentLogo?: string;
  companyName: string;
  onUpload: (file: File) => Promise<string>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LogoUpload({ 
  currentLogo,
  companyName, 
  onUpload, 
  disabled = false,
  size = 'md'
}: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPG, PNG, GIF, BMP)';
    }

    // Check file size (1MB limit for logos - much smaller!)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      return 'File size must be less than 1MB for optimal performance';
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return 'Only JPG, PNG, GIF, and BMP files are allowed';
    }

    return null;
  };

  // Compress image for optimal logo size
  const compressImage = (file: File, maxWidth: number = 200, maxHeight: number = 200, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

      // Draw and compress
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg', // Convert to JPEG for better compression
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original if compression fails
          }
        }, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = useCallback(async (file: File) => {
    // Reset states
    setUploadError(null);
    setUploadSuccess(false);
    
    // Clear any existing preview
    if (previewUrl) {
      setPreviewUrl(null);
    }
    
    // Clear any existing preview (no localStorage usage for production)

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setIsUploading(true);

    try {
      // Compress the image for optimal size and performance
      const compressedFile = await compressImage(file);
      
      // Create preview using compressed file for base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        setPreviewUrl(base64Data);
      };
      reader.readAsDataURL(compressedFile);

      // Upload the compressed file
      await onUpload(compressedFile);
      setUploadSuccess(true);
      
      // Clear preview URL after successful upload to ensure backend URL is used
      setPreviewUrl(null);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      // Clean up preview URL on error
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, previewUrl]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  }, [disabled, isUploading, handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isUploading) return;

    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  }, [disabled, isUploading, handleFileUpload]);

  const handleClick = useCallback(() => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }, [disabled, isUploading]);

  // Convert backend file path to proper API endpoint URL
  const getLogoUrl = (filePath: string): string | null => {
    if (!filePath) return null;
    
    // If it's already a data URL, return as is
    if (filePath.startsWith('data:')) {
      return filePath;
    }
    
    // If we have a filePath, extract userId from it
    // Backend paths like ".\uploads\profiles\68e482b7f2c6b18fb1d0a474\image.jpg"
    const match = filePath.match(/profiles[\\\/]([^\\\/]+)[\\\/]/);
    if (match && match[1]) {
      const userId = match[1];
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('authToken');
      if (token) {
        const apiUrl = `${baseUrl}/api/profile/${userId}/image`;
        console.log('LogoUpload: Generated API URL:', apiUrl, 'from path:', filePath);
        return apiUrl;
      }
    }
    
    console.log('LogoUpload: Could not extract userId from path:', filePath);
    return null;
  };

  // Initialize preview URL from current logo prop
  useEffect(() => {
    if (currentLogo) {
      if (currentLogo.startsWith('data:')) {
        setPreviewUrl(currentLogo);
      } else {
        // Clear preview for backend URLs to force using getLogoUrl
        setPreviewUrl(null);
      }
    } else {
      // Clear preview if no current logo
      setPreviewUrl(null);
    }
  }, [currentLogo]);

  // Cleanup preview URL when component unmounts or currentLogo changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('data:')) {
        // No need to revoke data URLs, they're automatically cleaned up
      }
    };
  }, [previewUrl]);


  // Display logic: After successful upload, always use backend URL to show the actual uploaded file
  // Only use previewUrl during the upload process (before backend response)
  const backendUrl = getLogoUrl(currentLogo || '');
  const displayLogo = backendUrl || previewUrl;
  
  

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Logo Display */}
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragActive ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-slate-50'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-brand-300 hover:bg-brand-50'}
          ${isUploading ? 'animate-pulse' : ''}
          ${uploadSuccess ? 'border-green-400 bg-green-50' : ''}
          ${uploadError ? 'border-red-400 bg-red-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {displayLogo ? (
          <div className="w-full h-full rounded-full overflow-hidden relative">
            {/* Use AuthenticatedImage for both base64 and backend URLs with authentication */}
            <AuthenticatedImage
              key={currentLogo} // Force re-render when logo path changes
              src={displayLogo}
              alt={`${companyName} logo`}
              className="w-full h-full object-cover"
              fallback={
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'} rounded-full`}>
                  {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
                </div>
              }
            />
            
            {/* Upload overlay when uploading */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/60 border-t-white"></div>
              </div>
            )}
            
            {/* Success overlay */}
            {uploadSuccess && (
              <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center rounded-full">
                <Check className="h-6 w-6 text-white" />
              </div>
            )}
            
            {/* Hover overlay - shows "Upload" on hover */}
            {!disabled && !isUploading && !uploadSuccess && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <span className="text-white text-xs font-medium">Upload</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500/60 border-t-brand-500"></div>
            ) : uploadSuccess ? (
              <Check className={`${iconSizes[size]} text-green-500`} />
            ) : (
              <Upload className={`${iconSizes[size]} text-slate-400`} />
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Error message only - no upload button needed since logo is clickable */}
      {uploadError && (
        <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 px-2 py-1 rounded-lg">
          <AlertCircle className="h-3 w-3" />
          {uploadError}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onError?: () => void;
}

/**
 * AuthenticatedImage Component
 * Fetches images from backend with authentication headers
 * Converts response to blob URL for display
 */
export default function AuthenticatedImage({ 
  src, 
  alt, 
  className = '',
  fallback,
  onError
}: AuthenticatedImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If it's a data URL, use it directly
    if (src.startsWith('data:')) {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    // If it's a backend URL, fetch with auth headers
    const fetchImage = async () => {
      try {
        setIsLoading(true);
        setError(false);
        
        // Revoke old blob URL before fetching new one to prevent memory leaks
        if (imageSrc && imageSrc.startsWith('blob:')) {
          URL.revokeObjectURL(imageSrc);
          setImageSrc(null);
        }
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No auth token found');
        }

        // Add cache-busting to ensure fresh image on every fetch
        const cacheBustedUrl = `${src}?t=${Date.now()}`;
        
        const response = await fetch(cacheBustedUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-store', // Disable browser caching
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      } catch {
        setError(true);
        onError?.();
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();

    // Cleanup function to revoke object URL
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src]); // Only depend on src, not imageSrc or onError

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-slate-200 ${className}`}>
        {/* Loading placeholder */}
      </div>
    );
  }

  if (error || !imageSrc) {
    return <>{fallback}</>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      onError={() => {
        setError(true);
        onError?.();
      }}
    />
  );
}


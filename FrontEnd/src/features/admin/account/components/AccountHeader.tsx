'use client';

import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useState, useEffect } from 'react';
import AuthenticatedImage from '@/shared/components/AuthenticatedImage';

interface AccountHeaderProps {
  companyName?: string;
  industry?: string;
  logo?: string;
}

export default function AccountHeader({ 
  companyName = "", 
  industry = "",
  logo
}: AccountHeaderProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    setImageLoadError(false);
  }, [logo]);

  const getLogoUrl = (filePath: string, userId?: string): string | null => {
    if (!filePath && !userId) return null;
    
    if (filePath && filePath.startsWith('data:')) {
      return filePath;
    }
    
    let extractedUserId = userId;
    if (filePath && !extractedUserId) {
      const match = filePath.match(/profiles[\\\/]([^\\\/]+)[\\\/]/);
      if (match && match[1]) {
        extractedUserId = match[1];
      }
    }
    
    if (extractedUserId) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('authToken');
      if (token) {
        return `${baseUrl}/api/profile/${extractedUserId}/image`;
      }
    }
    
    return null;
  };

  const logoUrl = getLogoUrl(logo || '');
  
  useEffect(() => {
  }, [logo, logoUrl, imageLoadError]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 shadow-sm">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          {logoUrl && !imageLoadError ? (
            <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center bg-white">
        <AuthenticatedImage
          key={logo}
          src={logoUrl}
          alt="Company Logo"
          className="h-full w-full object-cover"
          onError={() => {
            setImageLoadError(true);
          }}
          fallback={
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          }
        />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-brand-700">
              {companyName || 'Unnamed Company'}
            </h1>
            <p className="text-brand-700 text-sm">{industry || 'No Industry'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={isSuperAdmin ? "/super-admin/clients" : "/calculator"}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {isSuperAdmin ? "Back to Client List" : "Back to Calculator"}
          </Link>
        </div>
      </div>
    </header>
  );
}

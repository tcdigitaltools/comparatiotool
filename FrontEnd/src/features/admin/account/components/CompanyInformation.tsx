'use client';

import { useState, useEffect } from 'react';
import { Building2, Mail } from 'lucide-react';
import LogoUpload from './LogoUpload';
import AuthenticatedImage from '@/shared/components/AuthenticatedImage';

interface CompanyInformationProps {
  companyName?: string;
  industry?: string;
  email?: string;
  logo?: string;
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
  onLogoUpload?: (file: File) => Promise<string>;
  isAdmin?: boolean;
  clientId?: string;
}

export default function CompanyInformation({ 
  companyName = "",
  industry = "",
  email = "",
  logo,
  currency = "USD",
  onCurrencyChange,
  onLogoUpload
}: CompanyInformationProps) {
  const [currentCurrency, setCurrentCurrency] = useState(currency || 'USD');

  const getLogoUrl = (filePath: string): string | null => {
    if (!filePath) return null;
    
    if (filePath.startsWith('data:')) {
      return filePath;
    }
    
    const match = filePath.match(/profiles[\\\/]([^\\\/]+)[\\\/]/);
    if (match && match[1]) {
      const userId = match[1];
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('authToken');
      if (token) {
        return `${baseUrl}/api/profile/${userId}/image`;
      }
    }
    
    return null;
  };

  // Update currency when prop changes
  const handleCurrencyChange = (newCurrency: string) => {
    setCurrentCurrency(newCurrency);
    onCurrencyChange?.(newCurrency);
  };

  useEffect(() => {
    console.log('CompanyInformation: logo prop:', logo);
    console.log('CompanyInformation: getLogoUrl result:', getLogoUrl(logo || ''));
  }, [logo]);
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-brand-700">Company Information</h2>
          <p className="text-brand-700 text-sm">Your company details and contact information</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full">
          <div className="text-center text-brand-700 font-medium text-lg">Company Name</div>
          <div className="text-center text-brand-700 font-medium text-lg">Industry</div>
          <div className="text-center text-brand-700 font-medium text-lg">Email</div>
          <div className="text-center text-brand-700 font-medium text-lg">Currency</div>
          <div className="text-center text-brand-700 font-medium text-lg">Company Logo</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full">
          <div className="text-center">
            <div className="font-semibold text-brand-600 mt-3">{companyName || 'No Company Name'}</div>
          </div>

          <div className="text-center">
            <div className="mt-3 px-3 py-1 bg-brand-100 text-brand-600 rounded-full text-sm font-medium inline-block">
              {industry || 'No Industry'}
            </div>
          </div>

          <div className="text-center">
            <div className="mt-3 flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 text-brand-600" />
              <span className="font-semibold text-brand-600">{email || 'No Email'}</span>
            </div>
          </div>

          <div className="text-center">
            <div className="mt-3 flex items-center justify-center gap-1">
              <input
                type="text"
                value={currentCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                placeholder="USD"
                className="bg-brand-100 text-brand-600 rounded-full px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-brand-200 transition-colors w-16 text-center border-0"
              />
            </div>
          </div>

          <div className="text-center">
            {onLogoUpload ? (
              <LogoUpload
                currentLogo={logo}
                companyName={companyName}
                onUpload={onLogoUpload}
                size="md"
                disabled={false}
              />
            ) : (
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                  {getLogoUrl(logo || '') || (logo && logo.startsWith('data:')) ? (
            <AuthenticatedImage
              key={logo}
              src={getLogoUrl(logo || '') || logo || ''}
              alt={`${companyName} logo`}
              className="w-full h-full object-cover"
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-sm rounded-full">
                  {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
                </div>
              }
            />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-sm rounded-full">
                      {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

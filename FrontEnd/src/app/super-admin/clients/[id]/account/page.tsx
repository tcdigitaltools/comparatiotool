'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AccountHeader from '@/features/admin/account/components/AccountHeader';
import CompanyInformation from '@/features/admin/account/components/CompanyInformation';
import PerformanceRatingScale from '@/features/admin/account/components/PerformanceRatingScale';
import { api } from '@/lib/api/client';
import { ProfileResponse } from '@/lib/api/types';
import { authService } from '@/lib/api/services/auth';

export default function ClientAccountPage() {
  const params = useParams();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load client data from API
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<ProfileResponse>(`/api/profile/${clientId}`);
        setClient(response.data);
        setError(null);
      } catch {
        setError('Failed to load client data');
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-brand-700">Loading client data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-700 mb-2">Error Loading Client</h1>
          <p className="text-brand-700">{error}</p>
        </div>
      </div>
    );
  }

  // Client not found
  if (!client) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-700 mb-2">Client Not Found</h1>
          <p className="text-brand-700">The requested client account could not be found.</p>
        </div>
      </div>
    );
  }

  // Handle rating scale changes
  const handleScaleChange = async (newScale: string) => {
    try {
      // Convert display format to API format
      const apiScale = newScale === '3/5' ? 'THREE_POINT' : 'FIVE_POINT';
      
      // Update via API - send all required fields to avoid validation errors
      await api.put(`/api/profile/${clientId}`, {
        fullName: client?.fullName || '',
        email: client?.email || '',
        companyName: client?.companyName || '',
        industry: client?.industry || '',
        avatarUrl: client?.avatarUrl,
        performanceRatingScale: apiScale,
        currency: client?.currency
      });
    
    // Update local state
      setClient({ ...client, performanceRatingScale: apiScale });
      
    } catch {
      setError('Failed to update rating scale. Please try again.');
    }
  };

  // Handle currency changes
  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      // For now, only allow valid currency codes that exist in the backend enum
      const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'AED', 'SAR', 'EGP', 'ZAR', 'INR', 'SGD', 'HKD', 'KRW', 'SEK', 'NOK', 'DKK', 'PLN', 'BRL', 'MXN', 'CLP', 'ARS'];
      
      const currencyToSend = validCurrencies.includes(newCurrency.toUpperCase()) 
        ? newCurrency.toUpperCase() 
        : 'USD'; // Default to USD if invalid currency
      
      // Update via API - send all required fields to avoid validation errors
      await api.put(`/api/profile/${clientId}`, {
        fullName: client?.fullName || '',
        email: client?.email || '',
        companyName: client?.companyName || '',
        industry: client?.industry || '',
        avatarUrl: client?.avatarUrl,
        performanceRatingScale: client?.performanceRatingScale,
        currency: currencyToSend
      });
    
      // Update local state
      setClient({ ...client, currency: currencyToSend });
      
    } catch {
      setError('Failed to update currency. Please try again.');
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (file: File): Promise<string> => {
    try {
      // For super admin managing clients, always use the admin endpoint
      // This page is specifically for super admin to manage client accounts
      
      const result = await authService.uploadUserProfileImage(clientId, file);
      
      // Both endpoints now return avatarUrl consistently
      const newAvatarUrl = result.avatarUrl;
      
      // Update client state with new avatar URL to force re-render
      setClient(prevClient => {
        if (!prevClient) return prevClient;
        return {
          ...prevClient,
          avatarUrl: newAvatarUrl
        };
      });
      
      return newAvatarUrl;
    } catch {
      throw new Error('Failed to upload logo. Please try again.');
    }
  };

  // Convert API format to display format for the component
  const getDisplayScale = (apiScale?: string): string => {
    const result = (() => {
      switch (apiScale) {
        case 'THREE_POINT':
          return '3/5';
        case 'FIVE_POINT':
          return '5/5';
        default:
          return '5/5';
      }
    })();
    return result;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AccountHeader 
        companyName={client.companyName}
        industry={client.industry}
        logo={client.avatarUrl}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-6 pt-8">
        <div className="space-y-6">
          <CompanyInformation 
            companyName={client.companyName}
            industry={client.industry}
            email={client.email}
            logo={client.avatarUrl}
            currency={client.currency}
            onCurrencyChange={handleCurrencyChange}
            onLogoUpload={handleLogoUpload}
            isAdmin={true}
            clientId={clientId}
          />
          
          <PerformanceRatingScale 
            currentScale={getDisplayScale(client.performanceRatingScale)}
            onScaleChange={handleScaleChange}
          />
        </div>
      </div>
    </div>
  );
}

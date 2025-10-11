'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { clientsService } from '@/lib/api';
import { ClientAccountSummary } from '@/lib/api/types';
import { ArrowLeft, Settings, Eye, Building2, Mail, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [client, setClient] = useState<ClientAccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientId = params?.id as string;

  // Redirect if not authenticated or not super admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Load client data
  useEffect(() => {
    const loadClient = async () => {
      try {
        setLoading(true);
        const clientData = await clientsService.getClientAdminById(clientId);
        setClient(clientData);
      } catch (error) {
        console.error('Error loading client:', error);
        setError('Failed to load client data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'SUPER_ADMIN' && clientId) {
      loadClient();
    } else if (!clientId) {
      setError('Invalid client ID');
      setLoading(false);
    }
  }, [isAuthenticated, user, clientId]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Client Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The requested client could not be found.'}</p>
            <Link
              href="/super-admin/clients"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Clients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/super-admin/clients"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-brand-500">Client Details</h1>
                  <p className="text-sm text-gray-600">Manage client account</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>{user?.fullName || 'Admin'}</span>
                <span className="text-gray-400">online</span>
              </div>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="space-y-6">
          {/* Client Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start gap-6">
              {/* Client Avatar */}
              <div className="h-20 w-20 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                {(client.companyName || client.contactPerson || 'C').charAt(0).toUpperCase()}
              </div>
              
              {/* Client Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {client.companyName || client.contactPerson}
                  </h2>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    client.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {client.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-lg text-slate-600 mb-4">{client.contactPerson}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-slate-600">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <span className="text-slate-600">{client.industry || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-slate-600">Role: CLIENT_ADMIN</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-slate-600">Contact: {client.contactPerson}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href={`/super-admin/clients/${clientId}/matrix`}
              className="flex items-center gap-3 p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-brand-100 flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Manage Matrix</h3>
                <p className="text-sm text-slate-500">Configure adjustment matrices</p>
              </div>
            </Link>

            <Link
              href={`/super-admin/clients/${clientId}/account`}
              className="flex items-center gap-3 p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">View Account</h3>
                <p className="text-sm text-slate-500">View detailed account information</p>
              </div>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Account Status</h3>
              <p className="text-2xl font-bold text-slate-900">
                {client.active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Industry</h3>
              <p className="text-2xl font-bold text-slate-900">
                {client.industry || 'N/A'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Role</h3>
              <p className="text-2xl font-bold text-slate-900">
                CLIENT_ADMIN
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
